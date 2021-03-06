import GetAuthenticationModel from '@core/models/authentication/GetAuthenticationModel';
import AuthenticationResultModel from '@core/models/authentication/AuthenticationResultModel';
import persistant from './persistant';
import ServerResult from '@core/types/ServerResult';

export default class RequestManager {
  static requestsCount: number = 0;
  static onProcessingChanged?(processing: boolean): void;

  static async request<R>(service: string, command: string, data?: any): Promise<R> {
    RequestManager.requestsCount++;
    RequestManager.onProcessingChanged && RequestManager.onProcessingChanged(true);
    try {
      const result = await send<R>();
      RequestManager.requestsCount--;
      RequestManager.requestsCount === 0 && RequestManager.onProcessingChanged && RequestManager.onProcessingChanged(false);
      return result;
    } catch (error) {
      RequestManager.requestsCount--;
      RequestManager.requestsCount === 0 && RequestManager.onProcessingChanged && RequestManager.onProcessingChanged(false);
      throw error;
    }

    async function send<R>(): Promise<R> {
      {
        const response = await fetch(`/api/${service}/${command}`, {
          method: 'POST',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json',
            Authentication: persistant.encodedAuthenticationHeader!
          },
          redirect: 'follow',
          body: JSON.stringify(data || {})
        });
        if (response.ok) {
          const result = (await response.json()) as ServerResult<R>;
          if (result.message) throw result.message;
          return result.value!;
        }
        if (response.status !== 401) throw new Error(`Code ${response.status}: ${response.statusText}`);
      }

      // Unauthorized access.

      try {
        const body: GetAuthenticationModel = {
          oauthCode: persistant.oauthCode!,
          refreshToken: persistant.refreshToken
        };
        const refreshTokenResponse = await fetch(`/api/oauth/get-authentication`, {
          method: 'POST',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json'
          },
          redirect: 'follow',
          body: JSON.stringify(body)
        });
        if (!refreshTokenResponse.ok) throw 'Refresh token failed.';
        const authenticationResult: AuthenticationResultModel = await refreshTokenResponse.json();
        persistant.refreshToken = authenticationResult.authentication!.refreshToken;
        persistant.user = authenticationResult.authentication!.user;
        persistant.userSettings = authenticationResult.authentication!.userSettings;
        persistant.encodedAuthenticationHeader = authenticationResult.encodedAuthenticationHeader;
      } catch (refreshTokenFailureReason) {
        console.error('Refresh token failure error', refreshTokenFailureReason);

        // Go to login page:
        delete persistant.oauthCode;
        delete persistant.refreshToken;
        delete persistant.user;
        delete persistant.userSettings;
        delete persistant.encodedAuthenticationHeader;
        window.location.reload();
      }

      // Token is refreshed.

      {
        const response = await fetch(`/api/${service}/${command}`, {
          method: 'POST',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json',
            Authentication: persistant.encodedAuthenticationHeader!
          },
          redirect: 'follow',
          body: JSON.stringify(data || {})
        });
        if (response.ok) {
          const result = (await response.json()) as ServerResult<R>;
          if (result.message) throw result.message;
          return result.value!;
        }
        throw new Error(`Code ${response.status}: ${response.statusText}`);
      }
    }
  }

  static makeRequester(service: string): <R>(command: string, data?: any) => Promise<R> {
    return async (command: string, data?: any) => await RequestManager.request(service, command, data);
  }
}
