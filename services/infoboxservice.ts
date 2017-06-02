import { Injectable } from '@angular/core';
import { InfoBoxComponent } from '../components/infobox';
import { IInfoWindowOptions } from '../interfaces/iinfowindowoptions';
import { ILatLong } from '../interfaces/ilatlong';

@Injectable()
export abstract class InfoBoxService {

    abstract AddInfoWindow(info: InfoBoxComponent): void;

    abstract Close(info: InfoBoxComponent): Promise<void>;

    abstract DeleteInfoWindow(info: InfoBoxComponent): Promise<void>;

    abstract Open(info: InfoBoxComponent, loc?: ILatLong): Promise<void>;

    abstract SetOptions(info: InfoBoxComponent, options: IInfoWindowOptions): Promise<void>;

    abstract SetPosition(info: InfoBoxComponent): Promise<void>;

}
