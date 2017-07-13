import { Injectable, NgZone } from '@angular/core';
import { InfoWindow } from './../../models/info-window';
import { IInfoWindowOptions } from './../../interfaces/iinfo-window-options';
import { ILatLong } from './../../interfaces/ilatlong';
import { InfoBoxActionDirective } from './../../components/infobox-action';
import { InfoBoxService } from './../infobox.service';
import { MapService } from './../../services/map.service';
import { InfoBoxComponent } from './../../components/infobox';
import { BingMapService } from './bing-map.service';
import { BingInfoWindow } from './../../models/bing/bing-info-window';

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
    private _boxes: Map<InfoBoxComponent, Promise<InfoWindow>> = new Map<InfoBoxComponent, Promise<InfoWindow>>();

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
     * @param {InfoBoxComponent} info - {@link InfoBoxComponent} component object representing the infobox.
     *
     * @memberof BingInfoBoxService
     */
    public AddInfoWindow(info: InfoBoxComponent): void {
        const options: IInfoWindowOptions = {};
        if (typeof info.Latitude === 'number' && typeof info.Longitude === 'number') {
            options.position = {
                latitude: info.Latitude,
                longitude: info.Longitude
            };
        }
        if (typeof info.InfoWindowActions !== 'undefined' && info.InfoWindowActions.length > 0) {
            options.actions = [];
            info.InfoWindowActions.forEach((action: InfoBoxActionDirective) => {
                options.actions.push({
                    label: action.Label,
                    eventHandler: () => { action.ActionClicked.emit(null); }
                });
            });
        }
        if (info.HtmlContent !== '') {
            options.htmlContent = info.HtmlContent;
        } else {
            options.title = info.Title;
            options.description = info.Description;
        }
        if (info.xOffset || info.yOffset) {
            if (options.pixelOffset == null) { options.pixelOffset = { x: 0, y: 0 }; }
            if (info.xOffset) { options.pixelOffset.x = info.xOffset; }
            if (info.yOffset) { options.pixelOffset.y = info.yOffset; }
        }

        options.visible = info.Visible;
        const infoPromise = this._mapService.CreateInfoWindow(options);
        this._boxes.set(info, infoPromise);
    }

    /**
     * Closes an InfoBoxComponent that is open.
     *
     * @abstract
     * @param {InfoBoxComponent} info - {@link InfoBoxComponent} component object representing the infobox.
     * @returns {Promise<void>} - A promise that is fullfilled when the infobox has been closed.
     *
     * @memberof InfoBoxService
     */
    public Close(info: InfoBoxComponent): Promise<void> {
        return this._boxes.get(info).then((w) => w.Close());
    }

    /**
     * Deletes an infobox.
     *
     * @abstract
     * @param {InfoBoxComponent} info - {@link InfoBoxComponent} component object representing the infobox.
     * @returns {Promise<void>} - A promise that is fullfilled when the infobox has been deleted.
     *
     * @memberof InfoBoxService
     */
    public DeleteInfoWindow(info: InfoBoxComponent): Promise<void> {
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
     * @param {InfoBoxComponent} info - {@link InfoBoxComponent} component object representing the infobox.
     * @returns {Promise<void>} - A promise that is fullfilled when the infobox has been opened.
     *
     * @memberof InfoBoxService
     */
    public Open(info: InfoBoxComponent, loc?: ILatLong): Promise<void> {
        return this._boxes.get(info).then((w) => {
            if (info.Modal) {
                this._boxes.forEach((v: Promise<InfoWindow>, i: InfoBoxComponent) => {
                    if (info.Id !== i.Id) {
                        v.then(w1 => w1.Close());
                        i.Close();
                    }
                });
            }
            if (info.Latitude && info.Longitude) {
                w.SetPosition({ latitude: info.Latitude, longitude: info.Longitude });
            } else if (loc) {
                ///
                /// this situation is specifically used for cluster layers that use spidering.
                ///
                w.SetPosition(loc);
            } else if (info.HostMarker) {
                w.SetPosition({ latitude: info.HostMarker.Latitude, longitude: info.HostMarker.Longitude });
            }
            w.Open();
        });
    }

    /**
     * Sets the infobox options.
     *
     * @abstract
     * @param {InfoBoxComponent} info - {@link InfoBoxComponent} component object representing the infobox.
     * @param {IInfoWindowOptions} options - {@link IInfoWindowOptions} object containing the options to set. Options provided are
     * merged with the existing options of the underlying infobox.
     * @returns {Promise<void>} - A promise that is fullfilled when the infobox options have been updated.
     *
     * @memberof InfoBoxService
     */
    public SetOptions(info: InfoBoxComponent, options: IInfoWindowOptions): Promise<void> {
        return this._boxes.get(info).then((i: InfoWindow) => i.SetOptions(options));
    }

    /**
     * Set the position of the infobox based on the properties set on the InfoBox component.
     *
     * @abstract
     * @param {InfoBoxComponent} info - {@link InfoBoxComponent} component object representing the infobox.
     * @returns {Promise<void>} - A promise that is fullfilled when the infobox position has been updated.
     *
     * @memberof InfoBoxService
     */
    public SetPosition(info: InfoBoxComponent): Promise<void> {
        return this._boxes.get(info).then((i: InfoWindow) => i.SetPosition({
            latitude: info.Latitude,
            longitude: info.Longitude
        }));
    }

}
