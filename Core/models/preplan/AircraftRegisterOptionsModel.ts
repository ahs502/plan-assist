import AircraftRegisterOptionsStatus, { AircraftRegisterOptionsStatuses } from '@core/types/AircraftRegisterOptionsStatus';
import Id from '@core/types/Id';
import Validation from '@ahs502/validation';
import MasterDataCollection from '@core/types/MasterDataCollection';
import AirportModel from '@core/models/master-data/AirportModel';
import AircraftRegisterModel from '@core/models/master-data/AircraftRegisterModel';

export default interface AircraftRegisterOptionsModel {
  readonly options: readonly {
    readonly aircraftRegisterId: Id;
    readonly status: AircraftRegisterOptionsStatus;
    readonly baseAirportId?: Id;
  }[];
}

export class AircraftRegisterOptionsModelValidation extends Validation {
  constructor(
    data: AircraftRegisterOptionsModel,
    aircraftRegisters: MasterDataCollection<AircraftRegisterModel>,
    airports: MasterDataCollection<AirportModel>,
    dummyAircraftRegisterIds: readonly Id[],
    usedAircraftRegisterIds: readonly Id[]
  ) {
    super(validator =>
      validator.object(data).then(({ options }) => {
        validator
          .array(options)
          .must(options => options.map(o => o.aircraftRegisterId).distinct().length === options.length)
          .each(({ aircraftRegisterId, status, baseAirportId }) => {
            validator
              .must(typeof aircraftRegisterId === 'string', !!aircraftRegisterId)
              .must(() => aircraftRegisterId in aircraftRegisters.id || dummyAircraftRegisterIds.includes(aircraftRegisterId));
            validator.must(AircraftRegisterOptionsStatuses.includes(status)).then(() => {
              validator.if(status !== 'IGNORED').must(() => baseAirportId !== undefined);
              validator.if(status === 'IGNORED').must(() => !usedAircraftRegisterIds.includes(aircraftRegisterId));
            });
            validator
              .if(baseAirportId !== undefined)
              .must(() => typeof baseAirportId === 'string')
              .must(() => baseAirportId! in airports.id);
          });
      })
    );
  }
}
