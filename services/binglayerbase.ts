import { IMarkerOptions } from '../interfaces/imarkeroptions';
import { IMarkerIconInfo } from '../interfaces/imarkericoninfo';
import { Marker } from '../models/marker';
import { BingMarker } from '../models/bingmarker';
import { Layer } from '../models/layer';
import { MarkerTypeId } from '../models/markertypeid';
import { MapService } from './mapservice';
import { MapLayerDirective } from '../components/maplayer';
import { LayerService } from './layerservice';
import { BingMapService } from './bingmapservice';
import { BingConversions } from './bingconversions';


export abstract class BingLayerBase {

    protected abstract _layers: Map<MapLayerDirective, Promise<Layer>>;

    constructor(protected _mapService: MapService) { }

    public abstract AddLayer(layer: MapLayerDirective): void;

    public abstract GetNativeLayer(layer: MapLayerDirective): Promise<Layer>;

    public abstract DeleteLayer(layer: MapLayerDirective): Promise<void>;

    public CreateMarker(layer: number, options: IMarkerOptions): Promise<Marker> {
        const p: Promise<Layer>  = this.GetLayerById(layer);
        if (p == null) {
            throw(Error(`Layer with id ${layer} not found in Layer Map`));
        }
        return p.then((l: Layer) => {
            const loc: Microsoft.Maps.Location = BingConversions.TranslateLocation(options.position);
            const o: Microsoft.Maps.IPushpinOptions = BingConversions.TranslateMarkerOptions(options);
            if (o.icon == null) {
                const s = 48;
                const iconInfo: IMarkerIconInfo = {
                    markerType: MarkerTypeId.CanvasMarker,
                    rotation: 45,
                    drawingOffset: { x: 24, y: 0 },
                    points: [
                        { x: 10, y: 40 },
                        { x: 24, y: 30 },
                        { x: 38, y: 40 },
                        { x: 24, y: 0 }
                    ],
                    color: '#f00',
                    size: { width: s, height: s }
                };
                o.icon = Marker.CreateMarker(iconInfo);
                o.anchor = new Microsoft.Maps.Point(iconInfo.size.width * 0.75, iconInfo.size.height * 0.25);
                o.textOffset = new Microsoft.Maps.Point(0, iconInfo.size.height * 0.66);
            }
            const pushpin: Microsoft.Maps.Pushpin = new Microsoft.Maps.Pushpin(loc, o);
            const marker: BingMarker =  new BingMarker(pushpin);
            if (options.metadata) {
                options.metadata.forEach((v, k) => marker.Metadata.set(k, v));
            }
            l.AddEntity(marker);
            return marker;
        });

    }

    protected GetLayerById(id: number): Promise<Layer> {
        let p: Promise<Layer>;
        this._layers.forEach((l: Promise<Layer>, k: MapLayerDirective) => { if (k.Id === id) { p = l; }});
        return p;
    }

}
