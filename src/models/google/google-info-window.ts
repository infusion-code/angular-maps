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
 * @export
 */
export class GoogleInfoWindow implements InfoWindow {

    private _isOpen: boolean;

    /**
     * Gets whether the info box is currently open.
     *
     * @readonly
     * @memberof InfoWGoogleInfoWindowindow
     */
    public get IsOpen(): boolean {
        if (this._isOpen === true) { return true; }
        return false;
    }

    /**
     * Gets the underlying native object.
     *
     * @property
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
     * @param _infoWindow - A {@link GoogleMapTypes.InfoWindow} instance underlying the model.
     * @param _mapService - An instance of the {@link GoogleMapService}.
     * @memberof GoogleInfoWindow
     */
    constructor(private _infoWindow: GoogleMapTypes.InfoWindow, private _mapService: GoogleMapService) { }

    ///
    /// Public methods
    ///

   /**
     * Adds an event listener to the InfoWindow.
     *
     * @param eventType - String containing the event for which to register the listener (e.g. "click")
     * @param fn - Delegate invoked when the event occurs.
     *
     * @memberof GoogleInfoWindow
     * @method
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
     */
    public Close() {
        this._isOpen = false;
        this._infoWindow.close();
    }

    /**
     * Gets the position of the info window
     *
     * @returns - The geo coordinates of the info window.
     *
     * @memberof GoogleInfoWindow
     * @method
     */
    public GetPosition(): ILatLong {
        return GoogleConversions.TranslateLatLngObject(this._infoWindow.getPosition());
    }

    /**
     * Opens the info window
     *
     * @param [anchor] - Optional Anchor.
     *
     * @memberof GoogleInfoWindow
     * @method
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
     * @param options - The options to set. This object will be merged with the existing options.
     *
     * @memberof GoogleInfoWindow
     * @method
     */
    public SetOptions(options: IInfoWindowOptions): void {
        const o: GoogleMapTypes.InfoWindowOptions = GoogleConversions.TranslateInfoWindowOptions(options);
        this._infoWindow.setOptions(o);
    }

    /**
     * Sets the info window position
     *
     * @param position - Geo coordinates at which to anchor the info window.
     *
     * @memberof GoogleInfoWindow
     * @method
     */
    public SetPosition(position: ILatLong): void {
        const l: GoogleMapTypes.LatLngLiteral = GoogleConversions.TranslateLocation(position);
        this._infoWindow.setPosition(l);
    }
}
