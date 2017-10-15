import { MapPolylineDirective } from '../components/map-polyline';
import { Polyline } from '../models/polyline';
import { ILatLong } from './ilatlong';
import { IPoint } from './ipoint';

export interface IPolylineEvent {
    Polyline: MapPolylineDirective|Polyline;
    Click: MouseEvent;
}
