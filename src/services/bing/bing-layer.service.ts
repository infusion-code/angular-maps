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
    protected _layers: Map<number, Promise<Layer>> = new Map<number, Promise<Layer>>();

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
     * @memberof BingLayerService
     */
    public AddLayer(layer: MapLayerDirective): void {
        const layerPromise = this._mapService.CreateLayer({ id: layer.Id });
        this._layers.set(layer.Id, layerPromise);
    }


    /**
     * Adds a polygon to the layer.
     *
     * @abstract
     * @param {number} layer - The id of the layer to which to add the polygon.
     * @param {IPolygonOptions} options - Polygon options defining the polygon.
     * @returns {Promise<Polygon>} - A promise that when fullfilled contains the an instance of the Polygon model.
     *
     * @memberof BingLayerService
     */
    public CreatePolygon(layer: number, options: IPolygonOptions): Promise<Polygon> {
        const p: Promise<Layer> = this.GetLayerById(layer);
        if (p == null) { throw (new Error(`Layer with id ${layer} not found in Layer Map`)); }
        return p.then((l: Layer) => {
            const locs: Array<Array<Microsoft.Maps.Location>> = BingConversions.TranslatePaths(options.paths);
            const o: Microsoft.Maps.IPolylineOptions = BingConversions.TranslatePolygonOptions(options);
            const poly: Microsoft.Maps.Polygon = new Microsoft.Maps.Polygon(locs, o);
            const polygon: Polygon = new BingPolygon(poly, this._mapService.MapInstance, l.NativePrimitve, (<any>this._mapService)._tools)

            if (options.metadata) { options.metadata.forEach((v, k) => polygon.Metadata.set(k, v)); }
            if (options.title && options.title !== '') {polygon.Title = options.title; }
            if (options.showLabel != null) { polygon.ShowLabel = options.showLabel; }
            if (options.showTooltip != null) { polygon.ShowTooltip = options.showTooltip; }
            if (options.labelMaxZoom != null) { polygon.LabelMaxZoom = options.labelMaxZoom; }
            if (options.labelMinZoom != null) { polygon.LabelMinZoom = options.labelMinZoom; }
            l.AddEntity(polygon);
            return polygon;
        });
    }

    /**
     * Creates an array of unbound polygons. Use this method to create arrays of polygons to be used in bulk
     * operations.
     *
     * @param {number} layer - The id of the layer to which to add the polygon.
     * @param {Array<IPolygonOptions>} options - Polygon options defining the polygons.
     * @returns {Promise<Array<Polygon>>} - A promise that when fullfilled contains the an arrays of the Polygon models.
     *
     * @memberof BingLayerService
     */
    public CreatePolygons(layer: number, options: Array<IPolygonOptions>): Promise<Array<Polygon>> {
        const p: Promise<Layer> = this.GetLayerById(layer);
        if (p == null) { throw (new Error(`Layer with id ${layer} not found in Layer Map`)); }
        return p.then((l: Layer) => {
            const polygons: Promise<Array<Polygon>> = new Promise<Array<Polygon>>((resolve, reject) => {
                const polys: Array<BingPolygon> = options.map(o => {
                    const locs: Array<Array<Microsoft.Maps.Location>> = BingConversions.TranslatePaths(o.paths);
                    const op: Microsoft.Maps.IPolylineOptions = BingConversions.TranslatePolygonOptions(o);
                    const poly: Microsoft.Maps.Polygon = new Microsoft.Maps.Polygon(locs, op);
                    const polygon: BingPolygon = new BingPolygon(poly, this._mapService.MapInstance, l.NativePrimitve,
                        (<any>this._mapService)._tools);
                    if (o.title && o.title !== '') { polygon.Title = o.title; }
                    if (o.metadata) { o.metadata.forEach((v, k) => polygon.Metadata.set(k, v)); }
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
     * @param {number} layer - The id of the layer to which to add the line.
     * @param {IPolylineOptions} options - Polyline options defining the line.
     * @returns {Promise<Polyline|Array<Polyline>>} - A promise that when fullfilled contains the an instance of the Polyline (or an array
     * of polygons for complex paths) model.
     *
     * @memberof BingLayerService
     */
    public CreatePolyline(layer: number, options: IPolylineOptions): Promise<Polyline|Array<Polyline>> {
        const p: Promise<Layer> = this.GetLayerById(layer);
        let polyline: Microsoft.Maps.Polyline;
        let line: Polyline;
        if (p == null) { throw (new Error(`Layer with id ${layer} not found in Layer Map`)); }
        return p.then((l: Layer) => {
            const locs: Array<Array<Microsoft.Maps.Location>> = BingConversions.TranslatePaths(options.path);
            const o: Microsoft.Maps.IPolylineOptions = BingConversions.TranslatePolylineOptions(options);
            if (options.path && options.path.length > 0 && !Array.isArray(options.path[0])) {
                polyline = new Microsoft.Maps.Polyline(locs[0], o);
                line = new BingPolyline(polyline, this._mapService.MapInstance, l.NativePrimitve);
                l.AddEntity(line);

                if (options.metadata) { options.metadata.forEach((v, k) => line.Metadata.set(k, v)); }
                if (options.title && options.title !== '') {line.Title = options.title; }
                if (options.showTooltip != null) { line.ShowTooltip = options.showTooltip; }
                return line;
            }
            else {
                const lines: Array<Polyline> = new Array<Polyline>();
                locs.forEach(x => {
                    polyline = new Microsoft.Maps.Polyline(x, o);
                    line = new BingPolyline(polyline, this._mapService.MapInstance, l.NativePrimitve);
                    l.AddEntity(line);

                    if (options.metadata) { options.metadata.forEach((v, k) => line.Metadata.set(k, v)); }
                    if (options.title && options.title !== '') {line.Title = options.title; }
                    if (options.showTooltip != null) { line.ShowTooltip = options.showTooltip; }
                    lines.push(line);
                });
                return lines;
            }
        });
    }

    /**
     * Creates an array of unbound polylines. Use this method to create arrays of polylines to be used in bulk
     * operations.
     *
     * @param {number} layer - The id of the layer to which to add the polylines.
     * @param {Array<IPolylineOptions>} options - Polyline options defining the polylines.
     * @returns {Promise<Array<Polyline|Array<Polyline>>>} - A promise that when fullfilled contains the an arrays of the Polyline models.
     *
     * @memberof BingLayerService
     */
    public CreatePolylines(layer: number, options: Array<IPolylineOptions>): Promise<Array<Polyline|Array<Polyline>>> {
        const p: Promise<Layer> = this.GetLayerById(layer);
        if (p == null) { throw (new Error(`Layer with id ${layer} not found in Layer Map`)); }
        return p.then((l: Layer) => {
            const polylines: Promise<Array<Polyline|Array<Polyline>>> = new Promise<Array<Polyline|Array<Polyline>>>((resolve, reject) => {
                const polys: Array<Polyline|Array<Polyline>> = options.map(o => {
                    const locs: Array<Array<Microsoft.Maps.Location>> = BingConversions.TranslatePaths(o.path);
                    const op: Microsoft.Maps.IPolylineOptions = BingConversions.TranslatePolylineOptions(o);
                    if (locs && locs.length > 0 && !Array.isArray(locs[0])) {
                        const poly: Microsoft.Maps.Polyline = new Microsoft.Maps.Polyline(locs[0], op);
                        const polyline: BingPolyline = new BingPolyline(poly, this._mapService.MapInstance, l.NativePrimitve);
                        if (o.title && o.title !== '') { polyline.Title = o.title; }
                        if (o.metadata) { o.metadata.forEach((v, k) => polyline.Metadata.set(k, v)); }
                        return polyline;
                    }
                    else {
                        const lines: Array<Polyline> = new Array<Polyline>();
                        locs.forEach(x => {
                            const poly = new Microsoft.Maps.Polyline(x, op);
                            const polyline: BingPolyline = new BingPolyline(poly, this._mapService.MapInstance, l.NativePrimitve);
                            if (o.metadata) { o.metadata.forEach((v, k) => polyline.Metadata.set(k, v)); }
                            if (o.title && o.title !== '') {polyline.Title = o.title; }
                            lines.push(polyline);
                        });
                        return lines;
                    }
                });
                resolve(polys);
            });
            return polylines;
        });
    }

    /**
     * Deletes the layer
     *
     * @abstract
     * @param {MapLayerDirective} layer - MapLayerDirective component object for which to retrieve the layer.
     * @returns {Promise<void>} - A promise that is fullfilled when the layer has been removed.
     *
     * @memberof BingLayerService
     */
    public DeleteLayer(layer: MapLayerDirective): Promise<void> {
        const l = this._layers.get(layer.Id);
        if (l == null) {
            return Promise.resolve();
        }
        return l.then((l1: Layer) => {
            l1.Delete();
            this._layers.delete(layer.Id);
        });
    }

    /**
     * Returns the Layer model represented by this layer.
     *
     * @abstract
     * @param {MapLayerDirective} layer - MapLayerDirective component object for which to retrieve the layer model.
     * @returns {Promise<Layer>} - A promise that when resolved contains the Layer model.
     *
     * @memberof BingLayerService
     */
    public GetNativeLayer(layer: MapLayerDirective): Promise<Layer> {
        return this._layers.get(layer.Id);
    }

}
