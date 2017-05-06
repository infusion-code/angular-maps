import { MapMarker } from "../components/mapmarker";

export interface IMarkerEvent {
    Marker: MapMarker;
    Click: MouseEvent;
}