import { Injectable, NgZone } from '@angular/core';
import { IMarkerOptions } from "../interfaces/imarkeroptions";
import { Marker } from '../models/marker';
import { Layer } from '../models/layer';
import { ClusterLayer } from '../components/clusterLayer'

@Injectable()
export abstract class ClusterService {

    public abstract AddLayer(layer: ClusterLayer): void;

    public abstract GetNativeLayer(layer: ClusterLayer): Promise<Layer>;

    public abstract DeleteLayer(layer: ClusterLayer): Promise<void>;

    public abstract CreateMarker(layer: number, options: IMarkerOptions): Promise<Marker>;

}