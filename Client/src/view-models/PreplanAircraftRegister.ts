import AircraftRegisterStatus from '@core/types/aircraft-register-options/AircraftRegisterStatus';
import AircraftIdentity from 'src/view-models/AircraftIdentity';
import AircraftSelection from 'src/view-models/AircraftSelection';
import DummyAircraftRegisterModel from '@core/models/DummyAircraftRegisterModel';
import { AircraftRegisterOptionsDictionaryModel } from '@core/models/AircraftRegisterOptionsModel';
import MasterData, { MasterDataItem, MasterDataItems, AircraftType } from '@core/master-data';
import AircraftRegisterOptions, { AircraftRegisterOptionsDictionary } from './AircraftRegisterOptions';

/**
 * An enhanced aircraft register capable of presenting both master data and dummy aircraft registers.
 */
export default class PreplanAircraftRegister implements MasterDataItem {
  /**
   * The id of the corresponding aircraft registrer in the master data or
   * a prefix 'dummy-' followed by the id (no.) of the dummy aircraft register
   * within the loaded preplan.
   */
  readonly id: string;

  readonly name: string;
  readonly aircraftType: AircraftType;

  /**
   * Whether this enhanced aircraft register is a dummy one or not.
   */
  readonly dummy: boolean;

  readonly options: AircraftRegisterOptions;

  constructor(id: string, name: string, aircraftType: AircraftType, dummy: boolean, options?: AircraftRegisterOptions) {
    this.id = id;
    this.name = name;
    this.aircraftType = aircraftType;
    this.dummy = dummy;
    this.options = options || AircraftRegisterOptions.default;
  }

  getMinimumGroundTime(date: Date, transit: boolean, international: boolean): number {
    return this.aircraftType.getMinimumGroundTime(date, transit, international);
  }
}

/**
 * Encapsulates all master data and dummy aircraft registers as a single collection.
 */
export class PreplanAircraftRegisters extends MasterDataItems<PreplanAircraftRegister> {
  constructor(dummyAircraftRegisters: readonly DummyAircraftRegisterModel[], aircraftRegisterOptionsDictionary: AircraftRegisterOptionsDictionaryModel) {
    const dictionary = new AircraftRegisterOptionsDictionary(aircraftRegisterOptionsDictionary);
    let masterDataItems = MasterData.all.aircraftRegisters.items.map(a => new PreplanAircraftRegister(a.id, a.name, a.aircraftType, false, dictionary[a.id]));
    let dummyItems = dummyAircraftRegisters.map(a => new PreplanAircraftRegister(a.id, a.name, MasterData.all.aircraftTypes.id[a.aircraftTypeId], true, dictionary[a.id]));
    super(masterDataItems.concat(dummyItems));
  }
}
