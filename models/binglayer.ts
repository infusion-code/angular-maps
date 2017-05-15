import { Layer } from "./layer";
import { Marker } from "./marker";
import { InfoWindow } from "./infowindow";
import { BingMapService } from "../services/bingmapservice";
import { MapService} from "../services/mapservice";

export class BingLayer implements Layer {
 
    public get NativePrimitve(): any {
        return this._layer;
    }

    constructor(private _layer: Microsoft.Maps.Layer, private _maps: MapService){ }

    public AddListener(eventType: string, fn: Function): void {
        Microsoft.Maps.Events.addHandler(this._layer, eventType, (e) => {
            fn(e);
        });
    }

    public AddEntity(entity: Marker|InfoWindow|any): void {
        if(entity.NativePrimitve) this._layer.add(entity.NativePrimitve);
    }

    public Delete(): void{
        this._maps.DeleteLayer(this);
        this._layer.dispose();
    }
    
    public GetVisible(): boolean  {
        return this._layer.getVisible();
    }

    public RemoveEntity(entity: Marker|InfoWindow|any): void {
        if(entity.NativePRimitive) this._layer.remove(entity.NativePrimitve);
    }

    public SetEntities(entities: Array<Marker>|Array<InfoWindow>|Array<any>): void {
        let p: Array<Microsoft.Maps.IPrimitive> = new Array<Microsoft.Maps.IPrimitive>();
        (<Array<any>>entities).forEach((e:any) => { if(e.NativePrimitve) p.push(<Microsoft.Maps.IPrimitive>e.NativePrimitve); }); 
        this._layer.setPrimitives(p);
    }
    
    public SetVisible(visible: boolean): void {
        this._layer.setVisible(visible);
    }

}