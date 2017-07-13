import { ILatLong } from './ilatlong';
import { IPoint } from './ipoint';
import { IMarkerIconInfo } from './imarker-icon-info';

export interface IMarkerOptions {
    anchor?: IPoint;
    position: ILatLong;
    title?: string;
    text?: string;
    label?: string;
    draggable?: boolean;
    isFirst?: boolean;
    isLast?: boolean;
    icon?: string | IMarkerIconInfo;
    width?: number;
    height?: number;
    iconInfo?: IMarkerIconInfo;
    metadata?: Map<string, any>;
    visible?: boolean;
}
