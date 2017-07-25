import { ILatLong } from '../../interfaces/ilatlong';
import { IPolylineOptions } from '../../interfaces/ipolyline-options';
import { BingConversions } from '../../services/bing/bing-conversions';
import { Polyline } from '../polyline';

/**
 * Concrete implementation for a polyline model for Bing Maps V8.
 *
 * @export
 * @implements Polyline
 * @class BingPolyline
 */
export class BingPolyline implements Polyline {

    ///
    /// Field declarations
    ///
    private _isEditable: boolean = true;

    ///
    /// Property declarations
    ///

    /**
     * Gets the Navitve Polyline underlying the model
     *
     * @readonly
     * @type {Microsoft.MapConstructor.Polyline}
     * @memberof BingPolyline
     */
    public get NativePrimitve(): Microsoft.Maps.Polyline { return this._polyline; }

    ///
    /// constructor
    ///

    /**
     * Creates an instance of BingPolygon.
     * @param {Microsoft.Maps.Polyline} _polyline - The {@link Microsoft.Maps.Polyline} underlying the model.
     *
     * @memberof BingPolyline
     */
    constructor(private _polyline: Microsoft.Maps.Polyline) { }

    /**
     * Adds a delegate for an event.
     *
     * @param {string} eventType - String containing the event name.
     * @param fn - Delegate function to execute when the event occurs.
     * @memberof BingPolyline
     */
    public AddListener(eventType: string, fn: Function): void {
        Microsoft.Maps.Events.addHandler(this._polyline, eventType, (e) => {
            fn(e);
        });
    }

    /**
     * Deleted the polyline.
     *
     * @memberof BingPolyline
     */
    public Delete(): void {
        const o: Microsoft.Maps.IPolygonOptions = {};
        o.visible = false;
        this._polyline.setOptions(o);
    }

    /**
     * Gets whether the polyline is draggable.
     *
     * @returns {boolean} - True if the polyline is dragable, false otherwise.
     *
     * @memberof BingPolyline
     */
    public GetDraggable(): boolean {
        ///
        /// Bing polygons are not draggable by default.
        /// See https://social.msdn.microsoft.com/Forums/en-US/
        ///     7aaae748-4d5f-4be5-a7bb-90498e08b41c/how-can-i-make-polygonpolyline-draggable-in-bing-maps-8
        ///     ?forum=bingmaps
        /// for a possible approach to be implemented in the model.
        ///
        return false;
    }

    /**
     * Gets whether the polyline path can be edited.
     *
     * @returns {boolean} - True if the path can be edited, false otherwise.
     *
     * @memberof BingPolyline
     */
    public GetEditable(): boolean {
        return this._isEditable;
    }

    /**
     * Gets the polyline path.
     *
     * @returns {Array<ILatLong>} - Array of {@link ILatLong} objects describing the polyline path.
     *
     * @memberof BingPolyline
     */
    public GetPath(): Array<ILatLong> {
        const p: Array<Microsoft.Maps.Location> = this._polyline.getLocations();
        const path: Array<ILatLong> = new Array<ILatLong>();
        p.forEach(l => path.push({ latitude: l.latitude, longitude: l.longitude }));
        return path;
    }

    /**
     * Gets whether the polyline is visible.
     *
     * @returns {boolean} - True if the polyline is visible, false otherwise.
     *
     * @memberof BingPolyline
     */
    public GetVisible(): boolean {
        return this._polyline.getVisible();
    }

    /**
     * Sets whether the polyline is dragable.
     *
     * @param {boolean} draggable - True to make the polyline dragable, false otherwise.
     *
     * @memberof BingPolyline
     */
    public SetDraggable(draggable: boolean): void {
        ///
        /// Bing polygons are not draggable by default.
        /// See https://social.msdn.microsoft.com/Forums/en-US/
        ///     7aaae748-4d5f-4be5-a7bb-90498e08b41c/how-can-i-make-polygonpolyline-draggable-in-bing-maps-8
        ///     ?forum=bingmaps
        /// for a possible approach to be implemented in the model.
        ///
        throw(new Error('The bing maps implementation currently does not support draggable polylines.'));
    }

    /**
     * Sets wether the polyline path is editable.
     *
     * @param {boolean} editable - True to make polyline path editable, false otherwise.
     *
     * @memberof BingPolyline
     */
    public SetEditable(editable: boolean): void {
        this._isEditable = editable;
    }

    /**
     * Sets the polyline options
     *
     * @param {IPolylineOptions} options - {@link ILatLong} object containing the options. The options are merged with hte ones
     * already on the underlying model.
     *
     * @memberof BingPolyline
     */
    public SetOptions(options: IPolylineOptions): void {
        const o: Microsoft.Maps.IPolylineOptions = BingConversions.TranslatePolylineOptions(options);
        this._polyline.setOptions(o);
    }

    /**
     * Sets the polyline path.
     *
     * @param {Array<ILatLong>} path - An Array of {@link ILatLong} (or array of arrays) describing the polylines path.
     *
     * @memberof BingPolyline
     */
    public SetPath(path: Array<ILatLong>): void {
        if (!this._isEditable) {
            throw(new Error('Polyline is not editable. Use Polyline.SetEditable() to make the polygon editable.'));
        }
        const p: Array<Microsoft.Maps.Location> = new Array<Microsoft.Maps.Location>();
        path.forEach(x => p.push(new Microsoft.Maps.Location(x.latitude, x.longitude)));
        this._polyline.setLocations(p);
    }

    /**
     * Sets whether the polyline is visible.
     *
     * @param {boolean} visible - True to set the polyline visible, false otherwise.
     *
     * @memberof BingPolyline
     */
    public SetVisible(visible: boolean): void {
        this._polyline.setOptions(<Microsoft.Maps.IPolylineOptions>{ visible: visible });
    }

}
