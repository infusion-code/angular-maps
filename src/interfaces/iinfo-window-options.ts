import { IInfoWindowAction } from './iinfo-window-action';
import { IPoint } from './ipoint';
import { ILatLong } from './ilatlong';

export interface IInfoWindowOptions {
    title?: string;
    description?: string;
    disableAutoPan?: boolean;
    width?: number;
    maxWidth?: number;
    height?: number;
    htmlContent?: string;
    pixelOffset?: IPoint;
    position?: ILatLong;
    zIndex?: number;
    actions?: IInfoWindowAction[];
    visible?: boolean;
}
