import { MapMarker } from "../components/mapmarker";
import { ILatLong } from "./ilatlong";
import { IPoint } from "./ipoint";

export interface IMarkerEvent {
    Marker: MapMarker;
    Click: MouseEvent;
    Location: ILatLong;
    Pixels: IPoint;
}