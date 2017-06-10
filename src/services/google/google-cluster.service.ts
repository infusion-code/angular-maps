import { Injectable, NgZone } from '@angular/core';
import { IMarkerOptions } from '../../interfaces/imarkeroptions';
import { IClusterOptions } from './../../interfaces/iclusteroptions';
import { IPolygonOptions } from './../../interfaces/ipolygonoptions';
import { Marker } from '../../models/marker';
import { Polygon } from '../../models/polygon';
import { Layer } from '../../models/layer';
import { ClusterLayerDirective } from '../../components/clusterlayer'
import { ClusterService } from '../clusterservice';
import { MapService } from '../mapservice';
import { GoogleLayerBase } from './google-layer-base';

@Injectable()
export class GoogleClusterService extends GoogleLayerBase implements ClusterService {

    protected _layers: Map<ClusterLayerDirective, Promise<Layer>> = new Map<ClusterLayerDirective, Promise<Layer>>();

    constructor(_mapService: MapService, private _zone: NgZone) {
        super(_mapService);
    }

    public AddLayer(layer: ClusterLayerDirective): void {
    };

    /**
     * Adds a polygon to the layer.
     * 
     * @abstract
     * @param {number} layer - The id of the layer to which to add the marker.
     * @param {IPolygonOptions} options - Polygon options defining the marker.
     * @returns {Promise<Polygon>} - A promise that when fullfilled contains the an instance of the Polygon model.
     *
     * @memberof BingClusterService
     */
    public CreatePolygon(layer: number, options: IPolygonOptions): Promise<Polygon>{
        throw ("Polygons are not supported in clustering layers. You can only use markers.")
    }

    public GetNativeLayer(layer: ClusterLayerDirective): Promise<Layer> {
        return Promise.resolve({});
    };

    public DeleteLayer(layer: ClusterLayerDirective): Promise<void> {
        return Promise.resolve();
    };

    public CreateMarker(layer: number, options: IMarkerOptions): Promise<Marker> {
        return Promise.resolve({});
    };

    public StartClustering(layer: ClusterLayerDirective): Promise<void> {
        return Promise.resolve();
    }

    public StopClustering(layer: ClusterLayerDirective): Promise<void> {
        return Promise.resolve();
    }

}
