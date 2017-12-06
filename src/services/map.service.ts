import { Injectable, NgZone } from '@angular/core';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';
import { IMapOptions } from '../interfaces/imap-options';
import { ILayerOptions } from '../interfaces/ilayer-options';
import { ILatLong } from '../interfaces/ilatlong';
import { IPoint } from '../interfaces/ipoint';
import { ISize } from '../interfaces/isize';
import { IBox } from '../interfaces/ibox';
import { IPolygonOptions } from '../interfaces/ipolygon-options';
import { IPolylineOptions } from '../interfaces/ipolyline-options';
import { IMarkerOptions } from '../interfaces/imarker-options';
import { IInfoWindowOptions } from '../interfaces/iinfo-window-options';
import { Marker } from '../models/marker';
import { Layer } from '../models/layer';
import { Polygon } from '../models/polygon';
import { Polyline } from '../models/polyline';
import { InfoWindow } from '../models/info-window';
import { CanvasOverlay } from '../models/canvas-overlay';

/**
 * Abstract class to implement map api. A concrete implementation should be created for each
 * Map provider supported (e.g. Bing, Goolge, ESRI)
 *
 * @export
 * @abstract
 * @class MapService
 */
@Injectable()
export abstract class MapService {

    ///
    /// Public properties
    ///

    /**
     * Gets the Map control instance underlying the implementation
     *
     * @readonly
     * @type {any}
     * @memberof MapService
     */
    abstract get MapInstance(): any;

    /**
     * Gets a Promise for a Map control instance underlying the implementation. Use this instead of {@link MapInstance} if you
     * are not sure if and when the instance will be created.
     * @readonly
     * @type {Promise<any>}
     * @memberof MapService
     */
    abstract get MapPromise(): Promise<any>;

    /**
     * Gets the maps physical size.
     *
     * @readonly
     * @abstract
     * @type {ISize}
     * @memberof MapService
     */
    abstract get MapSize(): ISize;


    ///
    /// Public methods and MapService interface implementation
    ///

    /**
     * Gets a random geo locations filling the bounding box.
     *
     * @static
     * @param {number} count - number of locations to return
     * @param {IBox} bounds  - bounding box.
     * @returns {Array<ILatLong>} - Array of geo locations.
     * @memberof MapService
     */
    public static GetRandonLocations(count: number, bounds: IBox): Array<ILatLong> {
        const a: Array<ILatLong> = [];
        const _getRandomLocation = (b: IBox) => {
            const lat: number = Math.random() * (b.maxLatitude - b.minLatitude) + b.minLatitude;
            let lng: number = 0;
            if (crossesDateLine) {
                lng = Math.random() * (b.minLongitude + 360 - b.maxLongitude) + b.maxLongitude;
                if (lng > 180) { lng = lng - 360; }
            }
            else {
                lng = Math.random() * (b.maxLongitude - b.minLongitude) + b.minLongitude;
            }
            const p: ILatLong = { latitude: lat, longitude: lng };
            return p;
        };
        let crossesDateLine: boolean = false;

        if (bounds == null) { bounds = <IBox>{
                maxLatitude: 360,
                minLatitude: 0,
                maxLongitude: 170,
                minLongitude: 0
            };
        }
        if (bounds.center.longitude < bounds.minLongitude  || bounds.center.longitude > bounds.maxLongitude) { crossesDateLine = true; }
        if (!count || count <= 0) {
            return [_getRandomLocation(bounds)];
        }
        for (let r = 0; r < count; r++) { a.push(_getRandomLocation(bounds)); }
        return a;
    }

    /**
     * Creates a canvas overlay layer to perform custom drawing over the map with out
     * some of the overhead associated with going through the Map objects.
     * @param  {HTMLCanvasElements => void} drawCallback A callback function that is triggered when the canvas is ready to be
     * rendered for the current map view.
     * @returns {Promise<CanvasOverlay>} - Promise of a {@link CanvasOverlay} object.
     * @memberof MapService
     * @abstract
     */
    public abstract CreateCanvasOverlay(drawCallback: (canvas: HTMLCanvasElement) => void): Promise<CanvasOverlay>;

    /**
     * Creates a map cluster layer within the map context
     *
     * @param {IClusterOptions} options - Options for the layer. See {@link IClusterOptions}.
     * @returns {Promise<Layer>} - Promise of a {@link Layer} object, which models the underlying native layer object.
     *
     * @memberof MapService
     */
    abstract CreateClusterLayer(options: ILayerOptions): Promise<Layer>;

    /**
     * Creates an information window for a map position
     *
     * @param {IInfoWindowOptions} [options] - Infowindow options. See {@link IInfoWindowOptions}
     * @returns {Promise<InfoWindow>} - Promise of a {@link InfoWindow} object, which models the underlying natvie infobox object.
     *
     * @memberof MapService
     */
    abstract CreateInfoWindow(options?: IInfoWindowOptions): Promise<InfoWindow>;

    /**
     * Creates a map layer within the map context
     *
     * @param {ILayerOptions} options - Options for the layer. See {@link ILayerOptions}
     * @returns {Promise<Layer>} - Promise of a {@link Layer} object, which models the underlying native layer object.
     *
     * @memberof MapService
     */
    abstract CreateLayer(options: ILayerOptions): Promise<Layer>;

    /**
     * Creates a map instance
     *
     * @param {HTMLElement} el - HTML element to host the map.
     * @param {IMapOptions} mapOptions - Map options
     * @returns {Promise<void>} - Promise fullfilled once the map has been created.
     *
     * @memberof MapService
     */
    abstract CreateMap(el: HTMLElement, mapOptions: IMapOptions): Promise<void>;

    /**
     * Creates a map marker within the map context
     *
     * @param {IMarkerOptions} [options=<IMarkerOptions>{}] - Options for the marker. See {@link IMarkerOptions}.
     * @returns {Promise<Marker>} - Promise of a {@link Marker} object, which models the underlying native pushpin object.
     *
     * @memberof MapService
     */
    abstract CreateMarker(options: IMarkerOptions): Promise<Marker>;

    /**
     * Creates a polygon within the map context
     *
     * @abstract
     * @param {IPolygonOptions} options - Options for the polygon. See {@link IPolygonOptions}.
     * @returns {Promise<Polygon>} - Promise of a {@link Polygon} object, which models the underlying native polygon.
     *
     * @memberof MapService
     */
    abstract CreatePolygon(options: IPolygonOptions): Promise<Polygon>;

    /**
     * Creates a polyline within the map context
     *
     * @abstract
     * @param {IPolylineOptions} options - Options for the polyline. See {@link IPolylineOptions}.
     * @returns {Promise<Polyline>} - Promise of a {@link Polyline} object (or an array thereof for complex paths),
     * which models the underlying native polyline.
     *
     * @memberof MapService
     */
    abstract CreatePolyline(options: IPolylineOptions): Promise<Polyline|Array<Polyline>>;

    /**
     * Deletes a layer from the map.
     *
     * @param {Layer} layer - Layer to delete. See {@link Layer}.
     * @returns {Promise<void>} - Promise fullfilled when the layer has been removed.
     *
     * @memberof MapService
     */
    abstract DeleteLayer(layer: Layer): Promise<void>;

    /**
     * Dispaose the map and associated resoures.
     *
     * @returns {void}
     *
     * @memberof MapService
     */
    abstract DisposeMap(): void;

    /**
     * Gets the geo coordinates of the map bounds
     *
     * @returns {Promise<IBox>} - A promise that when fullfilled contains the bounding box of the screen. See {@link IBox}.
     *
     * @memberof MapService
     */
    abstract GetBounds(): Promise<IBox>;

    /**
     * Gets the geo coordinates of the map center
     *
     * @returns {Promise<ILatLong>} - A promise that when fullfilled contains the goe location of the center. See {@link ILatLong}.
     *
     * @memberof MapService
     */
    abstract GetCenter(): Promise<ILatLong>;

    /**
     * Gets the current zoom level of the map.
     *
     * @returns {Promise<number>} - A promise that when fullfilled contains the zoom level.
     *
     * @memberof MapService
     */
    abstract GetZoom(): Promise<number>;

    /**
     * Provides a conversion of geo coordinates to pixels on the map control.
     *
     * @param {ILatLong} loc - The geo coordinates to translate.
     * @returns {Promise<IPoint>} - Promise of an {@link IPoint} interface representing the pixels. This promise resolves to null
     * if the goe coordinates are not in the view port.
     *
     * @memberof MapService
     */
    abstract LocationToPoint(loc: ILatLong): Promise<IPoint>;

    /**
     * Provides a conversion of geo coordinates to pixels on the map control.
     *
     * @param {ILatLong} loc - The geo coordinates to translate.
     * @returns {Promise<Array<IPoint>>} - Promise of an {@link IPoint} interface array representing the pixels.
     *
     * @memberof MapService
     */
    abstract LocationsToPoints(locs: Array<ILatLong>): Promise<Array<IPoint>>;

    /**
     * Centers the map on a geo location.
     *
     * @param {ILatLong} latLng - GeoCoordinates around which to center the map. See {@link ILatLong}
     * @returns {Promise<void>} - Promise that is fullfilled when the center operations has been completed.
     *
     * @memberof MapService
     */
    abstract SetCenter(latLng: ILatLong): Promise<void>;

    /**
     * Sets the generic map options.
     *
     * @param {IMapOptions} options - Options to set.
     *
     * @memberof MapService
     */
    abstract SetMapOptions(options: IMapOptions): void;

    /**
     * Sets the view options of the map.
     *
     * @param {IMapOptions} options - Options to set.
     *
     * @memberof MapService
     */
    abstract SetViewOptions(options: IMapOptions): void;

    /**
     * Sets the zoom level of the map.
     *
     * @param {number} zoom - Zoom level to set.
     * @returns {Promise<void>} - A Promise that is fullfilled once the zoom operation is complete.
     *
     * @memberof MapService
     */
    abstract SetZoom(zoom: number): Promise<void>;

    /**
     * Creates an event subscription
     *
     * @template E - Generic type of the underlying event.
     * @param {string} eventName - The name of the event (e.g. 'click')
     * @returns {Observable<E>} - An observable of tpye E that fires when the event occurs.
     *
     * @memberof MapService
     */
    abstract SubscribeToMapEvent<E>(eventName: string): Observable<E>;

    /**
     * Triggers the given event name on the map instance.
     *
     * @param {string} eventName - Event to trigger.
     * @returns {Promise<void>} - A promise that is fullfilled once the event is triggered.
     *
     * @memberof MapService
     */
    abstract TriggerMapEvent(eventName: string): Promise<void>;
}
