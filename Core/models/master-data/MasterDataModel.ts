import AircraftTypeModel from './AircraftTypeModel';
import AircraftRegisterModel from './AircraftRegisterModel';
import AirportModel from './AirportModel';
import SeasonTypeModel from './SeasonTypeModel';
import SeasonModel from './SeasonModel';
import StcModel from './StcModel';
import AircraftRegisterGroupModel from './AircraftRegisterGroupModel';
import ConstraintTemplateModel from './ConstraintTemplateModel';
import ConstraintModel from './ConstraintModel';

export default interface MasterDataModel {
  readonly aircraftTypes?: readonly AircraftTypeModel[];
  readonly aircraftRegisters?: readonly AircraftRegisterModel[];
  readonly airports?: readonly AirportModel[];
  readonly seasonTypes?: readonly SeasonTypeModel[];
  readonly seasons?: readonly SeasonModel[];
  readonly stcs?: readonly StcModel[];
  readonly aircraftRegisterGroups?: readonly AircraftRegisterGroupModel[];
  readonly constraintTemplates?: readonly ConstraintTemplateModel[];
  readonly constraints?: readonly ConstraintModel[];
}
