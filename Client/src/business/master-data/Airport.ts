import MasterDataItem, { MasterDataItems } from './MasterDataItem';

export default class Airport implements MasterDataItem {
  id: string;
  name: string;

  fullName: string;
  international: boolean;

  constructor(raw: any) {
    this.id = String(raw['id']);
    this.name = String(raw['id']);

    this.fullName = String(raw['fullName']);
    this.international = String(raw['international']) === 'true';
  }
}

export class Airports extends MasterDataItems<Airport> {}
