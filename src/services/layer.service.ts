import { Injectable, NgZone } from '@angular/core';
import { IMarkerOptions } from './../interfaces/imarker-options';
import { IPolygonOptions } from './../interfaces/ipolygon-options';
import { Marker } from './../models/marker';
import { Polygon } from './../models/polygon';
import { Polyline } from './../models/polyline';
import { Layer } from './../models/layer';
import { MapLayerDirective } from './../components/map-layer';

/**
 * Abstract class to to define the layer service contract. Must be realized by implementing provider.
 *
 * @export
 * @abstract
 * @class LayerService
 */
@Injectable()
export abstract class LayerService {

    /**
     * Adds a layer to the map.
     *
     * @abstract
     * @param {MapLayerDirective} layer - MapLayerDirective component object.
     * Generally, MapLayerDirective will be injected with an instance of the
     * LayerService and then self register on initialization.
     *
     * @memberof LayerService
     */
    public abstract AddLayer(layer: MapLayerDirective): void;

    /**
     * Adds a marker to the layer.
     *
     * @abstract
     * @param {number} layer - The id of the layer to which to add the marker.
     * @param {IMarkerOptions} options - Marker options defining the marker.
     * @returns {Promise<Marker>} - A promise that when fullfilled contains the an instance of the Marker model.
     *
     * @memberof LayerService
     */
    public abstract CreateMarker(layer: number, options: IMarkerOptions): Promise<Marker>;

    /**
     * Adds a polygon to the layer.
     *
     * @abstract
     * @param {number} layer - The id of the layer to which to add the line.
     * @param {IPolygonOptions} options - Polygon options defining the line.
     * @returns {Promise<Polygon>} - A promise that when fullfilled contains the an instance of the Polygon model.
     *
     * @memberof LayerService
     */
    public abstract CreatePolygon(layer: number, options: IPolygonOptions): Promise<Polygon>;

    /**
     * Adds a polyline to the layer.
     *
     * @abstract
     * @param {number} layer - The id of the layer to which to add the line.
     * @param {IPolylineOptions} options - Polyline options defining the marker.
     * @returns {Promise<Polyline|Array<Polyline>>} - A promise that when fullfilled contains the an instance of the Polyline (or an
     * array of polylines for complex paths) model.
     *
     * @memberof LayerService
     */
    public abstract CreatePolyline(layer: number, options: IPolygonOptions): Promise<Polyline|Array<Polyline>>;

    /**
     * Deletes the layer
     *
     * @abstract
     * @param {MapLayerDirective} layer - MapLayerDirective component object for which to retrieve the layer.
     * @returns {Promise<void>} - A promise that is fullfilled when the layer has been removed.
     *
     * @memberof LayerService
     */
    public abstract DeleteLayer(layer: MapLayerDirective): Promise<void>;

    /**
     * Returns the Layer model represented by this layer.
     *
     * @abstract
     * @param {MapLayerDirective} layer - MapLayerDirective component object for which to retrieve the layer model.
     * @returns {Promise<Layer>} - A promise that when resolved contains the Layer model.
     *
     * @memberof LayerService
     */
    public abstract GetNativeLayer(layer: MapLayerDirective): Promise<Layer>;
}
