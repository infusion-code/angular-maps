import { Injectable, NgZone } from '@angular/core';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';
import { IMapOptions } from '../interfaces/imapoptions';
import { ILayerOptions } from '../interfaces/ilayeroptions';
import { ILatLong } from '../interfaces/ilatlong';
import { IPoint } from '../interfaces/ipoint';
import { IPolygonOptions } from '../interfaces/ipolygonoptions';
import { IMarkerOptions } from '../interfaces/imarkeroptions';
import { IInfoWindowOptions } from '../interfaces/iinfowindowoptions';
import { Marker } from '../models/marker';
import { Layer } from '../models/layer';
import { Polygon } from '../models/polygon';
import { InfoWindow } from '../models/infowindow'

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
    /// Public methods and MapService interface implementation
    ///

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
     * Deletes a layer from the map.
     *
     * @param {Layer} layer - Layer to delete. See {@link Layer}.
     * @returns {Promise<void>} - Promise fullfilled when the layer has been removed.
     *
     * @memberof BingMapService
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
     * Gets the geo coordinates of the map center
     *
     * @returns {Promise<ILatLong>} - A promise that when fullfilled contains the goe location of the center. See {@link ILatLong}.
     *
     * @memberof BingMapService
     */
    abstract GetCenter(): Promise<ILatLong>;

    /**
     * Gets the current zoom level of the map.
     *
     * @returns {Promise<number>} - A promise that when fullfilled contains the zoom level.
     *
     * @memberof BingMapService
     */
    abstract GetZoom(): Promise<number>;

    /**
     * Provides a conversion of geo coordinates to pixels on the map control.
     *
     * @param {ILatLong} loc - The geo coordinates to translate.
     * @returns {Promise<IPoint>} - Promise of an {@link IPoint} interface representing the pixels. This promise resolves to null
     * if the goe coordinates are not in the view port.
     *
     * @memberof BingMapService
     */
    abstract LocationToPoint(loc: ILatLong): Promise<IPoint>;

    /**
     * Gets the Map control instance underlying the implementation
     *
     * @readonly
     * @type {any}
     * @memberof BingMapService
     */
    abstract get MapInstance(): any;

    /**
     * Gets a Promise for a Map control instance underlying the implementation. Use this instead of {@link MapInstance} if you
     * are not sure if and when the instance will be created.
     * @readonly
     * @type {Promise<any>}
     * @memberof BingMapService
     */
    abstract get MapPromise(): Promise<any>;

    /**
     * Centers the map on a geo location.
     *
     * @param {ILatLong} latLng - GeoCoordinates around which to center the map. See {@link ILatLong}
     * @returns {Promise<void>} - Promise that is fullfilled when the center operations has been completed.
     *
     * @memberof BingMapService
     */
    abstract SetCenter(latLng: ILatLong): Promise<void>;

    /**
     * Sets the generic map options.
     *
     * @param {IMapOptions} options - Options to set.
     *
     * @memberof BingMapService
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
     * @memberof BingMapService
     */
    abstract SetZoom(zoom: number): Promise<void>;

    /**
     * Creates an event subscription
     *
     * @template E - Generic type of the underlying event.
     * @param {string} eventName - The name of the event (e.g. 'click')
     * @returns {Observable<E>} - An observable of tpye E that fires when the event occurs.
     *
     * @memberof BingMapService
     */
    abstract SubscribeToMapEvent<E>(eventName: string): Observable<E>;

    /**
     * Triggers the given event name on the map instance.
     *
     * @param {string} eventName - Event to trigger.
     * @returns {Promise<void>} - A promise that is fullfilled once the event is triggered.
     *
     * @memberof BingMapService
     */
    abstract TriggerMapEvent(eventName: string): Promise<void>;
}
