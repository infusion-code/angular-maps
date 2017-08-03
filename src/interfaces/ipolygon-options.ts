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
    labelMaxZoom?: number;
    labelMinZoom?: number;
    showLabel?: boolean;
    showTooltip?: boolean;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    title?: string;
    visible?: boolean;
    zIndex?: number;
}
