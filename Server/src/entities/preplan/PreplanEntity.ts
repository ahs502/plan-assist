import PreplanHeaderEntity, { convertPreplanHeaderEntityToModel } from './PreplanHeaderEntity';
import { Xml, xmlParse, xmlArray, xmlStringify } from 'src/utils/xml';
import PreplanModel from '@core/models/preplan/PreplanModel';
import { convertDummyAircraftRegisterEntityToModel, convertDummyAircraftRegisterModelToEntity } from './DummyAircraftRegisterEntity';
import FlightRequirementEntity, { convertFlightRequirementEntityToModel } from 'src/entities/flight-requirement/FlightRequirementEntity';
import { convertAircraftRegisterOptionsEntityToModel, convertAircraftRegisterOptionsModelToEntity } from './AircraftRegisterOptionsEntity';
import DummyAircraftRegisterModel from '@core/models/preplan/DummyAircraftRegisterModel';
import AircraftRegisterOptionsModel from '@core/models/preplan/AircraftRegisterOptionsModel';

export default interface PreplanEntity extends PreplanHeaderEntity {
  readonly dummyAircraftRegistersXml: Xml;
  readonly aircraftRegisterOptionsXml: Xml;
}

export function convertPreplanEntityToModel(data: PreplanEntity, flightRequirements: readonly FlightRequirementEntity[]): PreplanModel {
  return {
    ...convertPreplanHeaderEntityToModel(data),
    dummyAircraftRegisters: parsePreplanDummyAircraftRegistersXml(data.dummyAircraftRegistersXml),
    aircraftRegisterOptions: parsePreplanAircraftRegisterOptionsXml(data.aircraftRegisterOptionsXml),
    flightRequirements: flightRequirements.map(convertFlightRequirementEntityToModel)
  };
}

export function stringifyPreplanDummyAircraftRegistersXml(data: readonly DummyAircraftRegisterModel[]): Xml {
  return xmlStringify({ DummyAircraftRegister: data.map(convertDummyAircraftRegisterModelToEntity) }, 'DummyAircraftRegisters');
}
export function parsePreplanDummyAircraftRegistersXml(data: Xml): readonly DummyAircraftRegisterModel[] {
  return xmlArray(xmlParse(data, 'DummyAircraftRegisters')['DummyAircraftRegister']).map(convertDummyAircraftRegisterEntityToModel);
}

export function stringifyPreplanAircraftRegisterOptionsXml(data: AircraftRegisterOptionsModel): Xml {
  return xmlStringify(convertAircraftRegisterOptionsModelToEntity(data), 'AircraftRegisterOptions');
}
export function parsePreplanAircraftRegisterOptionsXml(data: Xml): AircraftRegisterOptionsModel {
  return convertAircraftRegisterOptionsEntityToModel(xmlParse(data, 'AircraftRegisterOptions'));
}
