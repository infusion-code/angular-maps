import { Injectable, NgZone } from '@angular/core';
import { InfoWindow } from '../models/infowindow';
import { IInfoWindowOptions } from "../interfaces/iinfowindowoptions";
import { ILatLong } from "../interfaces/ilatlong";
import { InfoBoxAction } from "../components/infoboxaction";
import { InfoBoxService } from "./infoboxservice";
import { MapService } from "../services/mapservice";
import { InfoBox  } from "../components/infobox";
import { BingMapService } from "./bingmapservice";
import { BingInfoWindow } from "../models/binginfowindow";

@Injectable()
export class BingInfoBoxService implements InfoBoxService {
    private _boxes: Map<InfoBox, Promise<InfoWindow>> = new Map<InfoBox, Promise<InfoWindow>>();

    constructor(private _mapService: MapService, private _zone: NgZone) { }

    public AddInfoWindow(info: InfoBox): void {
        const options: IInfoWindowOptions = {};
        if (typeof info.latitude === 'number' && typeof info.longitude === 'number') {
            options.position = {
                latitude: info.latitude,
                longitude: info.longitude
            };
        }
        if (typeof info.infoWindowActions !== 'undefined' && info.infoWindowActions.length > 0) {
            options.actions = [];
            info.infoWindowActions.forEach((action:InfoBoxAction) => {
                options.actions.push({
                    label: action.label,
                    eventHandler: () => { action.actionClicked.emit(null); }
                });
            });
        }
        if (info.HtmlContent != "") options.htmlContent = info.HtmlContent;
        else {
            options.title = info.title,
            options.description = info.description;
        }
        if (info.xOffset || info.yOffset) {
            if (options.pixelOffset == null) options.pixelOffset = { x: 0, y: 0 };
            if (info.xOffset) options.pixelOffset.x = info.xOffset;
            if (info.yOffset) options.pixelOffset.y = info.yOffset;
        }

        options.visible = info.visible;
        const infoPromise = this._mapService.CreateInfoWindow(options);
        this._boxes.set(info, infoPromise);
    }

    public Close(info: InfoBox): Promise<void> {
        return this._boxes.get(info).then((w) => w.Close());
    }

    public DeleteInfoWindow(info: InfoBox): Promise<void> {
        const w = this._boxes.get(info);
        if (w == null) {
            return Promise.resolve();
        }
        return w.then((i: InfoWindow) => {
            return this._zone.run(() => {
                i.Close();
                this._boxes.delete(info);
            });
        });
    }

    public Open(info: InfoBox, loc?: ILatLong): Promise<void> {
        return this._boxes.get(info).then((w) => {
            if (info.modal) {
                this._boxes.forEach((v: Promise<InfoWindow>, i: InfoBox) => {
                    if (info.Id != i.Id) {
                        v.then(w => w.Close());
                        i.Close();
                    }
                });
            }
            if (info.latitude && info.longitude) w.SetPosition({ latitude: info.latitude, longitude: info.longitude });
            else if (loc){
                ///
                /// this situation is specifically used for cluster layers that use spidering.
                ///
                w.SetPosition(loc);
            } 
            else if (info.hostMarker) w.SetPosition({ latitude: info.hostMarker.Latitude, longitude: info.hostMarker.Longitude });
            else { };
            w.Open();
        });
    }

    public SetOptions(info: InfoBox, options: IInfoWindowOptions): Promise<void> {
        return this._boxes.get(info).then((i: InfoWindow) => i.SetOptions(options));
    }

    public SetPosition(info: InfoBox): Promise<void> {
        return this._boxes.get(info).then((i: InfoWindow) => i.SetPosition({
            latitude: info.latitude,
            longitude: info.longitude
        }));
    }

}