import { ILatLong } from '../../interfaces/ilatlong';
import { IInfoWindowOptions } from '../../interfaces/iinfo-window-options';
import { InfoWindow } from '../info-window';
import { BingMapService } from '../../services/bing/bing-map.service';
import { BingConversions } from '../../services/bing/bing-conversions';

/**
 * Concrete implementation of the {@link InfoWindow} contract for the Bing Maps V8 map architecture.
 *
 * @export
 */
export class BingInfoWindow implements InfoWindow {

    private _isOpen: boolean;

    /**
     * Gets whether the info box is currently open.
     *
     * @readonly
     * @memberof BingInfoWindow
     */
    public get IsOpen(): boolean {
        if (this._infoBox && this._infoBox.getOptions().visible === true) { return true; }
        return false;
    }

    /**
     * Gets native primitve underlying the model.
     *
     * @memberof BingInfoWindow
     * @property
     * @readonly
     */
    public get NativePrimitve(): Microsoft.Maps.Infobox {
        return this._infoBox;
    }

    /**
     * Creates an instance of BingInfoWindow.
     * @param _infoBox - A {@link Microsoft.Maps.Infobox} instance underlying the model
     * @memberof BingInfoWindow
     */
    constructor(private _infoBox: Microsoft.Maps.Infobox) {
        this._isOpen = false;
    }

    /**
     * Adds an event listener to the InfoWindow.
     *
     * @param eventType - String containing the event for which to register the listener (e.g. "click")
     * @param fn - Delegate invoked when the event occurs.
     *
     * @memberof BingInfoWindow
     * @method
     */
    public AddListener(eventType: string, fn: Function): void {
        Microsoft.Maps.Events.addHandler(this._infoBox, eventType, (e) => {
            if (e.eventName === 'infoboxChanged') {
                if (this._infoBox.getOptions().visible === true) { this._isOpen = true; }
                else {
                    if (this._infoBox.getOptions().visible === false && this._isOpen === true) {
                        this._isOpen = false;
                        fn(e);
                    }
                }
            }
            else {
                fn(e);
            }
        });
    }

    /**
     * Closes the info window.
     *
     * @memberof BingInfoWindow
     * @method
     */
    public Close(): void {
        const o: Microsoft.Maps.IInfoboxOptions = {};
        o.visible = false;
        this._infoBox.setOptions(o);
    }

    /**
     * Gets the position of the info window.
     *
     * @returns - Returns the geo coordinates of the info window.
     * @memberof BingInfoWindow
     * @method
     */
    public GetPosition(): ILatLong {
        const p: ILatLong = {
            latitude: this._infoBox.getLocation().latitude,
            longitude: this._infoBox.getLocation().longitude
        };
        return p;
    }

    /**
     * Opens the info window.
     *
     * @memberof BingInfoWindow
     * @method
     */
    public Open(): void {
        const o: Microsoft.Maps.IInfoboxOptions = {};
        o.visible = true;
        this._infoBox.setOptions(o);
    }

    /**
     * Sets the info window options.
     *
     * @param options - Info window options to set. The options will be merged with any existing options.
     *
     * @memberof BingInfoWindow
     * @method
     */
    public SetOptions(options: IInfoWindowOptions): void {
        const o: Microsoft.Maps.IInfoboxOptions = BingConversions.TranslateInfoBoxOptions(options);
        this._infoBox.setOptions(o);
    }

    /**
     * Sets the info window position.
     *
     * @param position - Geo coordinates to move the anchor of the info window to.
     *
     * @memberof BingInfoWindow
     * @method
     */
    public SetPosition(position: ILatLong): void {
        const l: Microsoft.Maps.Location = BingConversions.TranslateLocation(position);
        this._infoBox.setLocation(l);
    }
}
