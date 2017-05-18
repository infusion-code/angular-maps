import { IClusterOptions } from "../interfaces/iclusteroptions";
import { Layer } from "./layer";
import { Marker } from "./marker";
import { InfoWindow } from "./infowindow";
import { BingConversions } from "../services/bingconversions";
import { BingMapService } from "../services/bingmapservice";
import { MapService} from "../services/mapservice";

export class BingClusterLayer implements Layer {

    private _markers: Array<Marker> = new Array<Marker>(); 

    public get NativePrimitve(): any {
        return this._layer;
    }

    constructor(private _layer: Microsoft.Maps.ClusterLayer, private _maps: MapService){ }

    public AddListener(eventType: string, fn: Function): void {
        Microsoft.Maps.Events.addHandler(this._layer, eventType, (e) => {
            fn(e);
        });
    }

    public AddEntity(entity: Marker|InfoWindow|any): void {
        if(entity.NativePrimitve && entity.Location){
            let p: Array<Microsoft.Maps.Pushpin> = this._layer.getPushpins();
            p.push(entity.NativePrimitve)
            this._layer.setPushpins(p);
            this._markers.push(entity);
        }
    }

    public Delete(): void{
        this._maps.DeleteLayer(this);
    }
    
    public GetMarkerFromBingMarker(pin: Microsoft.Maps.Pushpin): Marker {
        let i: number = this._markers.findIndex(e => e.NativePrimitve === pin);
        if (i > -1) return this._markers[i];
        return null;
    }

    public GetOptions(): IClusterOptions{
        let o:Microsoft.Maps.IClusterLayerOptions = this._layer.getOptions();
        let options: IClusterOptions = {
            id: 0,
            gridSize: o.gridSize,
            layerOffset: o.layerOffset,
            clusteringEnabled: o.clusteringEnabled,
            callback: o.callback,
            clusteredPinCallback: o.clusteredPinCallback,
            visible: o.visible,
            zIndex: o.zIndex
        };
        return options;
    }

    public GetVisible(): boolean  {
        return this._layer.getOptions().visible;
    }

    public RemoveEntity(entity: Marker|InfoWindow|any): void {
        if(entity.NativePrimitve && entity.Location){
            let p: Array<Microsoft.Maps.Pushpin> = this._layer.getPushpins();
            let i: number = p.findIndex(x => x===entity.NativePrimitve);
            let j: number = this._markers.findIndex( m => m === entity);
            if(i > -1) p.splice(i, 1);
            if(j > -1) this._markers.splice(j, 1);
            this._layer.setPushpins(p);
        }
    }

    public SetEntities(entities: Array<Marker>|Array<InfoWindow>|Array<any>): void {
        let p: Array<Microsoft.Maps.Pushpin> = new Array<Microsoft.Maps.Pushpin>();
        this._markers.splice(0);
        (<Array<any>>entities).forEach((e:any) => { 
            if(e.NativePrimitve && e.Location) {
                this._markers.push(e);
                p.push(<Microsoft.Maps.Pushpin>e.NativePrimitve);} 
        }); 
        this._layer.setPushpins(p);
    }
    
    public SetOptions(options: IClusterOptions){
        let o:Microsoft.Maps.IClusterLayerOptions = BingConversions.TranslateClusterOptions(options);
        this._layer.setOptions(o);
    }

    public SetVisible(visible: boolean): void {
        let o:Microsoft.Maps.IClusterLayerOptions = this._layer.getOptions();
        o.visible = visible;
        this._layer.setOptions(o);
    }

}