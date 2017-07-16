import { ILatLong } from './ilatlong';

export interface IBox {
    maxLatitude: number;
    maxLongitude: number;
    minLatitude: number;
    minLongitude: number;
    center?: ILatLong;
    padding?: number;
}
