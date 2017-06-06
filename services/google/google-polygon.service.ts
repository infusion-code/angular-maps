import { ILatLong } from './../../interfaces/Ilatlong';
import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { IPolygonOptions } from '../../interfaces/ipolygonoptions';
import { Polygon } from '../../models/polygon';
import { MapPolygonDirective } from '../../components/mappolygon';
import { PolygonService } from '../polygonservice';
import { MapService } from '../mapservice';
import { LayerService } from '../layerservice';
/**
 * Concrete implementation of the Polygon Service abstract class for Google Maps.
 *
 * @export
 * @class GooglePolygonService
 * @implements {PolygonService}
 */
@Injectable()
export class GooglePolygonService implements PolygonService {

    ///
    /// Field declarations
    ///
    private _polygons: Map<MapPolygonDirective, Promise<Polygon>> = new Map<MapPolygonDirective, Promise<Polygon>>();

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of GooglePolygonService.
     * @param {MapService} _mapService - {@link MapService} instance. The concrete {@link GoogleMapService} implementation is expected.
     * @param {LayerService} _layerService - {@link GoolgeLayerService} instance.
     * The concrete {@link BingLayerService} implementation is expected.
     * @param {NgZone} _zone - NgZone instance to support zone aware promises.
     *
     * @memberof GooglePolygonService
     */
    constructor(private _mapService: MapService,
        private _layerService: LayerService,
        private _zone: NgZone) {
    }

    ///
    /// Public members and MarkerService implementation
    ///

    /**
     * Adds a polygon to a map. Depending on the polygon context, the polygon will either by added to the map or a
     * correcsponding layer.
     *
     * @param {MapPolygonDirective} polygon - The {@link MapPolygonDirective} to be added.
     *
     * @memberof GooglePolygonService
     */
    public AddPolygon(polygon: MapPolygonDirective): void {
        const o: IPolygonOptions = {
            id: polygon.Id,
            clickable: polygon.Clickable,
            draggable: polygon.Draggable,
            editable: polygon.Editable,
            fillColor: polygon.FillColor,
            fillOpacity: polygon.FillOpacity,
            geodesic: polygon.Geodesic,
            paths: polygon.Paths,
            strokeColor: polygon.StrokeColor,
            strokeOpacity: polygon.StrokeOpacity,
            strokeWeight: polygon.StrokeWeight,
            visible: polygon.Visible,
            zIndex: polygon.zIndex,
        }
        const polygonPromise: Promise<Polygon> = this._mapService.CreatePolygon(o);
        this._polygons.set(polygon, polygonPromise);
    }

    /**
      * Registers an event delegate for a marker.
      *
      * @template T - Type of the event to emit.
      * @param {string} eventName - The name of the event to register (e.g. 'click')
      * @param {MapPolygonDirective} polygon - The {@link MapPolygonDirective} for which to register the event.
      * @returns {Observable<T>} - Observable emiting an instance of T each time the event occurs.
      *
      * @memberof GooglePolygonService
      */
    public CreateEventObservable<T>(eventName: string, polygon: MapPolygonDirective): Observable<T> {
        return Observable.create((observer: Observer<T>) => {
            this._polygons.get(polygon).then((p: Polygon) => {
                p.AddListener(eventName, (e: T) => this._zone.run(() => observer.next(e)));
            });
        });
    }

    /**
      * Deletes a polygon.
      *
      * @param {MapPolygonDirective} polygon - {@link MapPolygonDirective} to be deleted.
      * @returns {Promise<void>} - A promise fullfilled once the polygon has been deleted.
      *
      * @memberof GooglePolygonService
      */
    public DeletePolygon(polygon: MapPolygonDirective): Promise<void> {
        const m = this._polygons.get(polygon);
        if (m == null) {
            return Promise.resolve();
        }
        return m.then((l: Polygon) => {
            return this._zone.run(() => {
                l.Delete();
                this._polygons.delete(polygon);
            });
        });

    };

    /**
     * Obtains geo coordinates for the marker on the click location
     *
     * @abstract
     * @param {(MouseEvent| any)} e - The mouse event.
     * @returns {ILatLong} - {@link ILatLong} containing the geo coordinates of the clicked marker.
     *
     * @memberof MarkerService
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
     * @param {MapPolygonDirective} polygon - The {@link MapPolygonDirective} for which to obtain the polygon model.
     * @returns {Promise<Polygon>} - A promise that when fullfilled contains the {@link Polygon} implementation of the underlying platform.
     *
     * @memberof GooglePolygonService
     */
    public GetNativeMarker(polygon: MapPolygonDirective): Promise<Polygon> {
        return this._polygons.get(polygon);
    }

    /**
     * Set the polygon options.
     *
     * @param {MapPolygonDirective} polygon - {@link MapPolygonDirective} to be updated.
     * @param {IPolygonOptions} options - {@link IPolygonOptions} object containing the options. Options will be merged with the
     * options already on the underlying object.
     * @returns {Promise<void>} - A promise fullfilled once the polygon options have been set.
     *
     * @memberof GooglePolygonService
     */
    public SetOptions(polygon: MapPolygonDirective, options: IPolygonOptions): Promise<void> {
        return this._polygons.get(polygon).then((l: Polygon) => { l.SetOptions(options); });
    }

    /**
     * Updates the Polygon path
     *
     * @param {MapPolygonDirective} polygon - {@link MapPolygonDirective} to be updated.
     * @returns {Promise<void>} - A promise fullfilled once the polygon has been updated.
     *
     * @memberof GooglePolygonService
     */
    public UpdatePolygon(polygon: MapPolygonDirective): Promise<void> {
        const m = this._polygons.get(polygon);
        if (m == null) {
            return Promise.resolve();
        }
        return m.then((l: Polygon) => this._zone.run(() => { l.SetPaths(polygon.Paths); }));
    }

}
