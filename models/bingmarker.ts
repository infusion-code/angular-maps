import { ILatLong } from "../interfaces/ilatlong";
import { IPoint } from "../interfaces/ipoint";
import { IMarkerOptions } from "../interfaces/Imarkeroptions";
import { Marker } from "./Marker";
import { BingMapService } from "../services/bingmapservice";
import { BingConversions } from "../services/bingconversions";

export class BingMarker implements Marker  {

    constructor(private _pushpin: Microsoft.Maps.Pushpin) { }

    public get NativePrimitve(): any {
        return this._pushpin;
    }

    public get Location(): ILatLong {
        let l: Microsoft.Maps.Location = this._pushpin.getLocation();
        return {
            latitude: l.latitude,
            longitude: l.longitude
        }
    }

    public AddListener(eventType: string, fn: Function): void {
        Microsoft.Maps.Events.addHandler(this._pushpin, eventType, (e) => {
            fn(e);
        });
    }

    public DeleteMarker(): void {
        let o: Microsoft.Maps.IPushpinOptions = {};
        o.visible = false;
        this._pushpin.setOptions(o);
    }

    public GetLabel(): string {
        return this._pushpin.getText();
    }

    public SetAnchor(anchor: IPoint): void {
        let o: Microsoft.Maps.IPushpinOptions = {};
        o.anchor = new Microsoft.Maps.Point(anchor.x, anchor.y);
        this._pushpin.setOptions(o);
    }

    public SetDraggable(draggable: boolean): void {
        let o: Microsoft.Maps.IPushpinOptions = {};
        o.draggable = draggable;
        this._pushpin.setOptions(o);
    }

    public SetIcon(icon: string): void {
        let o: Microsoft.Maps.IPushpinOptions = {};
        o.icon = icon;
        this._pushpin.setOptions(o);
    }

    public SetLabel(label: string): void {
        let o: Microsoft.Maps.IPushpinOptions = {};
        o.text = label;
        this._pushpin.setOptions(o);
    }

    public SetPosition(latLng: ILatLong): void {
        let p: Microsoft.Maps.Location = BingConversions.TranslateLocation(latLng);
        this._pushpin.setLocation(p);
    }

    public SetTitle(title: string): void {
        let o: Microsoft.Maps.IPushpinOptions | any = {};
        o.title = title;
        this._pushpin.setOptions(o);
    }

    public SetOptions(options: IMarkerOptions): void {
        let o: Microsoft.Maps.IPushpinOptions = BingConversions.TranslateOptions(options);
        this._pushpin.setOptions(o);
    }

}