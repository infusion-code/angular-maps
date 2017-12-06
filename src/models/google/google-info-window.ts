import { IInfoWindowOptions } from '../../interfaces/iinfo-window-options';
import { ILatLong } from '../../interfaces/ilatlong';
import { GoogleConversions } from '../../services/google/google-conversions';
import { GoogleMapService} from '../../services/google/google-map.service';
import { InfoWindow } from '../info-window';
import * as GoogleMapTypes from '../../services/google/google-map-types';

declare var google: any;

/**
 * Concrete implementation for a {@link InfoWindow}} model for Google Maps.
 *
 * @implements InfoWindow
 * @class GoogleInfoWindow
 * @export
 */
export class GoogleInfoWindow implements InfoWindow {

    private _isOpen: boolean;

    /**
     * Gets whether the info box is currently open.
     *
     * @readonly
     * @type {boolean}
     * @memberof InfoWGoogleInfoWindowindow
     */
    public get IsOpen(): boolean {
        if (this._isOpen === true) { return true; }
        return false;
    }

    /**
     * Gets the underlying native object.
     *
     * @type {GoogleMapTypes.InfoWindow}
     * @property
     * @public
     * @readonly
     */
    public get NativePrimitve(): GoogleMapTypes.InfoWindow {
        return this._infoWindow;
    }

    ///
    /// constructor
    ///

    /**
     * Creates an instance of GoogleInfoWindow.
     * @param {GoogleMapTypes.InfoWindow} _infoWindow - A {@link GoogleMapTypes.InfoWindow} instance underlying the model.
     * @param {GoogleMapService} _mapService - An instance of the {@link GoogleMapService}.
     * @memberof GoogleInfoWindow
     * @public
     * @constructor
     */
    constructor(private _infoWindow: GoogleMapTypes.InfoWindow, private _mapService: GoogleMapService) { }

    ///
    /// Public methods
    ///

   /**
     * Adds an event listener to the InfoWindow.
     *
     * @param {string} eventType - String containing the event for which to register the listener (e.g. "click")
     * @param {Function} fn - Delegate invoked when the event occurs.
     *
     * @memberof GoogleInfoWindow
     * @method
     * @public
     */
    public AddListener(eventType: string, fn: Function): void {
        this._infoWindow.addListener(eventType, (e: any) => {
            if (eventType === 'closeclick') { this._isOpen = false; }
            fn(e);
        });
    }

    /**
     *
     * Closes the info window.
     *
     * @memberof GoogleInfoWindow
     * @method
     * @public
     */
    public Close() {
        this._isOpen = false;
        this._infoWindow.close();
    }

    /**
     * Gets the position of the info window
     *
     * @returns {ILatLong} - The geo coordinates of the info window.
     *
     * @memberof GoogleInfoWindow
     * @method
     * @public
     */
    public GetPosition(): ILatLong {
        return GoogleConversions.TranslateLatLngObject(this._infoWindow.getPosition());
    }

    /**
     * Opens the info window
     *
     * @param {*} [anchor] - Optional Anchor.
     *
     * @memberof GoogleInfoWindow
     * @method
     * @public
     */
    public Open(anchor?: any) {
        this._mapService.MapPromise.then(m => {
            this._isOpen = true;
            this._infoWindow.open(m, anchor);
        });
    }

    /**
     * Sets the info window options
     *
     * @param {IInfoWindowOptions} options - The options to set. This object will be merged with the existing options.
     *
     * @memberof GoogleInfoWindow
     * @method
     * @public
     */
    public SetOptions(options: IInfoWindowOptions): void {
        const o: GoogleMapTypes.InfoWindowOptions = GoogleConversions.TranslateInfoWindowOptions(options);
        this._infoWindow.setOptions(o);
    }

    /**
     * Sets the info window position
     *
     * @param {ILatLong} position - Geo coordinates at which to anchor the info window.
     *
     * @memberof GoogleInfoWindow
     * @method
     * @public
     */
    public SetPosition(position: ILatLong): void {
        const l: GoogleMapTypes.LatLngLiteral = GoogleConversions.TranslateLocation(position);
        this._infoWindow.setPosition(l);
    }
}
