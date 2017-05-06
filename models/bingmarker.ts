import { ILatLong } from "../interfaces/ilatlong";
import { IPoint } from "../interfaces/ipoint";
import { IMarkerOptions } from "../interfaces/Imarkeroptions";
import { Marker } from "./Marker";
import { BingConversions } from "../services/bingconversions";
import { } from "@types/bingmaps";

export class BingMarker implements Marker  {

    constructor(private _pushpin: Microsoft.Maps.Pushpin) { }

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
        let o: Microsoft.Maps.PushpinOptions = {};
        o.visible = false;
        this._pushpin.setOptions(o);
    }

    public GetLabel(): string {
        return this._pushpin.getText();
    }

    public SetAnchor(anchor: IPoint): void {
        let o: Microsoft.Maps.PushpinOptions = {};
        o.anchor = new Microsoft.Maps.Point(anchor.x, anchor.y);
        this._pushpin.setOptions(o);
    }

    public SetDraggable(draggable: boolean): void {
        let o: Microsoft.Maps.PushpinOptions = {};
        o.draggable = draggable;
        this._pushpin.setOptions(o);
    }

    public SetIcon(icon: string): void {
        let o: Microsoft.Maps.PushpinOptions = {};
        o.icon = icon;
        this._pushpin.setOptions(o);
    }

    public SetLabel(label: string): void {
        let o: Microsoft.Maps.PushpinOptions = {};
        o.text = label;
        this._pushpin.setOptions(o);
    }

    public SetPosition(latLng: ILatLong): void {
        let p: Microsoft.Maps.Location = BingConversions.TranslateLocation(latLng);
        this._pushpin.setLocation(p);
    }

    public SetTitle(title: string): void {
        let o: Microsoft.Maps.PushpinOptions | any = {};
        o["title"] = title;
            // title is for whatever reason not defined in the interface, but it is the correct property.
        this._pushpin.setOptions(o);
    }

    public SetOptions(options: IMarkerOptions): void {
        let o: Microsoft.Maps.PushpinOptions = BingConversions.TranslateOptions(options);
        this._pushpin.setOptions(o);
    }

}