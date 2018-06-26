import { IPoint } from './ipoint';
import { ISize } from './isize';
import { MarkerTypeId } from '../models/marker-type-id';

export interface IMarkerIconInfo {

    /**
     * Set the id on a marker icon to allow reuse across markers. For markers that are
     * conavas bases this can provide a significant performance increase if a large number
     * of markers are used.
     *
     * @memberof IMarkerIconInfo
     */
    id?: string;

    markerType: MarkerTypeId;
    text?: string;
    fontName?: string;
    fontSize?: number;
    color?: string;
    rotation?: number;
    size?: ISize;
    drawingOffset?: IPoint;
    textOffset?: IPoint;
    markerOffsetRatio?: IPoint;
    points?: Array<IPoint>;
    strokeWidth?: number;
    url?: string;
    scaledSize?: ISize;
    scale?: number;
}
