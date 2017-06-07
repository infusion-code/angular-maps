import { ILatLong } from '../../interfaces/ilatlong';
import { IPolylineOptions } from '../../interfaces/ipolylineoptions';
import { GoogleConversions } from '../../services/google/google-conversions';
import * as GoogleMapTypes from '../../services/google/google-map-types';
import { Polyline } from '../polyline';

declare var google: any;

/**
 * Concrete implementation for a polyline model for Google Maps.
 *
 * @export
 * @implements Polyline
 * @class Polyline
 */
export class GooglePolyline implements Polyline {

    ///
    /// Property declarations
    ///
    public get NativePrimitve(): any { return this._polyline; }

    ///
    /// constructor
    ///
    constructor(private _polyline: GoogleMapTypes.Polyline) { }

    /**
     * Adds a delegate for an event.
     *
     * @param {string} eventType - String containing the event name.
     * @param fn - Delegate function to execute when the event occurs.
     * @memberof Polyline
     */
    public AddListener(eventType: string, fn: Function): void {
        this._polyline.addListener(eventType, fn);
    }

    /**
     * Deleted the polyline.
     *
     *
     * @memberof Polyline
     */
    public Delete(): void {
        this._polyline.setMap(null);
    }

    /**
     * Gets whether the polyline is draggable.
     *
     * @returns {boolean} - True if the polyline is dragable, false otherwise.
     *
     * @memberof Polyline
     */
    public GetDraggable(): boolean {
        return this._polyline.getDraggable();
    }

    /**
     * Gets whether the polyline path can be edited.
     *
     * @returns {boolean} - True if the path can be edited, false otherwise.
     *
     * @memberof Polyline
     */
    public GetEditable(): boolean {
        return this._polyline.getEditable();
    }

    /**
     * Gets the polyline path.
     *
     * @returns {Array<ILatLong>} - Array of {@link ILatLong} objects describing the polyline path.
     *
     * @memberof Polyline
     */
    public GetPath(): Array<ILatLong> {
        const p: Array<GoogleMapTypes.LatLng> = this._polyline.getPath();
        const path: Array<ILatLong> = new Array<ILatLong>();
        p.forEach(x => path.push({ latitude: x.lat(), longitude: x.lng() }));
        return path;
    }

    /**
     * Gets whether the polyline is visible.
     *
     * @returns {boolean} - True if the polyline is visible, false otherwise.
     *
     * @memberof Polyline
     */
    public GetVisible(): boolean {
        return this._polyline.getVisible();
    }

    /**
     * Sets whether the polyline is dragable.
     *
     * @param {boolean} draggable - True to make the polyline dragable, false otherwise.
     *
     * @memberof Polyline
     */
    public SetDraggable(draggable: boolean): void {
        this._polyline.setDraggable(draggable);
    }

    /**
     * Sets wether the polyline path is editable.
     *
     * @param {boolean} editable - True to make polyline path editable, false otherwise.
     *
     * @memberof Polyline
     */
    public SetEditable(editable: boolean): void {
        this._polyline.setEditable(editable);
    }

    /**
     * Sets the polyline options
     *
     * @param {IPolylineOptions} options - {@link ILatLong} object containing the options. The options are merged with hte ones
     * already on the underlying model.
     *
     * @memberof Polyline
     */
    public SetOptions(options: IPolylineOptions): void {
        const o: GoogleMapTypes.PolylineOptions = GoogleConversions.TranslatePolylineOptions(options);
        this._polyline.setOptions(o);
    }

    /**
     * Sets the polyline path.
     *
     * @param {Array<ILatLong>} path - An Array of {@link ILatLong} (or array of arrays) describing the polylines path.
     *
     * @memberof Polyline
     */
    public SetPath(path: Array<ILatLong>): void {
        const p: Array<GoogleMapTypes.LatLng> = new Array<GoogleMapTypes.LatLng>();
        path.forEach(x => p.push(new google.maps.LatLng(x.latitude, x.longitude)));
        this._polyline.setPath(p);
    }

    /**
     * Sets whether the polyline is visible.
     *
     * @param {boolean} visible - True to set the polyline visible, false otherwise.
     *
     * @memberof Polyline
     */
    public SetVisible(visible: boolean): void {
        this._polyline.setVisible(visible);
    }

}
