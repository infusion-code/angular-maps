import { Injectable, NgZone }   from '@angular/core';
import { InfoWindow }           from '../../models/infowindow';
import { BingInfoWindow }       from "../../models/bingmaps/binginfowindow";
import { IInfoWindowOptions }   from "../../interfaces/iinfowindowoptions";
import { ILatLong }             from "../../interfaces/ilatlong";
import { InfoBox  }             from "../../components/infobox";
import { InfoBoxAction }        from "../../components/infoboxaction";
import { InfoBoxService }       from "../infoboxservice";
import { MapService }           from "../mapservice";
import { BingMapService }       from "./bingmapservice";

/**
 * Concrete implementation of the {@link InfoBoxService} contract for the Bing Maps V8 architecture. 
 * 
 * @export
 * @class BingInfoBoxService
 * @implements {InfoBoxService}
 */
@Injectable()
export class BingInfoBoxService implements InfoBoxService {

    ///
    /// Field declarations
    ///
    private _boxes: Map<InfoBox, Promise<InfoWindow>> = new Map<InfoBox, Promise<InfoWindow>>();

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of BingInfoBoxService.
     * @param {MapService} _mapService - Concrete {@link MapService} implementation for Bing Maps V8. An instance of {@link BingMapService}.
     * @param {NgZone} _zone - An instance of NgZone to provide zone aware promises. 
     * 
     * @memberof BingInfoBoxService
     */
    constructor(private _mapService: MapService, private _zone: NgZone) { }

    /**
     * Adds an info window to the map or layer. 
     * 
     * @param {InfoBox} info - {@link InfoBox} component object representing the infobox. 
     * 
     * @memberof BingInfoBoxService
     */    
    public AddInfoWindow(info: InfoBox): void {
        const options: IInfoWindowOptions = {};
        if (typeof info.Latitude === 'number' && typeof info.Longitude === 'number') {
            options.position = {
                latitude: info.Latitude,
                longitude: info.Longitude
            };
        }
        if (typeof info.InfoWindowActions !== 'undefined' && info.InfoWindowActions.length > 0) {
            options.actions = [];
            info.InfoWindowActions.forEach((action:InfoBoxAction) => {
                options.actions.push({
                    label: action.Label,
                    eventHandler: () => { action.ActionClicked.emit(null); }
                });
            });
        }
        if (info.HtmlContent != "") options.htmlContent = info.HtmlContent;
        else {
            options.title = info.Title,
            options.description = info.Description;
        }
        if (info.xOffset || info.yOffset) {
            if (options.pixelOffset == null) options.pixelOffset = { x: 0, y: 0 };
            if (info.xOffset) options.pixelOffset.x = info.xOffset;
            if (info.yOffset) options.pixelOffset.y = info.yOffset;
        }

        options.visible = info.Visible;
        const infoPromise = this._mapService.CreateInfoWindow(options);
        this._boxes.set(info, infoPromise);
    }

    /**
     * Closes an infobox that is open.
     * 
     * @abstract
     * @param {InfoBox} info - {@link InfoBox} component object representing the infobox. 
     * @returns {Promise<void>} - A promise that is fullfilled when the infobox has been closed.
     * 
     * @memberof InfoBoxService
     */
    public Close(info: InfoBox): Promise<void> {
        return this._boxes.get(info).then((w) => w.Close());
    }

    /**
     * Deletes an infobox. 
     * 
     * @abstract
     * @param {InfoBox} info - {@link InfoBox} component object representing the infobox. 
     * @returns {Promise<void>} - A promise that is fullfilled when the infobox has been deleted.
     * 
     * @memberof InfoBoxService
     */
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

    /**
     * Opens an infobox that is closed.
     * 
     * @abstract
     * @param {InfoBox} info - {@link InfoBox} component object representing the infobox. 
     * @returns {Promise<void>} - A promise that is fullfilled when the infobox has been opened.
     * 
     * @memberof InfoBoxService
     */
    public Open(info: InfoBox, loc?: ILatLong): Promise<void> {
        return this._boxes.get(info).then((w) => {
            if (info.Modal) {
                this._boxes.forEach((v: Promise<InfoWindow>, i: InfoBox) => {
                    if (info.Id != i.Id) {
                        v.then(w => w.Close());
                        i.Close();
                    }
                });
            }
            if (info.Latitude && info.Longitude) w.SetPosition({ latitude: info.Latitude, longitude: info.Longitude });
            else if (loc){
                ///
                /// this situation is specifically used for cluster layers that use spidering.
                ///
                w.SetPosition(loc);
            } 
            else if (info.HostMarker) w.SetPosition({ latitude: info.HostMarker.Latitude, longitude: info.HostMarker.Longitude });
            else { };
            w.Open();
        });
    }

    /**
     * Sets the infobox options.
     * 
     * @abstract
     * @param {InfoBox} info - {@link InfoBox} component object representing the infobox. 
     * @param {IInfoWindowOptions} options - {@link IInfoWindowOptions} object containing the options to set. Options provided are
     * merged with the existing options of the underlying infobox. 
     * @returns {Promise<void>} - A promise that is fullfilled when the infobox options have been updated.
     * 
     * @memberof InfoBoxService
     */
    public SetOptions(info: InfoBox, options: IInfoWindowOptions): Promise<void> {
        return this._boxes.get(info).then((i: InfoWindow) => i.SetOptions(options));
    }

    /**
     * Set the position of the infobox based on the properties set on the InfoBox component. 
     * 
     * @abstract
     * @param {InfoBox} info - {@link InfoBox} component object representing the infobox. 
     * @returns {Promise<void>} - A promise that is fullfilled when the infobox position has been updated.
     * 
     * @memberof InfoBoxService
     */
    public SetPosition(info: InfoBox): Promise<void> {
        return this._boxes.get(info).then((i: InfoWindow) => i.SetPosition({
            latitude: info.Latitude,
            longitude: info.Longitude
        }));
    }

}