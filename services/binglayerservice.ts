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

@Injectable()
export class BingLayerService extends BingLayerBase implements LayerService  {

    protected _layers: Map<MapLayer, Promise<Layer>> = new Map<MapLayer, Promise<Layer>>();

    constructor(_mapService: MapService, private _zone: NgZone) { 
        super(_mapService)
    }

    public AddLayer(layer: MapLayer): void{
        const layerPromise = this._mapService.CreateLayer({id: layer.Id});
        this._layers.set(layer, layerPromise);       
    }

    public GetNativeLayer(layer: MapLayer): Promise<Layer> {
        return this._layers.get(layer);
    }

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