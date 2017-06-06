import { MVCObject } from './../../services/google/google-map-types';
import { IInfoWindowOptions } from './../../interfaces/Iinfowindowoptions';
import { ILatLong } from '../../interfaces/ilatlong';
import { GoogleConversions } from '../../services/google/google-conversions';
import * as GoogleMapTypes from '../../services/google/google-map-types';
import { InfoWindow } from '../infoWindow';

declare var google: any;

/**
 * Concrete implementation for a polygon model for Google Maps.
 *
 * @export
 * @implements Polygon
 * @class Polygon
 */
export class GoogleInfoWindow implements InfoWindow {

    public get NativePrimitve(): any {
        return this._infoWindow;
    }

    ///
    /// constructor
    ///
    constructor(private _infoWindow: GoogleMapTypes.InfoWindow) { }

    ///
    /// Public methods
    ///

    /**
     *
     * Implements the close handler
     *
     * @memberof GoogleInfoWindow
     */
    public Close() {
        this._infoWindow.close();
    }

    /**
     * Gets the position of the current info window
     *
     * @returns
     *
     * @memberof GoogleInfoWindow
     */
    public GetPosition() {
        return GoogleConversions.TranslateLatLngObject(this._infoWindow.getPosition());
    }

    /**
     * Opens the info window
     *
     * @param {GoogleMapTypes.GoogleMap} [map]
     * @param {*} [anchor]
     *
     * @memberof GoogleInfoWindow
     */
    public Open(map?: GoogleMapTypes.GoogleMap, anchor?: any) {
        this._infoWindow.open(map, anchor);
    }

    /**
     * Sets the info window options
     *
     * @param {IInfoWindowOptions} options
     *
     * @memberof GoogleInfoWindow
     */
    public SetOptions(options: IInfoWindowOptions): void {
        const o: GoogleMapTypes.InfoWindowOptions = GoogleConversions.TranslateInfoWindowOptions(options);
        this._infoWindow.setOptions(o);
    };

    /**
     * Sets the info window position
     *
     * @param {ILatLong} position
     *
     * @memberof GoogleInfoWindow
     */
    public SetPosition(position: ILatLong): void {
        const l: GoogleMapTypes.LatLngLiteral = GoogleConversions.TranslateLocation(position)
        this._infoWindow.setPosition(l);
    };
}
