import { Injectable, NgZone } from '@angular/core';
import { IMarkerOptions } from '../../interfaces/imarker-options';
import { IPolygonOptions } from '../../interfaces/ipolygon-options';
import { IPolylineOptions } from '../../interfaces/ipolyline-options';
import { Marker } from '../../models/marker';
import { Polygon } from '../../models/polygon';
import { Polyline } from '../../models/polyline';
import { Layer } from '../../models/layer';
import { GoogleLayer } from '../../models/google/google-layer';
import { GooglePolygon } from '../../models/google/google-polygon';

import { MapLayerDirective } from '../../components/map-layer'
import { LayerService } from '../layer.service';
import { GoogleLayerBase } from './google-layer-base';
import { MapService } from '../map.service';
import { GoogleConversions } from './google-conversions';
import * as GoogleMapTypes from './google-map-types';

declare var google: any;

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
    protected _layers: Map<number, Promise<Layer>> = new Map<number, Promise<Layer>>();

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
        const p: Promise<Layer> = new Promise<Layer>((resolve, reject) => {
            this._mapService.MapPromise.then(m => {
                resolve(new GoogleLayer(m, this._mapService))
            });
        });
        this._layers.set(layer.Id, p);
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
        return this._layers.get(layer.Id);
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
        const l = this._layers.get(layer.Id);
        if (l == null) {
            return Promise.resolve();
        }
        return l.then((l1: Layer) => {
            return this._zone.run(() => {
                l1.Delete();
                this._layers.delete(layer.Id);
            });
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
        const p: Promise<Polygon> = this._mapService.CreatePolygon(options);
        const l: Promise<Layer> = this._layers.get(layer);
        Promise.all([p, l]).then(x => x[1].AddEntity(x[0]));
        return p;
    };

    /**
     * Creates an array of unbound polygons. Use this method to create arrays of polygons to be used in bulk
     * operations.
     *
     * @param {number} layer - The id of the layer to which to add the polygon.
     * @param {Array<IPolygonOptions>} options - Polygon options defining the polygons.
     * @returns {Promise<Array<Polygon>>} - A promise that when fullfilled contains the an arrays of the Polygon models.
     *
     * @memberof GoogleLayerService
     */
    public CreatePolygons(layer: number, options: Array<IPolygonOptions>): Promise<Array<Polygon>> {
        const p: Promise<Layer> = this.GetLayerById(layer);
        if (p == null) { throw (new Error(`Layer with id ${layer} not found in Layer Map`)); }
        return p.then((l: Layer) => {
            const polygons: Promise<Array<Polygon>> = new Promise<Array<Polygon>>((resolve, reject) => {
                const polys: Array<GooglePolygon> = options.map(o => {
                    const op: GoogleMapTypes.PolygonOptions = GoogleConversions.TranslatePolygonOptions(o);
                    const poly: GoogleMapTypes.Polygon = new google.maps.Polygon(o);
                    const polygon: GooglePolygon = new GooglePolygon(poly);
                    return polygon;
                });
                resolve(polys);
            });
            return polygons;
        });
    }

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
        const p: Promise<Polyline|Array<Polyline>> = this._mapService.CreatePolyline(options);
        const l: Promise<Layer> = this._layers.get(layer);
        Promise.all([p, l]).then(x => {
            const p1: Array<Polyline> =  Array.isArray(x[0]) ? <Array<Polyline>>x[0] : [<Polyline>x[0]];
            for (const p2 of p1) {x[1].AddEntity(p2); }
        });
        return p;
    };

}
