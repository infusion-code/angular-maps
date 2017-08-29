﻿import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';
import { IPoint } from '../../interfaces/ipoint';
import { ILatLong } from '../../interfaces/ilatlong';
import { IMarkerOptions } from '../../interfaces/imarker-options';
import { Marker } from '../../models/marker';
import { MapMarkerDirective } from '../../components/map-marker'
import { MarkerService } from '../marker.service';
import { MapService } from '../map.service';
import { LayerService } from '../layer.service';
import { ClusterService } from '../cluster.service';
import * as GoogleMapTypes from '../../services/google/google-map-types';
import { GoogleConversions } from './google-conversions';

/**
 * Concrete implementation of the MarkerService abstract class for Google.
 *
 * @export
 * @class GoogleMarkerService
 * @implements {MarkerService}
 */
@Injectable()
export class GoogleMarkerService implements MarkerService {

    ///
    /// Field declarations
    ///
    private _markers: Map<MapMarkerDirective, Promise<Marker>> = new Map<MapMarkerDirective, Promise<Marker>>();

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of GoogleMarkerService.
     * @param {MapService} _mapService - {@link MapService} instance.
     * The concrete {@link GoogleMapService} implementation is expected.
     * @param {LayerService} _layerService - {@link LayerService} instance.
     * The concrete {@link GoogleLayerService} implementation is expected.
     * @param {ClusterService} _clusterService - {@link ClusterService} instance.
     * The concrete {@link GoogleClusterService} implementation is expected.
     * @param {NgZone} _zone - NgZone instance to support zone aware promises.
     *
     * @memberof GoogleMarkerService
     */
    constructor(private _mapService: MapService,
        private _layerService: LayerService,
        private _clusterService: ClusterService,
        private _zone: NgZone) {
    }

    /**
     * Adds a marker. Depending on the marker context, the marker will either by added to the map or a correcsponding layer.
     *
     * @param {MapMarkerDirective} marker - The {@link MapMarkerDirective} to be added.
     * @memberof GoogleMarkerService
     */
    public AddMarker(marker: MapMarkerDirective): void {
        const o: IMarkerOptions = {
            anchor: marker.Anchor,
            position: { latitude: marker.Latitude, longitude: marker.Longitude },
            title: marker.Title,
            label: marker.Label,
            draggable: marker.Draggable,
            icon: marker.IconUrl,
            iconInfo: marker.IconInfo,
            width: marker.Width,
            height: marker.Height,
            isFirst: marker.IsFirstInSet,
            isLast: marker.IsLastInSet
        }

        // create marker via promise.
        let markerPromise: Promise<Marker> = null;
        if (marker.InClusterLayer) {
            markerPromise = this._clusterService.CreateMarker(marker.LayerId, o);
        }
        else if (marker.InCustomLayer) {
            markerPromise = this._layerService.CreateMarker(marker.LayerId, o);
        }
        else {
            markerPromise = this._mapService.CreateMarker(o);
        }

        this._markers.set(marker, markerPromise);
        if (marker.IconInfo) {
            markerPromise.then((m: Marker) => {
                // update iconInfo to provide hook to do post icon creation activities and
                // also re-anchor the marker
                marker.DynamicMarkerCreated.emit(o.iconInfo);
                const p: IPoint = {
                    x: (o.iconInfo.size && o.iconInfo.markerOffsetRatio) ? (o.iconInfo.size.width * o.iconInfo.markerOffsetRatio.x) : 0,
                    y: (o.iconInfo.size && o.iconInfo.markerOffsetRatio) ? (o.iconInfo.size.height * o.iconInfo.markerOffsetRatio.y) : 0,
                }
                m.SetAnchor(p);
            });
        }
    };

    /**
     * Registers an event delegate for a marker.
     *
     * @template T - Type of the event to emit.
     * @param {string} eventName - The name of the event to register (e.g. 'click')
     * @param {MapMarkerDirective} marker - The {@link MapMarkerDirective} for which to register the event.
     * @returns {Observable<T>} - Observable emiting an instance of T each time the event occurs.
     * @memberof GoogleMarkerService
     */
    public CreateEventObservable<T>(eventName: string, marker: MapMarkerDirective): Observable<T> {
        return Observable.create((observer: Observer<T>) => {
            this._markers.get(marker).then((m: Marker) => {
                m.AddListener(eventName, (e: T) => this._zone.run(() => observer.next(e)));
            });
        });
    };

    /**
     * Deletes a marker.
     *
     * @param {MapMarkerDirective} marker - {@link MapMarkerDirective} to be deleted.
     * @returns {Promise<void>} - A promise fullfilled once the marker has been deleted.
     * @memberof GoogleMarkerService
     */
    public DeleteMarker(marker: MapMarkerDirective): Promise<void> {
        const m = this._markers.get(marker);
        if (m == null) {
            return Promise.resolve();
        }
        return m.then((ma: Marker) => {
            return this._zone.run(() => {
                ma.DeleteMarker();
                this._markers.delete(marker);
            });
        });
    };

    /**
     * Obtains geo coordinates for the marker on the click location
     *
     * @param {(MouseEvent| any)} e - The mouse event.
     * @returns {ILatLong} - {@link ILatLong} containing the geo coordinates of the clicked marker.
     * @memberof GoogleMarkerService
     */
    public GetCoordinatesFromClick(e: MouseEvent | any): ILatLong {
        if (!e) {
            return null;
        }
        if (!e.latLng) {
            return null;
        }
        if (!e.latLng.lat || !e.latLng.lng) {
            return null;
        }
        return { latitude: e.latLng.lat(), longitude: e.latLng.lng() };
    };

    /**
     * Obtains the marker model for the marker allowing access to native implementation functionatiliy.
     *
     * @param {MapMarkerDirective} marker - The {@link MapMarkerDirective} for which to obtain the marker model.
     * @returns {Promise<Marker>} - A promise that when fullfilled contains the {@link Marker} implementation of the underlying platform.
     * @memberof GoogleMarkerService
     */
    public GetNativeMarker(marker: MapMarkerDirective): Promise<Marker> {
        return this._markers.get(marker);
    };

    /**
     * Obtains the marker pixel location for the marker on the click location
     *
     * @param {(MouseEvent| any)} e - The mouse event.
     * @returns {IPoint} - {@link ILatLong} containing the pixels of the marker on the map canvas.
     * @memberof GoogleMarkerService
     */
    public GetPixelsFromClick(e: MouseEvent | any): IPoint {
        return { x: 0, y: 0 };
    };

    /**
     * Converts a geo location to a pixel location relative to the map canvas.
     *
     * @param {(MapMarkerDirective | ILatLong)} target - Either a {@link MapMarkerDirective}
     * or a {@link ILatLong} for the basis of translation.
     * @returns {Promise<IPoint>} - A promise that when fullfilled contains a {@link IPoint}
     * with the pixel coordinates of the MapMarker or ILatLong relative to the map canvas.
     * @memberof GoogleMarkerService
     */
    public LocationToPoint(target: MapMarkerDirective | ILatLong): Promise<IPoint> {
        if (target == null) {
            return Promise.resolve(null);
        }
        if (target instanceof MapMarkerDirective) {
            return this._markers.get(target).then((m: Marker) => {
                const l: ILatLong = m.Location;
                const p: Promise<IPoint> = this._mapService.LocationToPoint(l);
                return p;
            });
        }
        return this._mapService.LocationToPoint(target);
    };

    /**
     * Updates the anchor position for the marker.
     *
     * @param {MapMarkerDirective} - The {@link MapMarkerDirective} object for which to upate the anchor.
     * Anchor information is present in the underlying {@link Marker} model object.
     * @returns {Promise<void>} - A promise that is fullfilled when the anchor position has been updated.
     * @memberof GoogleMarkerService
     */
    public UpdateAnchor(marker: MapMarkerDirective): Promise<void> {
        return this._markers.get(marker).then((m: Marker) => {
            m.SetAnchor(marker.Anchor);
        });
    };

    /**
     * Updates whether the marker is draggable.
     *
     * @param {MapMarkerDirective} - The {@link MapMarkerDirective} object for which to upate dragability.
     * Dragability information is present in the underlying {@link Marker} model object.
     * @returns {Promise<void>} - A promise that is fullfilled when the marker has been updated.
     * @memberof GoogleMarkerService
     */
    public UpdateDraggable(marker: MapMarkerDirective): Promise<void> {
        return this._markers.get(marker).then((m: Marker) => m.SetDraggable(marker.Draggable));
    };

    /**
     * Updates the Icon on the marker.
     *
     * @param {MapMarkerDirective} - The {@link MapMarkerDirective} object for which to upate the icon. Icon information is present
     * in the underlying {@link Marker} model object.
     * @returns {Promise<void>} - A promise that is fullfilled when the icon information has been updated.
     * @memberof GoogleMarkerService
     */
    public UpdateIcon(marker: MapMarkerDirective): Promise<void> {
        return this._markers.get(marker).then((m: Marker) => {
            if (marker.IconInfo) {
                const x: IMarkerOptions = {
                    position: { latitude: marker.Latitude, longitude: marker.Longitude },
                    iconInfo: marker.IconInfo
                }
                const o: GoogleMapTypes.MarkerOptions = GoogleConversions.TranslateMarkerOptions(x);
                m.SetIcon(o.icon);
                marker.DynamicMarkerCreated.emit(x.iconInfo);
            } else {
                m.SetIcon(marker.IconUrl)
            }

        });
    };

    /**
     * Updates the label on the marker.
     *
     * @param {MapMarkerDirective} - The {@link MapMarkerDirective} object for which to upate the label.
     * Label information is present in the underlying {@link Marker} model object.
     * @returns {Promise<void>} - A promise that is fullfilled when the label has been updated.
     * @memberof GoogleMarkerService
     */
    public UpdateLabel(marker: MapMarkerDirective): Promise<void> {
        return this._markers.get(marker).then((m: Marker) => { m.SetLabel(marker.Label); });
    };

    /**
     * Updates the geo coordinates for the marker.
     *
     * @param {MapMarkerDirective} - The {@link MapMarkerDirective} object for which to upate the coordinates.
     * Coordinate information is present in the underlying {@link Marker} model object.
     * @returns {Promise<void>} - A promise that is fullfilled when the position has been updated.
     * @memberof GoogleMarkerService
     */
    public UpdateMarkerPosition(marker: MapMarkerDirective): Promise<void> {
        return this._markers.get(marker).then(
            (m: Marker) => m.SetPosition({
                latitude: marker.Latitude,
                longitude: marker.Longitude
            }));
    };

    /**
     * Updates the title on the marker.
     *
     * @param {MapMarkerDirective} - The {@link MapMarkerDirective} object for which to upate the title.
     * Title information is present in the underlying {@link Marker} model object.
     * @returns {Promise<void>} - A promise that is fullfilled when the title has been updated.
     * @memberof GoogleMarkerService
     */
    public UpdateTitle(marker: MapMarkerDirective): Promise<void> {
        return this._markers.get(marker).then((m: Marker) => m.SetTitle(marker.Title));
    };

    /**
     * Updates the visibility on the marker.
     *
     * @param {MapMarkerDirective} - The {@link MapMarkerDirective} object for which to upate the title.
     * Title information is present in the underlying {@link Marker} model object.
     * @returns {Promise<void>} - A promise that is fullfilled when the title has been updated.
     * @memberof GoogleMarkerService
     */
    public UpdateVisible(marker: MapMarkerDirective): Promise<void> {
        return this._markers.get(marker).then((m: Marker) => m.SetVisible(marker.Visible));
    };

}
