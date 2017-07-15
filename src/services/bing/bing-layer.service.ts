import { Injectable, NgZone } from '@angular/core';
import { IMarkerOptions } from './../../interfaces/imarker-options';
import { IPolygonOptions } from './../../interfaces/ipolygon-options';
import { IPolylineOptions } from './../../interfaces/ipolyline-options';
import { IMarkerIconInfo } from './../../interfaces/imarker-icon-info';
import { Marker } from './../../models/marker';
import { Polygon } from './../../models/polygon';
import { Polyline } from './../../models/polyline';
import { BingMarker } from './../../models/bing/bing-marker';
import { BingPolygon } from './../../models/bing/bing-polygon';
import { BingPolyline } from './../../models/bing/bing-polyline';
import { Layer } from './../../models/layer';
import { MarkerTypeId } from './../../models/marker-type-id';
import { MapService } from './../map.service';
import { MapLayerDirective } from './../../components/map-layer';
import { LayerService } from './../layer.service';
import { BingMapService } from './bing-map.service';
import { BingLayerBase } from './bing-layer-base';
import { BingConversions } from './bing-conversions';

/**
 * Implements the {@link LayerService} contract for a  Bing Maps V8 specific implementation.
 *
 * @export
 * @class BingLayerService
 * @extends {BingLayerBase}
 * @implements {LayerService}
 */
@Injectable()
export class BingLayerService extends BingLayerBase implements LayerService {

    ///
    /// Field Declarations.
    ///
    protected _layers: Map<MapLayerDirective, Promise<Layer>> = new Map<MapLayerDirective, Promise<Layer>>();

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of BingLayerService.
     * @param {MapService} _mapService - Instance of the Bing Maps Service. Will generally be injected.
     * @param {NgZone} _zone - NgZone instance to provide zone aware promises.
     *
     * @memberof BingLayerService
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
     * @memberof LayerService
     */
    public AddLayer(layer: MapLayerDirective): void {
        const layerPromise = this._mapService.CreateLayer({ id: layer.Id });
        this._layers.set(layer, layerPromise);
    }


    /**
     * Adds a polygon to the layer.
     *
     * @abstract
     * @param {number} layer - The id of the layer to which to add the polygon.
     * @param {IPolygonOptions} options - Polygon options defining the polygon.
     * @returns {Promise<Polygon>} - A promise that when fullfilled contains the an instance of the Polygon model.
     *
     * @memberof LayerService
     */
    public CreatePolygon(layer: number, options: IPolygonOptions): Promise<Polygon>{
        const p: Promise<Layer> = this.GetLayerById(layer);
        if (p == null) { throw (`Layer with id ${layer} not found in Layer Map`); }
        return p.then((l: Layer) => {
            const locs: Array<Array<Microsoft.Maps.Location>> = BingConversions.TranslatePaths(options.paths);
            const o: Microsoft.Maps.IPolylineOptions = BingConversions.TranslatePolygonOptions(options);
            const poly: Microsoft.Maps.Polygon = new Microsoft.Maps.Polygon(locs, o);
            const polygon: Polygon = new BingPolygon(poly);
            l.AddEntity(polygon);
            return polygon;
        });
    }

    /**
     * Adds a polyline to the layer.
     *
     * @abstract
     * @param {number} layer - The id of the layer to which to add the line.
     * @param {IPolylineOptions} options - Polyline options defining the line.
     * @returns {Promise<Polyline>} - A promise that when fullfilled contains the an instance of the Polyline model.
     *
     * @memberof LayerService
     */
    public CreatePolyline(layer: number, options: IPolylineOptions): Promise<Polyline>{
        const p: Promise<Layer> = this.GetLayerById(layer);
        if (p == null) { throw (`Layer with id ${layer} not found in Layer Map`); }
        return p.then((l: Layer) => {
            const locs: Array<Array<Microsoft.Maps.Location>> = BingConversions.TranslatePaths(options.path);
            const o: Microsoft.Maps.IPolylineOptions = BingConversions.TranslatePolylineOptions(options);
            const poly: Microsoft.Maps.Polyline = new Microsoft.Maps.Polyline(locs[0], o);
            const polyline: Polyline = new BingPolyline(poly);
            l.AddEntity(polyline);
            return polyline;
        });
    }

    /**
     * Deletes the layer
     *
     * @abstract
     * @param {MapLayerDirective} layer - MapLayerDirective component object for which to retrieve the layer.
     * @returns {Promise<void>} - A promise that is fullfilled when the layer has been removed.
     *
     * @memberof LayerService
     */
    public DeleteLayer(layer: MapLayerDirective): Promise<void> {
        const l = this._layers.get(layer);
        if (l == null) {
            return Promise.resolve();
        }
        return l.then((l1: Layer) => {
            return this._zone.run(() => {
                l1.Delete();
                this._layers.delete(layer);
            });
        });
    }

    /**
     * Returns the Layer model represented by this layer.
     *
     * @abstract
     * @param {MapLayerDirective} layer - MapLayerDirective component object for which to retrieve the layer model.
     * @returns {Promise<Layer>} - A promise that when resolved contains the Layer model.
     *
     * @memberof LayerService
     */
    public GetNativeLayer(layer: MapLayerDirective): Promise<Layer> {
        return this._layers.get(layer);
    }

}
