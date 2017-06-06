import { Injectable, NgZone } from '@angular/core';
import { IMarkerOptions } from '../../interfaces/imarkeroptions';
import { Marker } from '../../models/marker';
import { Layer } from '../../models/layer';
import { MapLayerDirective } from '../../components/maplayer'
import { LayerService } from '../layerservice';
import { GoogleLayerBase } from './google-layer-base';
import { MapService } from '../mapservice';

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

}
