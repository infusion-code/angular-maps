import { Injectable, NgZone } from '@angular/core';
import { InfoBox } from "../../components/infobox";
import { IInfoWindowOptions } from "../../interfaces/iinfowindowoptions";
import { ILatLong } from "../../interfaces/ilatlong";
import { InfoBoxService } from "../infoboxservice";
import { MapService } from "../mapservice";

@Injectable()
export class GoogleInfoBoxService extends InfoBoxService {
    
    constructor(private _mapService: MapService, private _zone: NgZone) { 
        super();
    }

    public AddInfoWindow(info: InfoBox): void {
    };

    public Close(info: InfoBox): Promise<void> {
        return Promise.resolve();
    };

    public DeleteInfoWindow(info: InfoBox): Promise<void> {
        return Promise.resolve();
    };

    public Open(info: InfoBox, loc?: ILatLong): Promise<void> {
        return Promise.resolve();
    };

    public SetOptions(info: InfoBox, options: IInfoWindowOptions): Promise<void> {
        return Promise.resolve();
    };

    public SetPosition(info: InfoBox): Promise<void> {
        return Promise.resolve();
    };

}