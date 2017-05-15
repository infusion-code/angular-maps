import { Injectable, NgZone } from "@angular/core";
import { Observer } from "rxjs/Observer";
import { Observable } from "rxjs/Observable";
import { ILatLong } from "../interfaces/ilatlong";
import { IMarkerOptions } from "../interfaces/imarkeroptions";
import { IPoint } from "../interfaces/ipoint";
import { MapMarker } from "../components/mapmarker";
import { MarkerService } from "../services/markerservice";
import { MapService } from "../services/mapservice";
import { LayerService } from "../services/layerservice";
import { Marker } from "../models/marker";
import { BingMapService } from "./bingmapservice";
import { BingConversions } from "./bingconversions";

@Injectable()
export class BingMarkerService implements MarkerService {

    private _markers: Map<MapMarker, Promise<Marker>> = new Map<MapMarker, Promise<Marker>>();

    constructor(private _mapService: MapService, private _layerService: LayerService, private _zone: NgZone) { }

    public AddMarker(marker: MapMarker) {
        let o: IMarkerOptions = {
            position: { latitude: marker.latitude, longitude: marker.longitude },
            title: marker.title,
            label: marker.label,
            draggable: marker.draggable,
            icon: marker.iconUrl,
            iconInfo: marker.iconInfo
        };
        if (marker.width) o.width = marker.width;
        if (marker.height) o.height = marker.height;
        if (marker.anchor) o.anchor = marker.anchor;
        const markerPromise = marker.InCustomLayer? this._layerService.CreateMarker(marker.LayerId, o) : this._mapService.CreateMarker(o);
        this._markers.set(marker, markerPromise);
        if (marker.iconInfo) markerPromise.then((m: Marker) => {
            // update iconInfo to provide hook to do post icon creation activities and
            // also re-anchor the marker 
            marker.DynamicMarkerCreated.emit(o.iconInfo);
            let p: IPoint = {
                x: (o.iconInfo.size && o.iconInfo.markerOffsetRatio) ? (o.iconInfo.size.width * o.iconInfo.markerOffsetRatio.x) : 0,
                y: (o.iconInfo.size && o.iconInfo.markerOffsetRatio) ? (o.iconInfo.size.height * o.iconInfo.markerOffsetRatio.y) : 0,
            }
            m.SetAnchor(p);
        });
    }

    public CreateEventObservable<T>(eventName: string, marker: MapMarker): Observable<T> {
        return Observable.create((observer: Observer<T>) => {
            this._markers.get(marker).then((m: Marker) => {
                m.AddListener(eventName, (e: T) => this._zone.run(() => observer.next(e)));
            });
        });
    }

    public DeleteMarker(marker: MapMarker): Promise<void> {
        const m = this._markers.get(marker);
        if (m == null) {
            return Promise.resolve();
        }
        return m.then((m: Marker) => {
            return this._zone.run(() => {
                m.DeleteMarker();
                this._markers.delete(marker);
            });
        });
    }

    public GetNativeMarker(marker: MapMarker): Promise<Marker> {
        return this._markers.get(marker);
    }

    public LocationToPoint(marker: MapMarker): Promise<IPoint> {
        return this._markers.get(marker).then((m: Marker) => {
            let l: ILatLong = m.Location;
            let p: Promise<IPoint> = this._mapService.LocationToPoint(l);
            return p;
        });
    }

    public UpdateAnchor(marker: MapMarker): Promise<void> {
        return this._markers.get(marker).then((m: Marker) => {
            m.SetAnchor(marker.anchor);
        });
    }

    public UpdateMarkerPosition(marker: MapMarker): Promise<void> {
        return this._markers.get(marker).then(
            (m: Marker) => m.SetPosition({
                latitude: marker.latitude,
                longitude: marker.longitude
            }));
    }

    public UpdateTitle(marker: MapMarker): Promise<void> {
        return this._markers.get(marker).then((m: Marker) => m.SetTitle(marker.title));
    }

    public UpdateLabel(marker: MapMarker): Promise<void> {
        return this._markers.get(marker).then((m: Marker) => { m.SetLabel(marker.label); });
    }

    public UpdateDraggable(marker: MapMarker): Promise<void> {
        return this._markers.get(marker).then((m: Marker) => m.SetDraggable(marker.draggable));
    }

    public UpdateIcon(marker: MapMarker): Promise<void> {
        return this._markers.get(marker).then((m: Marker) => {
            if (marker.iconInfo) {
                let x: IMarkerOptions = {
                    position: { latitude: marker.latitude, longitude: marker.longitude },
                    iconInfo: marker.iconInfo
                }
                let o: Microsoft.Maps.IPushpinOptions = BingConversions.TranslateMarkerOptions(x);
                m.SetIcon(o.icon);
                marker.DynamicMarkerCreated.emit(x.iconInfo);
            }
            else {
                m.SetIcon(marker.iconUrl)
            }

        });
    }

}