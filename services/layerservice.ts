import { Injectable, NgZone } from '@angular/core';
import { IMarkerOptions } from '../interfaces/imarkeroptions';
import { Marker } from '../models/marker';
import { Layer } from '../models/layer';
import { MapLayerDirective } from '../components/maplayer'

@Injectable()
export abstract class LayerService {

    public abstract AddLayer(layer: MapLayerDirective): void;

    public abstract GetNativeLayer(layer: MapLayerDirective): Promise<Layer>;

    public abstract DeleteLayer(layer: MapLayerDirective): Promise<void>;

    public abstract CreateMarker(layer: number, options: IMarkerOptions): Promise<Marker>;

}
