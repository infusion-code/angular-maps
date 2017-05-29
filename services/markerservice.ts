import { Injectable, NgZone } from '@angular/core';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';
import { IPoint } from "../interfaces/ipoint";
import { ILatLong } from "../interfaces/ilatlong";
import { Marker } from '../models/marker';
import { MapMarker } from '../components/mapmarker'

@Injectable()
export abstract class MarkerService {

    public abstract AddMarker(marker: MapMarker): void;

    public abstract CreateEventObservable<T>(eventName: string, marker: MapMarker): Observable<T>;

    public abstract GetCoordinatesFromClick(e: MouseEvent| any): ILatLong;

    public abstract GetNativeMarker(marker: MapMarker): Promise<Marker>;

    public abstract GetPixelsFromClick(e: MouseEvent| any): IPoint;

    public abstract DeleteMarker(marker: MapMarker): Promise<void>;

    public abstract LocationToPoint(marker: MapMarker): Promise<IPoint>;

    public abstract UpdateAnchor(maker: MapMarker): Promise<void>;

    public abstract UpdateMarkerPosition(marker: MapMarker): Promise<void>;

    public abstract UpdateTitle(marker: MapMarker): Promise<void>;

    public abstract UpdateLabel(marker: MapMarker): Promise<void>;

    public abstract UpdateDraggable(marker: MapMarker): Promise<void>;

    public abstract UpdateIcon(marker: MapMarker): Promise<void>;

}