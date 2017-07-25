import { Injectable, NgZone } from '@angular/core';
import { InfoBoxComponent } from './../../components/infobox';
import { GoogleInfoWindow } from './../../models/google/google-info-window';
import { GoogleMarker } from './../../models/google/google-marker';
import { IInfoWindowOptions } from './../../interfaces/iinfo-window-options';
import { ILatLong } from './../../interfaces/ilatlong';
import { InfoBoxService } from './../infobox.service';
import { MarkerService } from './../marker.service';
import { MapService } from './../map.service';

@Injectable()
export class GoogleInfoBoxService extends InfoBoxService {

    ///
    /// Field declarations
    ///

    private _boxes: Map<InfoBoxComponent, Promise<GoogleInfoWindow>> = new Map<InfoBoxComponent, Promise<GoogleInfoWindow>>();

    ///
    /// Constructors
    ///

    /**
     * Creates an instance of GoogleInfoBoxService.
     * @param {MapService} _mapService
     * @param {MarkerService} _markerService
     * @param {NgZone} _zone
     *
     * @memberof GoogleInfoBoxService
     */
    constructor(private _mapService: MapService,
        private _markerService: MarkerService,
        private _zone: NgZone) {
        super();
    }

    /**
     * Creates a new instance of an info window
     *
     * @param {InfoBoxComponent} info
     *
     * @memberof GoogleInfoBoxService
     */
    public AddInfoWindow(info: InfoBoxComponent): void {
        const options: IInfoWindowOptions = {};
        if (info.HtmlContent !== '') {
            options.htmlContent = info.HtmlContent;
        }
        if (typeof info.Latitude === 'number' && typeof info.Longitude === 'number') {
            options.position = { latitude: info.Latitude, longitude: info.Longitude };
        }
        const infoWindowPromise = this._mapService.CreateInfoWindow(options);
        this._boxes.set(info, infoWindowPromise);
    };

    /**
     * Closes the info window
     *
     * @param {InfoBoxComponent} info
     * @returns {Promise<void>}
     *
     * @memberof GoogleInfoBoxService
     */
    public Close(info: InfoBoxComponent): Promise<void> {
        this._boxes.get(info).then(w => {
            w.Close();
        });
        return Promise.resolve();
    };

    /**
     * Deletes the info window
     *
     * @param {InfoBoxComponent} info
     * @returns {Promise<void>}
     *
     * @memberof GoogleInfoBoxService
     */
    public DeleteInfoWindow(info: InfoBoxComponent): Promise<void> {
        return Promise.resolve();
    };

    /**
     * Opens the info window. Window opens on a marker, if supplied, or a specific location if given
     *
     * @param {InfoBoxComponent} info
     * @param {ILatLong} [loc]
     * @returns {Promise<void>}
     *
     * @memberof GoogleInfoBoxService
     */
    public Open(info: InfoBoxComponent, loc?: ILatLong): Promise<void> {
        if (info.CloseInfoBoxesOnOpen) {
            // close all info boxes
            this._boxes.forEach((box: Promise<GoogleInfoWindow>) => {
                box.then((w) => w.Close());
            });
        }
        return this._boxes.get(info).then((w) => {
            if (info.HostMarker != null) {
                return this._markerService.GetNativeMarker(info.HostMarker).then((marker) => {
                    return this._mapService.MapPromise.then((map) => w.Open(map, (<GoogleMarker>marker).NativePrimitve));
                });
            }
            return this._mapService.MapPromise.then((map) => {
                if (loc) { w.SetPosition(loc); }
                w.Open(map);
            });
        });
    };

    /**
     * Sets the info window options
     *
     * @param {InfoBoxComponent} info
     * @param {IInfoWindowOptions} options
     * @returns {Promise<void>}
     *
     * @memberof GoogleInfoBoxService
     */
    public SetOptions(info: InfoBoxComponent, options: IInfoWindowOptions): Promise<void> {
        return Promise.resolve();
    };

    /**
     * Sets the info window position
     *
     * @param {InfoBoxComponent} info
     * @param {ILatLong} latlng
     * @returns {Promise<void>}
     *
     * @memberof GoogleInfoBoxService
     */
    public SetPosition(info: InfoBoxComponent, latlng: ILatLong): Promise<void> {
        this._boxes.get(info).then((w) => {
            w.SetPosition(latlng);
        });
        return Promise.resolve();
    };

}
