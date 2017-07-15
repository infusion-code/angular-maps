import { IMarkerOptions } from './../../interfaces/imarker-options';
import { IMarkerIconInfo } from './../../interfaces/imarker-icon-info';
import { Marker } from './../../models/marker';
import { Layer } from './../../models/layer';
import { MarkerTypeId } from './../../models/marker-type-id';
import { MapService } from './../map.service';
import { MapLayerDirective } from './../../components/map-layer';
import { LayerService } from './../layer.service';
import { GoogleMapService } from './google-map.service';
import { GoogleConversions } from './google-conversions';

export abstract class GoogleLayerBase {

    protected abstract _layers: Map<MapLayerDirective, Promise<Layer>>;

    constructor(protected _mapService: MapService) { }

    public abstract AddLayer(layer: MapLayerDirective): void;

    public abstract GetNativeLayer(layer: MapLayerDirective): Promise<Layer>;

    public abstract DeleteLayer(layer: MapLayerDirective): Promise<void>;

    public CreateMarker(layer: number, options: IMarkerOptions): Promise<Marker> {
        return Promise.resolve({});
    }

    protected GetLayerById(id: number): Promise<Layer> {
        let p: Promise<Layer>;
        this._layers.forEach((l: Promise<Layer>, k: MapLayerDirective) => { if (k.Id === id) { p = l; } });
        return p;
    }

}
