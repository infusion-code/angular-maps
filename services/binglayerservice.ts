import { Injectable, NgZone } from '@angular/core';
import { IMarkerOptions } from "../interfaces/imarkeroptions";
import { IMarkerIconInfo } from "../interfaces/imarkericoninfo";
import { Marker } from '../models/marker';
import { BingMarker } from '../models/bingmarker';
import { Layer } from '../models/layer';
import { MarkerTypeId } from "../models/markertypeid";
import { MapService } from "./mapservice";
import { MapLayer } from "../components/maplayer";
import { LayerService } from "./layerservice";
import { BingMapService } from "./bingmapservice";
import { BingLayerBase } from "./binglayerbase";
import { BingConversions } from "./bingconversions";

/**
 * Implements the LayerService contract for a  Bing Maps V8 specific implementation. 
 * 
 * @export
 * @class BingLayerService
 * @extends {BingLayerBase}
 * @implements {LayerService}
 */
@Injectable()
export class BingLayerService extends BingLayerBase implements LayerService  {

    ///
    /// Field Declarations.
    ///
    protected _layers: Map<MapLayer, Promise<Layer>> = new Map<MapLayer, Promise<Layer>>();

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
     * @param {MapLayer} layer - MapLayer component object. Generally, MapLayer will be injected with an instance of the 
     * LayerService and then self register on initialization. 
     * 
     * @memberof LayerService
     */
    public AddLayer(layer: MapLayer): void{
        const layerPromise = this._mapService.CreateLayer({id: layer.Id});
        this._layers.set(layer, layerPromise);       
    }

    /**
     * Returns the Layer model represented by this layer. 
     * 
     * @abstract
     * @param {MapLayer} layer - MapLayer component object for which to retrieve the layer model.
     * @returns {Promise<Layer>} - A promise that when resolved contains the Layer model. 
     * 
     * @memberof LayerService
     */
    public GetNativeLayer(layer: MapLayer): Promise<Layer> {
        return this._layers.get(layer);
    }

    /**
     * Deletes the layer
     * 
     * @abstract
     * @param {MapLayer} layer - MapLayer component object for which to retrieve the layer.
     * @returns {Promise<void>} - A promise that is fullfilled when the layer has been removed. 
     * 
     * @memberof LayerService
     */
    public DeleteLayer(layer: MapLayer): Promise<void> {
        const l = this._layers.get(layer);
        if (l == null) {
            return Promise.resolve();
        }
        return l.then((l: Layer) => {
            return this._zone.run(() => {
                l.Delete();
                this._layers.delete(layer);
            });
        });
    }

}