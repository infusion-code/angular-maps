import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';
import { ILatLong } from './../../interfaces/Ilatlong';
import { IPolygonOptions } from '../../interfaces/ipolygonoptions';
import { Polygon } from '../../models/polygon';
import { MapPolygonDirective } from '../../components/mappolygon';
import { PolygonService } from '../polygonservice';
import { MapService } from '../mapservice';
import { LayerService } from '../layerservice';

/**
 * Concrete implementation of the Polygon Service abstract class for Bing Maps V8.
 *
 * @export
 * @class BingPolygonService
 * @implements {PolygonService}
 */
@Injectable()
export class BingPolygonService implements PolygonService {

    ///
    /// Field declarations
    ///
    private _polygons: Map<MapPolygonDirective, Promise<Polygon>> = new Map<MapPolygonDirective, Promise<Polygon>>();

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of BingPolygonService.
     * @param {MapService} _mapService - {@link MapService} instance. The concrete {@link BingMapService} implementation is expected.
     * @param {LayerService} _layerService - {@link BingLayerService} instance.
     * The concrete {@link BingLayerService} implementation is expected.
     * @param {NgZone} _zone - NgZone instance to support zone aware promises.
     *
     * @memberof BingPolygonService
     */
    constructor(private _mapService: MapService,
        private _layerService: LayerService,
        private _zone: NgZone) {
    }

/**
     * Adds a polygon to a map. Depending on the polygon context, the polygon will either by added to the map or a
     * correcsponding layer.
     *
     * @param {MapPolygonDirective} polygon - The {@link MapPolygonDirective} to be added.
     *
     * @memberof BingPolygonService
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
        let polygonPromise: Promise<Polygon>;
        if(polygon.InCustomLayer){
            polygonPromise = this._layerService.CreatePolygon(polygon.LayerId, o);
        }
        else{
            polygonPromise = this._mapService.CreatePolygon(o);
        }
        this._polygons.set(polygon, polygonPromise);
    }

    /**
      * Registers an event delegate for a polygon.
      *
      * @template T - Type of the event to emit.
      * @param {string} eventName - The name of the event to register (e.g. 'click')
      * @param {MapPolygonDirective} polygon - The {@link MapPolygonDirective} for which to register the event.
      * @returns {Observable<T>} - Observable emiting an instance of T each time the event occurs.
      *
      * @memberof BingPolygonService
      */
    public CreateEventObservable<T>(eventName: string, polygon: MapPolygonDirective): Observable<T> {
        let b: Subject<T> = new Subject<T>();
        if(eventName === 'mousemove') return b.asObservable();
        if(eventName === 'rightclick') return b.asObservable();
            ///
            /// mousemove and rightclick are not supported by bing polygons.
            ///

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
      * @memberof BingPolygonService
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
     * Obtains geo coordinates for the polygon on the click location
     *
     * @abstract
     * @param {(MouseEvent| any)} e - The mouse event. Expected to implement {@link Microsoft.Maps.IMouseEventArgs}.
     * @returns {ILatLong} - {@link ILatLong} containing the geo coordinates of the clicked marker.
     *
     * @memberof BingPolygonService
     */
    public GetCoordinatesFromClick(e: MouseEvent | any): ILatLong {
        let x:Microsoft.Maps.IMouseEventArgs = <Microsoft.Maps.IMouseEventArgs>e;
        return { latitude: x.location.latitude, longitude: x.location.longitude };
    };

    /**
     * Obtains the polygon model for the polygon allowing access to native implementation functionatiliy.
     *
     * @param {MapPolygonDirective} polygon - The {@link MapPolygonDirective} for which to obtain the polygon model.
     * @returns {Promise<Polygon>} - A promise that when fullfilled contains the {@link Polygon} implementation of the underlying platform.
     *
     * @memberof BingPolygonService
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
     * @memberof BingPolygonService
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
     * @memberof BingPolygonService
     */
    public UpdatePolygon(polygon: MapPolygonDirective): Promise<void> {
        const m = this._polygons.get(polygon);
        if (m == null) {
            return Promise.resolve();
        }
        return m.then((l: Polygon) => this._zone.run(() => { l.SetPaths(polygon.Paths); }));
    }

}