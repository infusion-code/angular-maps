import { Injectable, NgZone } from "@angular/core";
import { Observer } from "rxjs/Observer";
import { Observable } from "rxjs/Observable";
import { IMapOptions } from "../interfaces/imapoptions";
import { ILayerOptions } from "../interfaces/ilayeroptions";
import { ILatLong } from "../interfaces/ilatlong";
import { IPoint } from "../interfaces/ipoint";
import { IMarkerOptions } from "../interfaces/imarkeroptions";
import { IInfoWindowOptions } from "../interfaces/iinfowindowoptions";
import { Marker } from "../models/marker";
import { Layer } from "../models/layer";
import { InfoWindow } from "../models/infowindow"

///
/// Abstract class to implement map api
///
@Injectable()
export abstract class MapService {

    abstract CreateMap(el: HTMLElement, mapOptions: IMapOptions): Promise<void>; 

    abstract DisposeMap(): void;

    abstract SetViewOptions(options: IMapOptions): void;

    abstract SetMapOptions(options: IMapOptions): void;

    abstract CreateLayer(options: ILayerOptions): Promise<Layer>;

    abstract CreateClusterLayer(options: ILayerOptions): Promise<Layer>;

    abstract CreateMarker(options: IMarkerOptions): Promise<Marker>;

    abstract CreateInfoWindow(options?: IInfoWindowOptions): Promise<InfoWindow>;

    abstract DeleteLayer(layer: Layer): Promise<void>;

    abstract SubscribeToMapEvent<E>(eventName: string): Observable<E>;

    abstract SetCenter(latLng: ILatLong): Promise<void>;

    abstract GetZoom(): Promise<number>;

    abstract SetZoom(zoom: number): Promise<void>;

    abstract GetCenter(): Promise<ILatLong>;

    abstract LocationToPoint(loc: ILatLong): Promise<IPoint>;

    abstract TriggerMapEvent(eventName: string): Promise<void>;
}