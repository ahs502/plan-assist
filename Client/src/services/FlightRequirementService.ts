import RequestManager from 'src/utils/RequestManager';
import Id from '@core/types/Id';
import NewFlightRequirementModel from '@core/models/flight-requirement/NewFlightRequirementModel';
import FlightRequirementModel from '@core/models/flight-requirement/FlightRequirementModel';
import NewFlightModel from '@core/models/flight/NewFlightModel';
import FlightModel from '@core/models/flight/FlightModel';
import PreplanDataModel from '@core/models/preplan/PreplanDataModel';

const request = RequestManager.makeRequester('flight-requirement');

export default class FlightRequirementService {
  /**
   * Adds a new flight requirement including its flights per day and provides the preplan data model.
   */
  static async add(preplanId: Id, newFlightRequirement: NewFlightRequirementModel, newFlights: readonly NewFlightModel[]): Promise<PreplanDataModel> {
    return await request('add', { preplanId, newFlightRequirement, newFlights });
  }

  /**
   * Removes a flight requirement and its flights per day and provides the preplan data model.
   */
  static async remove(preplanId: Id, id: Id): Promise<PreplanDataModel> {
    return await request('remove', { preplanId, id });
  }

  /**
   * Edits all the given flight requirements and its related flights, adding new created flights and removing droped ones and provides the preplan data model.
   */
  static async edit(preplanId: Id, flightRequirement: FlightRequirementModel, flights: readonly FlightModel[], newFlights: readonly NewFlightModel[]): Promise<PreplanDataModel> {
    return await request('edit', { preplanId, flightRequirement, flights, newFlights });
  }
}
