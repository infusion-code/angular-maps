import { Injectable, NgZone } from '@angular/core';
import { IMarkerOptions } from "../../interfaces/imarkeroptions";
import { Marker } from '../../models/marker';
import { Layer } from '../../models/layer';
import { ClusterLayer } from '../../components/clusterlayer'
import { ClusterService } from "../clusterservice";
import { MapService } from "../mapservice";
import { GoogleLayerBase } from './google-layer-base';

@Injectable()
export class GoogleClusterService extends GoogleLayerBase implements ClusterService {
    
    protected _layers: Map<ClusterLayer, Promise<Layer>> = new Map<ClusterLayer, Promise<Layer>>();

    constructor(_mapService: MapService, private _zone: NgZone) {
        super(_mapService);
    }

    public AddLayer(layer: ClusterLayer): void {
    };

    public GetNativeLayer(layer: ClusterLayer): Promise<Layer> {
        return Promise.resolve({});
    };

    public DeleteLayer(layer: ClusterLayer): Promise<void> {
        return Promise.resolve();
    };

    public CreateMarker(layer: number, options: IMarkerOptions): Promise<Marker> {
        return Promise.resolve({});
    };

}