import { IMarkerOptions } from "../../interfaces/imarkeroptions";
import { IMarkerIconInfo } from "../../interfaces/imarkericoninfo";
import { Marker } from '../../models/marker';
import { BingMarker } from '../../models/bingmarker';
import { Layer } from '../../models/layer';
import { MarkerTypeId } from "../../models/markertypeid";
import { MapService } from "../mapservice";
import { MapLayer } from "../../components/maplayer";
import { LayerService } from "../layerservice";
import { GoogleMapService } from "./google-map.service";
import { GoogleConversions } from "./google-conversions";


export abstract class GoogleLayerBase {

    protected abstract _layers: Map<MapLayer, Promise<Layer>>;

    constructor(protected _mapService: MapService) { }

    public abstract AddLayer(layer: MapLayer): void;

    public abstract GetNativeLayer(layer: MapLayer): Promise<Layer>;

    public abstract DeleteLayer(layer: MapLayer): Promise<void>;

    public CreateMarker(layer: number, options: IMarkerOptions): Promise<Marker> {
        return Promise.resolve({});
    }

    protected GetLayerById(id: number): Promise<Layer>{
        let p:Promise<Layer>;
        this._layers.forEach((l:Promise<Layer>, k:MapLayer) => { if(k.Id === id) p = l; });
        return p;
    }

}