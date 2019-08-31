import { FlightScopeModel } from '@core/models/flights/FlightScopeModel';
import PreplanAircraftSelection from 'src/view-models/PreplanAircraftSelection';
import FlightTime from './FlightTime';
import { PreplanAircraftRegisters } from '../PreplanAircraftRegister';
import Rsx from '@core/types/flight-requirement/Rsx';
import { parseHHMM } from 'src/utils/model-parsers';
import FlightTimeModel from '@core/models/flights/FlightTimeModel';
import AircraftIdentityModel from '@core/models/AircraftIdentityModel';
import ModelConvertable, { getOverrided, getOverridedArray, getOverridedObject } from 'src/utils/ModelConvertable';
import DeepWritablePartial from '@core/types/DeepWritablePartial';

export default class FlightScope implements ModelConvertable<FlightScopeModel> {
  /** In minutes, greater than 0. */ readonly blockTime: number;
  readonly times: readonly FlightTime[];
  readonly aircraftSelection: PreplanAircraftSelection;
  readonly originPermission: boolean;
  readonly destinationPermission: boolean;
  readonly rsx: Rsx;
  readonly required: boolean;

  constructor(raw: FlightScopeModel, aircraftRegisters: PreplanAircraftRegisters) {
    this.blockTime = raw.blockTime;
    this.times = raw.times.map(t => new FlightTime(t));
    this.aircraftSelection = new PreplanAircraftSelection(raw.aircraftSelection, aircraftRegisters);
    this.originPermission = raw.originPermission;
    this.destinationPermission = raw.destinationPermission;
    this.rsx = raw.rsx;
    this.required = raw.required;
  }

  extractModel(overrides?: DeepWritablePartial<FlightScopeModel>): FlightScopeModel {
    return {
      blockTime: getOverrided(this.blockTime, overrides, 'blockTime'),
      times: getOverridedArray(this.times, overrides, 'times'),
      destinationPermission: getOverrided(this.destinationPermission, overrides, 'destinationPermission'),
      originPermission: getOverrided(this.originPermission, overrides, 'originPermission'),
      required: getOverrided(this.required, overrides, 'required'),
      rsx: getOverrided(this.rsx, overrides, 'rsx'),
      aircraftSelection: getOverridedObject(this.aircraftSelection, overrides, 'aircraftSelection')
    };
  }
}
