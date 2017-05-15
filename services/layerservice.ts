import { Injectable, NgZone } from '@angular/core';
import { IMarkerOptions } from "../interfaces/imarkeroptions";
import { Marker } from '../models/marker';
import { Layer } from '../models/layer';
import { MapLayer } from '../components/mapLayer'

@Injectable()
export abstract class LayerService {

    public abstract AddLayer(layer: MapLayer): void;

    public abstract GetNativeLayer(layer: MapLayer): Promise<Layer>;

    public abstract DeleteLayer(layer: MapLayer): Promise<void>;

    public abstract CreateMarker(layer: number, options: IMarkerOptions): Promise<Marker>;

}