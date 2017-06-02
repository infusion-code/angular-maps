import { Injectable, NgZone } from '@angular/core';
import { InfoBoxComponent } from '../../components/infobox';
import { IInfoWindowOptions } from '../../interfaces/iinfowindowoptions';
import { ILatLong } from '../../interfaces/ilatlong';
import { InfoBoxService } from '../infoboxservice';
import { MapService } from '../mapservice';

@Injectable()
export class GoogleInfoBoxService extends InfoBoxService {

    constructor(private _mapService: MapService, private _zone: NgZone) {
        super();
    }

    public AddInfoWindow(info: InfoBoxComponent): void {
    };

    public Close(info: InfoBoxComponent): Promise<void> {
        return Promise.resolve();
    };

    public DeleteInfoWindow(info: InfoBoxComponent): Promise<void> {
        return Promise.resolve();
    };

    public Open(info: InfoBoxComponent, loc?: ILatLong): Promise<void> {
        return Promise.resolve();
    };

    public SetOptions(info: InfoBoxComponent, options: IInfoWindowOptions): Promise<void> {
        return Promise.resolve();
    };

    public SetPosition(info: InfoBoxComponent): Promise<void> {
        return Promise.resolve();
    };

}
