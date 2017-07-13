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

@Injectable()
export class GoogleLayerService extends GoogleLayerBase implements LayerService  {

    protected _layers: Map<MapLayerDirective, Promise<Layer>> = new Map<MapLayerDirective, Promise<Layer>>();

    constructor(_mapService: MapService, private _zone: NgZone) {
        super(_mapService)
    }

    public AddLayer(layer: MapLayerDirective): void {
    };

    public GetNativeLayer(layer: MapLayerDirective): Promise<Layer> {
        return Promise.resolve({});
    };

    public DeleteLayer(layer: MapLayerDirective): Promise<void> {
        return Promise.resolve();
    };

    public CreateMarker(layer: number, options: IMarkerOptions): Promise<Marker> {
        return Promise.resolve({});
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
        return Promise.resolve({});
    };

    /**
     * Adds a polyline to the layer.
     *
     * @abstract
     * @param {number} layer - The id of the layer to which to add the polyline.
     * @param {IPolylineOptions} options - Polyline options defining the polyline.
     * @returns {Promise<Polyline>} - A promise that when fullfilled contains the an instance of the Polyline model.
     *
     * @memberof GoogleLayerService
     */
    public CreatePolyline(layer: number, options: IPolylineOptions): Promise<Polyline> {
        return Promise.resolve({});
    };

}
