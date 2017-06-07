import { Injectable, NgZone } from '@angular/core';
import { IMarkerOptions } from "../interfaces/imarkeroptions";
import { Marker } from '../models/marker';
import { Layer } from '../models/layer';
import { MapLayer } from '../components/maplayer'

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
     * @param {MapLayer} layer - MapLayer component object. Generally, MapLayer will be injected with an instance of the 
     * LayerService and then self register on initialization. 
     * 
     * @memberof LayerService
     */
    public abstract AddLayer(layer: MapLayer): void;

    /**
     * Returns the Layer model represented by this layer. 
     * 
     * @abstract
     * @param {MapLayer} layer - MapLayer component object for which to retrieve the layer model.
     * @returns {Promise<Layer>} - A promise that when resolved contains the Layer model. 
     * 
     * @memberof LayerService
     */
    public abstract GetNativeLayer(layer: MapLayer): Promise<Layer>;

    /**
     * Deletes the layer
     * 
     * @abstract
     * @param {MapLayer} layer - MapLayer component object for which to retrieve the layer.
     * @returns {Promise<void>} - A promise that is fullfilled when the layer has been removed. 
     * 
     * @memberof LayerService
     */
    public abstract DeleteLayer(layer: MapLayer): Promise<void>;

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

}