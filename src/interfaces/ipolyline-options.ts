import { ILatLong } from './ilatlong';

export interface IPolylineOptions {
    id: number;
    clickable?: boolean;
    draggable?: boolean;
    editable?: boolean;
    geodesic?: boolean;
    path?: Array<ILatLong> | Array<Array<ILatLong>>;
    showTooltip?: boolean;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    title?: string;
    visible?: boolean;
    zIndex?: number;
}
