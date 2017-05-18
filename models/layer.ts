import { ILayerOptions } from "../interfaces/ilayeroptions";
import { Marker } from "./marker";
import { InfoWindow } from "./infowindow";

export abstract class Layer {

    public abstract get NativePrimitve(): any;


    public abstract AddListener(eventType: string, fn: Function): void;
    public abstract AddEntity(entity: Marker|InfoWindow|any): void;
    public abstract Delete(): void;
    public abstract GetOptions(): ILayerOptions;
    public abstract GetVisible(): boolean 
    public abstract RemoveEntity(entity: Marker|InfoWindow|any): void;
    public abstract SetEntities(entities: Array<Marker>|Array<InfoWindow>|Array<any>): void;
    public abstract SetOptions(options: ILayerOptions): void;
    public abstract SetVisible(visible: boolean): void;

}