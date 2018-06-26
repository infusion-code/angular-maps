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
import { GooglePolyline } from '../../models/google/google-polyline';
import { MapLayerDirective } from '../../components/map-layer';
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
     * @param _mapService - Instance of the Google Maps Service. Will generally be injected.
     * @param _zone - NgZone instance to provide zone aware promises.
     *
     * @memberof GoogleLayerService
     */
    constructor(_mapService: MapService, _zone: NgZone) {
        super(_mapService, _zone);
    }

    /**
     * Adds a layer to the map.
     *
     * @abstract
     * @param layer - MapLayerDirective component object.
     * Generally, MapLayerDirective will be injected with an instance of the
     * LayerService and then self register on initialization.
     *
     * @memberof GoogleLayerService
     */
    public AddLayer(layer: MapLayerDirective): void {
        const p: Promise<Layer> = new Promise<Layer>((resolve, reject) => {
            this._mapService.MapPromise.then(m => {
                const l: GoogleLayer = new GoogleLayer(m, this._mapService, layer.Id);
                l.SetVisible(layer.Visible);
                resolve(l);
            });
        });
        this._layers.set(layer.Id, p);
    }

    /**
     * Adds a polygon to the layer.
     *
     * @abstract
     * @param layer - The id of the layer to which to add the polygon.
     * @param options - Polygon options defining the polygon.
     * @returns - A promise that when fullfilled contains the an instance of the Polygon model.
     *
     * @memberof GoogleLayerService
     */
    public CreatePolygon(layer: number, options: IPolygonOptions): Promise<Polygon> {
        const p: Promise<Polygon> = this._mapService.CreatePolygon(options);
        const l: Promise<Layer> = this._layers.get(layer);
        Promise.all([p, l]).then(x => x[1].AddEntity(x[0]));
        return p;
    }

    /**
     * Creates an array of unbound polygons. Use this method to create arrays of polygons to be used in bulk
     * operations.
     *
     * @param layer - The id of the layer to which to add the polygon.
     * @param options - Polygon options defining the polygons.
     * @returns - A promise that when fullfilled contains the an arrays of the Polygon models.
     *
     * @memberof GoogleLayerService
     */
    public CreatePolygons(layer: number, options: Array<IPolygonOptions>): Promise<Array<Polygon>> {
        //
        // Note: we attempted using data.Polygons in an attempt to improve performance, but either data.Polygon
        // or data.MultiPolygon actually operate significantly slower than generating the polygons this way.
        // the slowness in google as opposed to bing probably comes from the point reduction algorithm uses.
        // Signigicant performance improvements might be possible in google when using a pixel based reduction algorithm
        // prior to setting the polygon path. This will lower to processing overhead of the google algorithm (with is Douglas-Peucker
        // and rather compute intensive)
        //
        const p: Promise<Layer> = this.GetLayerById(layer);
        if (p == null) { throw (new Error(`Layer with id ${layer} not found in Layer Map`)); }
        return p.then((l: Layer) => {
            const polygons: Promise<Array<Polygon>> = new Promise<Array<Polygon>>((resolve, reject) => {
                const polys: Array<GooglePolygon> = options.map(o => {
                    const op: GoogleMapTypes.PolygonOptions = GoogleConversions.TranslatePolygonOptions(o);
                    const poly: GoogleMapTypes.Polygon = new google.maps.Polygon(op);
                    const polygon: GooglePolygon = new GooglePolygon(poly);
                    if (o.title && o.title !== '') { polygon.Title = o.title; }
                    if (o.metadata) { o.metadata.forEach((val: any, key: string) => polygon.Metadata.set(key, val)); }
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
     * @param layer - The id of the layer to which to add the polyline.
     * @param options - Polyline options defining the polyline.
     * @returns - A promise that when fullfilled contains the an instance of the Polyline (or an array
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
    }

    /**
     * Creates an array of unbound polylines. Use this method to create arrays of polylines to be used in bulk
     * operations.
     *
     * @param layer - The id of the layer to which to add the polylines.
     * @param options - Polyline options defining the polylines.
     * @returns - A promise that when fullfilled contains the an arrays of the Polyline models.
     *
     * @memberof GoogleLayerService
     */
    public CreatePolylines(layer: number, options: Array<IPolylineOptions>): Promise<Array<Polyline|Array<Polyline>>> {
        const p: Promise<Layer> = this.GetLayerById(layer);
        if (p == null) { throw (new Error(`Layer with id ${layer} not found in Layer Map`)); }
        return p.then((l: Layer) => {
            const polylines: Promise<Array<Polyline|Array<Polyline>>> = new Promise<Array<Polyline|Array<Polyline>>>((resolve, reject) => {
                const polys: Array<Polyline|Array<Polyline>> = options.map(o => {
                    const op: GoogleMapTypes.PolylineOptions = GoogleConversions.TranslatePolylineOptions(o);
                    if (o.path && o.path.length > 0 && !Array.isArray(o.path[0])) {
                        op.path = GoogleConversions.TranslatePaths(o.path)[0];
                        const poly: GoogleMapTypes.Polyline = new google.maps.Polyline(op);
                        const polyline: GooglePolyline = new GooglePolyline(poly);
                        if (o.title && o.title !== '') { polyline.Title = o.title; }
                        if (o.metadata) { o.metadata.forEach((v, k) => polyline.Metadata.set(k, v)); }
                        return polyline;
                    }
                    else {
                        const paths: Array<Array<GoogleMapTypes.LatLng>> = GoogleConversions.TranslatePaths(o.path);
                        const lines: Array<Polyline> = new Array<Polyline>();
                        paths.forEach(x => {
                            op.path = x;
                            const poly = new google.maps.Polyline(op);
                            const polyline: GooglePolyline = new GooglePolyline(poly);
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

}
