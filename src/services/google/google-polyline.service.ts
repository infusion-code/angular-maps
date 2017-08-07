import { ILatLong } from './../../interfaces/ilatlong';
import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { IPolylineOptions } from '../../interfaces/ipolyline-options';
import { Polyline } from '../../models/polyline';
import { MapPolylineDirective } from './../../components/map-polyline';
import { PolylineService } from '../polyline.service';
import { MapService } from '../map.service';
import { LayerService } from '../layer.service';

/**
 * Concrete implementation of the Polyline Service abstract class for Google Maps.
 *
 * @export
 * @class GooglePolylineService
 * @implements {PolylineService}
 */
@Injectable()
export class GooglePolylineService implements PolylineService {

    ///
    /// Field declarations
    ///
    private _polylines: Map<MapPolylineDirective, Promise<Polyline|Array<Polyline>>> =
        new Map<MapPolylineDirective, Promise<Polyline|Array<Polyline>>>();

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of GooglePolylineService.
     * @param {MapService} _mapService - {@link MapService} instance. The concrete {@link GoogleMapService} implementation is expected.
     * @param {LayerService} _layerService - {@link LayerService} instance.
     * The concrete {@link GoogleLayerService} implementation is expected.
     * @param {NgZone} _zone - NgZone instance to support zone aware promises.
     *
     * @memberof GooglePolylineService
     */
    constructor(private _mapService: MapService,
        private _layerService: LayerService,
        private _zone: NgZone) { }

    ///
    /// Public members and MarkerService implementation
    ///

    /**
     * Adds a polyline to a map. Depending on the polyline context, the polyline will either by added to the map or a
     * correcsponding layer.
     *
     * @param {MapPolylineDirective} polyline - The {@link MapPolylineDirective} to be added.
     *
     * @memberof GooglePolylineService
     */
    public AddPolyline(polyline: MapPolylineDirective): void {
        const o: IPolylineOptions = {
            id: polyline.Id,
            clickable: polyline.Clickable,
            draggable: polyline.Draggable,
            editable: polyline.Editable,
            geodesic: polyline.Geodesic,
            path: polyline.Path,
            showTooltip: polyline.ShowTooltip,
            strokeColor: polyline.StrokeColor,
            strokeOpacity: polyline.StrokeOpacity,
            strokeWeight: polyline.StrokeWeight,
            title: polyline.Title,
            visible: polyline.Visible,
            zIndex: polyline.zIndex,
        }
        const polylinePromise: Promise<Polyline|Array<Polyline>> = this._mapService.CreatePolyline(o);
        this._polylines.set(polyline, polylinePromise);
    }

    /**
      * Registers an event delegate for a line.
      *
      * @template T - Type of the event to emit.
      * @param {string} eventName - The name of the event to register (e.g. 'click')
      * @param {MapPolylineDirective} polyline - The {@link MapPolylineDirective} for which to register the event.
      * @returns {Observable<T>} - Observable emiting an instance of T each time the event occurs.
      *
      * @memberof GooglePolylineService
      */
    public CreateEventObservable<T>(eventName: string, polyline: MapPolylineDirective): Observable<T> {
        return Observable.create((observer: Observer<T>) => {
            this._polylines.get(polyline).then(p => {
                const x: Array<Polyline> = Array.isArray(p) ? p : [p];
                x.forEach(line => line.AddListener(eventName, (e: T) => this._zone.run(() => observer.next(e))));
            });
        });
    }

    /**
      * Deletes a polyline.
      *
      * @param {MapPolylineDirective} polyline - {@link MapPolylineDirective} to be deleted.
      * @returns {Promise<void>} - A promise fullfilled once the polyline has been deleted.
      *
      * @memberof GooglePolylineService
      */
    public DeletePolyline(polyline: MapPolylineDirective): Promise<void> {
        const m = this._polylines.get(polyline);
        if (m == null) {
            return Promise.resolve();
        }
        return m.then(l => {
            return this._zone.run(() => {
                const x: Array<Polyline> = Array.isArray(l) ? l : [l];
                x.forEach(line =>  line.Delete());
                this._polylines.delete(polyline);
            });
        });

    };

    /**
     * Obtains geo coordinates for the line on the click location
     *
     * @abstract
     * @param {(MouseEvent| any)} e - The mouse event.
     * @returns {ILatLong} - {@link ILatLong} containing the geo coordinates of the clicked line.
     *
     * @memberof GooglePolylineService
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
     * Obtains the polyline model for the line allowing access to native implementation functionatiliy.
     *
     * @param {MapPolylineDirective} polyline - The {@link MapPolylineDirective} for which to obtain the polyline model.
     * @returns {Promise<Polyline>} - A promise that when fullfilled contains the {@link Polyline}
     * implementation of the underlying platform. For complex paths, returns an array of polylines.
     *
     * @memberof GooglePolylineService
     */
    public GetNativePolyline(polyline: MapPolylineDirective): Promise<Polyline|Array<Polyline>> {
        return this._polylines.get(polyline);
    }

    /**
     * Set the polyline options.
     *
     * @param {MapPolylineDirective} polyline - {@link MapPolylineDirective} to be updated.
     * @param {IPolylineOptions} options - {@link IPolylineOptions} object containing the options. Options will be merged with the
     * options already on the underlying object.
     * @returns {Promise<void>} - A promise fullfilled once the polyline options have been set.
     *
     * @memberof GooglePolylineService
     */
    public SetOptions(polyline: MapPolylineDirective, options: IPolylineOptions): Promise<void> {
        return this._polylines.get(polyline).then(l => {
            const x: Array<Polyline> = Array.isArray(l) ? l : [l];
            x.forEach(line => line.SetOptions(options));
        });
    }

    /**
     * Updates the Polyline path
     *
     * @param {MapPolylineDirective} polyline - {@link MapPolylineDirective} to be updated.
     * @returns {Promise<void>} - A promise fullfilled once the polyline has been updated.
     *
     * @memberof GooglePolylineService
     */
    public UpdatePolyline(polyline: MapPolylineDirective): Promise<void> {
        const m = this._polylines.get(polyline);
        if (m == null) {
            return Promise.resolve();
        }
        return m.then(l => this._zone.run(() => {
            const x: Array<Polyline> = Array.isArray(l) ? l : [l];
            const p: Array<Array<ILatLong>> =
                polyline.Path.length > 0 && Array.isArray(polyline.Path[0]) ? <Array<Array<ILatLong>>>polyline.Path :
                <Array<Array<ILatLong>>>[polyline.Path];
            x.forEach((line, index) => {
                if (p.length > index) { line.SetPath(p[index]); }
            });
            if (Array.isArray(l) && l.length > p.length) {
                l.splice(p.length - 1).forEach(line => line.Delete());
            }
        }));
    }
}
