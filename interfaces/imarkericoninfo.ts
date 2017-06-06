import { IPoint } from './ipoint';
import { ISize } from './isize';
import { MarkerTypeId } from '../models/markertypeid';

export interface IMarkerIconInfo {
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
    callback?: (c: string, i: IMarkerIconInfo) => void;
    scale?: number;
}
