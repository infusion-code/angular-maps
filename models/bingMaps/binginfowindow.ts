import { BingMapService }       from "../../services/bingMaps/bingmapservice";
import { BingConversions }      from "../../services/bingMaps/bingconversions";
import { ILatLong }             from "../../interfaces/ilatlong";
import { IInfoWindowOptions }   from "../../interfaces/iinfowindowoptions";
import { InfoWindow }           from "../infowindow";

export class BingInfoWindow implements InfoWindow {

    public get NativePrimitve(): any {
        return this._infoBox;
    }
    
    constructor(private _infoBox: Microsoft.Maps.Infobox) { }

    public Close(): void {
        let o: Microsoft.Maps.IInfoboxOptions = {};
        o.visible = false;
        this._infoBox.setOptions(o);
    };

    public GetPosition(): ILatLong {
        let p: ILatLong = {
            latitude: this._infoBox.getLocation().latitude,
            longitude: this._infoBox.getLocation().longitude
        };
        return p;
    };

    public Open(): void {
        let o: Microsoft.Maps.IInfoboxOptions = {};
        o.visible = true;
        this._infoBox.setOptions(o);
    };

    public SetOptions(options: IInfoWindowOptions): void {
        let o: Microsoft.Maps.IInfoboxOptions = BingConversions.TranslateInfoBoxOptions(options);
        this._infoBox.setOptions(o);
    };

    public SetPosition(position: ILatLong): void {
        let l: Microsoft.Maps.Location = BingConversions.TranslateLocation(position)
        this._infoBox.setLocation(l);
    };


}
