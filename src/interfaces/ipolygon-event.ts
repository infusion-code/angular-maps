import { MapPolygonDirective } from '../components/map-polygon';
import { Polygon } from '../models/polygon';
import { ILatLong } from './ilatlong';
import { IPoint } from './ipoint';

export interface IPolygonEvent {
    Polygon: MapPolygonDirective|Polygon;
    Click: MouseEvent;
    OriginalPath?: Array<Array<ILatLong>>;
    NewPath?: Array<Array<ILatLong>>;
}
