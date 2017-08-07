import { Injectable, NgZone } from '@angular/core';
import { IMarkerOptions } from '../../interfaces/imarker-options';
import { IPolygonOptions } from '../../interfaces/ipolygon-options';
import { IPolylineOptions } from '../../interfaces/ipolyline-options';
import { Marker } from '../../models/marker';
import { Polygon } from '../../models/polygon';
import { Polyline } from '../../models/polyline';
import { Layer } from '../../models/layer';
import { MapLayerDirective } from '../../components/map-layer'
import { LayerService } from '../layer.service';
import { GoogleLayerBase } from './google-layer-base';
import { MapService } from '../map.service';

/**
 * Implements the {@link LayerService} contract for a Google Maps specific implementation.
 *
 * @export
 * @class GoogleLayerService
 * @extends {GoogleLayerBase}
 * @implements {LayerService}
 */
@Injectable()
export class GoogleLayerService extends GoogleLayerBase implements LayerService  {

    ///
    /// Field Declarations.
    ///
    protected _layers: Map<MapLayerDirective, Promise<Layer>> = new Map<MapLayerDirective, Promise<Layer>>();

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of GoogleLayerService.
     * @param {MapService} _mapService - Instance of the Google Maps Service. Will generally be injected.
     * @param {NgZone} _zone - NgZone instance to provide zone aware promises.
     *
     * @memberof GoogleLayerService
     */
    constructor(_mapService: MapService, private _zone: NgZone) {
        super(_mapService)
    }

    /**
     * Adds a layer to the map.
     *
     * @abstract
     * @param {MapLayerDirective} layer - MapLayerDirective component object.
     * Generally, MapLayerDirective will be injected with an instance of the
     * LayerService and then self register on initialization.
     *
     * @memberof GoogleLayerService
     */
    public AddLayer(layer: MapLayerDirective): void {
    };

    /**
     * Returns the Layer model represented by this layer.
     *
     * @abstract
     * @param {MapLayerDirective} layer - MapLayerDirective component object for which to retrieve the layer model.
     * @returns {Promise<Layer>} - A promise that when resolved contains the Layer model.
     *
     * @memberof GoogleLayerService
     */
    public GetNativeLayer(layer: MapLayerDirective): Promise<Layer> {
        return new Promise<Layer>((r, x) => {
            // TODO: needs implementation.
        });
    };

    /**
     * Deletes the layer
     *
     * @abstract
     * @param {MapLayerDirective} layer - MapLayerDirective component object for which to retrieve the layer.
     * @returns {Promise<void>} - A promise that is fullfilled when the layer has been removed.
     *
     * @memberof GoogleLayerService
     */
    public DeleteLayer(layer: MapLayerDirective): Promise<void> {
        return new Promise<void>((r, x) => {
            // TODO: needs implementation.
        });
    };

    /**
     * Adds a polygon to the layer.
     *
     * @abstract
     * @param {number} layer - The id of the layer to which to add the polygon.
     * @param {IPolygonOptions} options - Polygon options defining the polygon.
     * @returns {Promise<Polygon>} - A promise that when fullfilled contains the an instance of the Polygon model.
     *
     * @memberof GoogleLayerService
     */
    public CreatePolygon(layer: number, options: IPolygonOptions): Promise<Polygon> {
        return new Promise<Polygon>((r, x) => {
            // TODO: needs implementation.
        });
    };

    /**
     * Adds a polyline to the layer.
     *
     * @abstract
     * @param {number} layer - The id of the layer to which to add the polyline.
     * @param {IPolylineOptions} options - Polyline options defining the polyline.
     * @returns {Promise<Polyline|Array<Polyline>>} - A promise that when fullfilled contains the an instance of the Polyline (or an array
     * of polygons for complex paths) model.
     *
     * @memberof GoogleLayerService
     */
    public CreatePolyline(layer: number, options: IPolylineOptions): Promise<Polyline|Array<Polyline>> {
        return new Promise<Polyline>((r, x) => {
            // TODO: needs implementation.
        });
    };

}
