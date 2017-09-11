import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { InfoBoxComponent } from './../../components/infobox';
import { IInfoWindowOptions } from './../../interfaces/iinfo-window-options';
import { ILatLong } from './../../interfaces/ilatlong';
import { InfoBoxService } from './../infobox.service';
import { MarkerService } from './../marker.service';
import { MapService } from './../map.service';
import { InfoWindow } from '../../models/info-window';
import { GoogleInfoWindow } from './../../models/google/google-info-window';
import { GoogleMarker } from './../../models/google/google-marker';
import { GoogleMapEventsLookup } from './../../models/google/google-events-lookup';

@Injectable()
export class GoogleInfoBoxService extends InfoBoxService {

    ///
    /// Field declarations
    ///

    private _boxes: Map<InfoBoxComponent, Promise<InfoWindow>> = new Map<InfoBoxComponent, Promise<GoogleInfoWindow>>();

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
        else {
            options.title = info.Title;
            options.description = info.Description;
        }
        if (info.xOffset || info.yOffset) {
            if (options.pixelOffset == null) { options.pixelOffset = { x: 0, y: 0 }; }
            if (info.xOffset) { options.pixelOffset.x = info.xOffset; }
            if (info.yOffset) { options.pixelOffset.y = info.yOffset; }
        }
        options.disableAutoPan = info.DisableAutoPan;
        options.visible = info.Visible;

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
     * @returns {Promise<void>} -  A promise that is resolved when the info box is closed.
     *
     * @memberof GoogleInfoBoxService
     */
    public Close(info: InfoBoxComponent): Promise<void> {
        return this._boxes.get(info).then(w => {
            w.Close();
        });
    };

    /**
     * Registers an event delegate for an info window.
     *
     * @template T - Type of the event to emit.
     * @param {string} eventName - The name of the event to register (e.g. 'click')
     * @param {InfoBoxComponent} infoComponent - The {@link InfoBoxComponent} for which to register the event.
     * @returns {Observable<T>} - Observable emiting an instance of T each time the event occurs.
     *
     * @memberof GoogleInfoBoxService
     */
    public CreateEventObservable<T>(eventName: string, infoComponent: InfoBoxComponent): Observable<T> {
        const googleEventName: string = GoogleMapEventsLookup[eventName];
        return Observable.create((observer: Observer<T>) => {
            this._boxes.get(infoComponent).then((b: InfoWindow) => {
                b.AddListener(googleEventName, (e: T) => this._zone.run(() => observer.next(e)));
            });
        });
    }

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
        if (info.CloseInfoBoxesOnOpen || info.Modal) {
            // close all open info boxes
            this._boxes.forEach((box: Promise<InfoWindow>, i: InfoBoxComponent) => {
                if (info.Id !== i.Id) {
                    box.then((w) => {
                        if (w.IsOpen) {
                            w.Close();
                            i.Close();
                        }
                    });
                }
            });
        }
        return this._boxes.get(info).then((w: GoogleInfoWindow) => {
            const options: IInfoWindowOptions = {};
            if (info.HtmlContent !== '') {
                options.htmlContent = info.HtmlContent;
            }
            else {
                options.title = info.Title;
                options.description = info.Description;
            }
            w.SetOptions(options);
            if (info.HostMarker != null) {
                return this._markerService.GetNativeMarker(info.HostMarker).then((marker) => {
                    return this._mapService.MapPromise.then((map) => (<GoogleInfoWindow>w).Open((<GoogleMarker>marker).NativePrimitve));
                });
            }
            return this._mapService.MapPromise.then((map) => {
                if (loc) { w.SetPosition(loc); }
                w.Open();
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
        return this._boxes.get(info).then((w: GoogleInfoWindow) => {
            w.SetOptions(options);
        });
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
