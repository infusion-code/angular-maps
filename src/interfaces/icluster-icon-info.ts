import { IMarkerIconInfo } from './../interfaces/imarker-icon-info';

export interface IClusterIconInfo {
    url?: string;
    height?: number;
    width?: number;
    anchor?: Array<number>;
    textColor?: string;
    textSize?: number;
    iconInfo?: IMarkerIconInfo;
    backgroundPosition?: string;
}
