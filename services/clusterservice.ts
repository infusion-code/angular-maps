import { Injectable, NgZone } from '@angular/core';
import { IMarkerOptions } from '../interfaces/imarkeroptions';
import { Marker } from '../models/marker';
import { Layer } from '../models/layer';
import { ClusterLayerDirective } from '../components/clusterlayer'

@Injectable()
export abstract class ClusterService {

    public abstract AddLayer(layer: ClusterLayerDirective): void;

    public abstract GetNativeLayer(layer: ClusterLayerDirective): Promise<Layer>;

    public abstract DeleteLayer(layer: ClusterLayerDirective): Promise<void>;

    public abstract CreateMarker(layer: number, options: IMarkerOptions): Promise<Marker>;

}
