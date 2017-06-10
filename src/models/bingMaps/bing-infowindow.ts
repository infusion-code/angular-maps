import { ILatLong } from './../../interfaces/ilatlong';
import { IInfoWindowOptions } from './../../interfaces/iinfowindowoptions';
import { InfoWindow } from './../infowindow';
import { BingMapService } from './../../services/bingMaps/bing-map.service';
import { BingConversions } from './../../services/bingMaps/bing-conversions';

export class BingInfoWindow implements InfoWindow {

    public get NativePrimitve(): any {
        return this._infoBox;
    }

    constructor(private _infoBox: Microsoft.Maps.Infobox) { }

    public Close(): void {
        const o: Microsoft.Maps.IInfoboxOptions = {};
        o.visible = false;
        this._infoBox.setOptions(o);
    };

    public GetPosition(): ILatLong {
        const p: ILatLong = {
            latitude: this._infoBox.getLocation().latitude,
            longitude: this._infoBox.getLocation().longitude
        };
        return p;
    };

    public Open(): void {
        const o: Microsoft.Maps.IInfoboxOptions = {};
        o.visible = true;
        this._infoBox.setOptions(o);
    };

    public SetOptions(options: IInfoWindowOptions): void {
        const o: Microsoft.Maps.IInfoboxOptions = BingConversions.TranslateInfoBoxOptions(options);
        this._infoBox.setOptions(o);
    };

    public SetPosition(position: ILatLong): void {
        const l: Microsoft.Maps.Location = BingConversions.TranslateLocation(position)
        this._infoBox.setLocation(l);
    };


}
