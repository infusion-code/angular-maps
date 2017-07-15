import { IMarkerIconInfo } from './../interfaces/imarkericoninfo';

export interface IClusterIconInfo {
    url?: string;
    height?: number;
    width?: number;
    anchor?: Array<number>;
    textColor?: string;
    textSize?: number;
    iconInfo?: IMarkerIconInfo;
}
