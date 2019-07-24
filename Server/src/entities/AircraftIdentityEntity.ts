import AircraftIdentityType from '@core/types/aircraft-identity/AircraftIdentityType';
import AircraftIdentityModel from '@core/models/AircraftIdentityModel';

export default interface AircraftIdentityEntity {
  readonly type: AircraftIdentityType;
  readonly name: string;
  readonly entityId: string;
}

export function convertAircraftIdentityEntityToModel(data: AircraftIdentityEntity): AircraftIdentityModel {
  return {
    type: data.type,
    name: data.name,
    entityId: data.entityId
  };
}
