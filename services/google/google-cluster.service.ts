import { Injectable, NgZone } from '@angular/core';
import { IMarkerOptions } from '../../interfaces/imarkeroptions';
import { Marker } from '../../models/marker';
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

    public GetNativeLayer(layer: ClusterLayerDirective): Promise<Layer> {
        return Promise.resolve({});
    };

    public DeleteLayer(layer: ClusterLayerDirective): Promise<void> {
        return Promise.resolve();
    };

    public CreateMarker(layer: number, options: IMarkerOptions): Promise<Marker> {
        return Promise.resolve({});
    };

}
