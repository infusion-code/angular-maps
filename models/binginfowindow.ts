import { ILatLong } from "../interfaces/ilatlong";
import { IInfoWindowOptions } from "../interfaces/iinfowindowoptions";
import { InfoWindow } from "./infowindow";
import { BingConversions } from "../services/bingconversions";
import { } from "@types/bingmaps";

export class BingInfoWindow implements InfoWindow {

    constructor(private infoBox: Microsoft.Maps.Infobox) { }

    public Close(): void {
        let o: Microsoft.Maps.InfoboxOptions = {};
        o.visible = false;
        this.infoBox.setOptions(o);
    };

    public GetPosition(): ILatLong {
        let p: ILatLong = {
            latitude: this.infoBox.getLocation().latitude,
            longitude: this.infoBox.getLocation().longitude
        };
        return p;
    };

    public Open(): void {
        let o: Microsoft.Maps.InfoboxOptions = {};
        o.visible = true;
        this.infoBox.setOptions(o);
    };

    public SetOptions(options: IInfoWindowOptions): void {
        let o: Microsoft.Maps.InfoboxOptions = BingConversions.TranslateInfoBoxOptions(options);
        this.infoBox.setOptions(o);
    };

    public SetPosition(position: ILatLong): void {
        let l: Microsoft.Maps.Location = BingConversions.TranslateLocation(position)
        this.infoBox.setLocation(l);
    };


}
