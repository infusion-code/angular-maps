import { MapMarkerDirective } from '../components/map-marker';
import { Marker } from '../models/marker';
import { ILatLong } from './ilatlong';
import { IPoint } from './ipoint';

export interface IMarkerEvent {
    Marker: MapMarkerDirective|Marker;
    Click: MouseEvent;
    Location: ILatLong;
    Pixels: IPoint;
}
