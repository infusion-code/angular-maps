import { ILatLong } from './ilatlong';

export interface IPolygonOptions {
    id: number;
    clickable?: boolean;
    draggable?: boolean;
    editable?: boolean;
    fillColor?: string;
    fillOpacity?: number;
    geodesic?: boolean;
    paths?: Array<ILatLong> | Array<Array<ILatLong>>;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    visible?: boolean;
    zIndex?: number;
}
