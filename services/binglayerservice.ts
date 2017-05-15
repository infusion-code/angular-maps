import { Injectable, NgZone } from '@angular/core';
import { IMarkerOptions } from "../interfaces/imarkeroptions";
import { IMarkerIconInfo } from "../interfaces/imarkericoninfo";
import { Marker } from '../models/marker';
import { BingMarker } from '../models/bingmarker';
import { Layer } from '../models/layer';
import { MarkerTypeId } from "../models/markertypeid";
import { MapService } from "./mapservice";
import { MapLayer } from "../components/mapLayer";
import { BingConversions } from "./bingconversions";

@Injectable()
export class BingLayerService {

    private _layers: Map<MapLayer, Promise<Layer>> = new Map<MapLayer, Promise<Layer>>();

    constructor(private _mapService: MapService, private _zone: NgZone) { }

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

    public CreateMarker(layer: number, options: IMarkerOptions): Promise<Marker>{
        let p: Promise<Layer>  = this.GetLayerById(layer);
        if(p == null) throw(`Layer with id ${layer} not found in Layer Map`);
        return p.then((l: Layer) => {
            let loc: Microsoft.Maps.Location = BingConversions.TranslateLocation(options.position);
            let o: Microsoft.Maps.IPushpinOptions = BingConversions.TranslateMarkerOptions(options);
            if (o.icon == null) {
                let s: number = 48;
                let iconInfo: IMarkerIconInfo = {
                    markerType: MarkerTypeId.CanvasMarker,
                    rotation: 45,
                    drawingOffset: { x: 24, y: 0 },
                    points: [
                        { x: 10, y: 40 },
                        { x: 24, y: 30 },
                        { x: 38, y: 40 },
                        { x: 24, y: 0 }
                    ],
                    color: "#f00",
                    size: { width: s, height: s }
                };
                o.icon = Marker.CreateMarker(iconInfo);
                o.anchor = new Microsoft.Maps.Point(iconInfo.size.width * 0.75, iconInfo.size.height * 0.25);
                o.textOffset = new Microsoft.Maps.Point(0, iconInfo.size.height * 0.66);
            }
            let pushpin: Microsoft.Maps.Pushpin = new Microsoft.Maps.Pushpin(loc, o);
            let marker:BingMarker =  new BingMarker(pushpin);
            l.AddEntity(marker);
            return marker;
        });

    }

    private GetLayerById(id: number): Promise<Layer>{
        let p:Promise<Layer>;
        this._layers.forEach((l:Promise<Layer>, k:MapLayer) => { if(k.Id === id) p = l; });
        return p;
    }

}