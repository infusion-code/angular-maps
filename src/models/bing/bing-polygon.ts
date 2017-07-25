import { ILatLong } from '../../interfaces/ilatlong';
import { IPolygonOptions } from '../../interfaces/ipolygon-options';
import { BingConversions } from '../../services/bing/bing-conversions';
import { Polygon } from '../polygon';

/**
 * Concrete implementation for a polygon model for Bing Maps V8.
 *
 * @export
 * @implements Polygon
 * @class BingPolygon
 */
export class BingPolygon implements Polygon {

    ///
    /// Field declarations
    ///
    private _isEditable: boolean = true;

    ///
    /// Property declarations
    ///

    /**
     * Gets the native primitve implementing the marker, in this case {@link Microsoft.Maps.Polygon}
     *
     * @readonly
     * @type {*}
     * @memberof BingPolygon
     */
    public get NativePrimitve(): any { return this._polygon; }

    ///
    /// constructor
    ///

    /**
     * Creates an instance of BingPolygon.
     * @param {Microsoft.Maps.Polygon} _polygon - The {@link Microsoft.Maps.Polygon} underlying the model.
     *
     * @memberof BingPolygon
     */
    constructor(private _polygon: Microsoft.Maps.Polygon) { }

    /**
     * Adds a delegate for an event.
     *
     * @param {string} eventType - String containing the event name.
     * @param fn - Delegate function to execute when the event occurs.

     * @memberof BingPolygon
     */
    public AddListener(eventType: string, fn: Function): void {
        Microsoft.Maps.Events.addHandler(this._polygon, eventType, (e) => {
            fn(e);
        });
    }

    /**
     * Deleted the polygon.
     *
     * @memberof BingPolygon
     */
    public Delete(): void {
        const o: Microsoft.Maps.IPolygonOptions = {};
        o.visible = false;
        this._polygon.setOptions(o);
    }

    /**
     * Gets whether the polygon is draggable.
     *
     * @returns {boolean} - True if the polygon is dragable, false otherwise.
     *
     * @memberof BingPolygon
     */
    public GetDraggable(): boolean {
        ///
        /// Bing polygons are not draggable by default.
        /// See https://social.msdn.microsoft.com/Forums/en-US/
        ///     7aaae748-4d5f-4be5-a7bb-90498e08b41c/how-can-i-make-polygonpolyline-draggable-in-bing-maps-8?
        ///     forum=bingmaps
        /// for a possible approach to be implemented in the model.
        ///
        return false;
    }

    /**
     * Gets whether the polygon path can be edited.
     *
     * @returns {boolean} - True if the path can be edited, false otherwise.
     *
     * @memberof BingPolygon
     */
    public GetEditable(): boolean {
        return this._isEditable;
    }

    /**
     * Gets the polygon path.
     *
     * @returns {Array<ILatLong>} - Array of {@link ILatLong} objects describing the polygon path.
     *
     * @memberof BingPolygon
     */
    public GetPath(): Array<ILatLong> {
        const p: Array<Microsoft.Maps.Location> = this._polygon.getLocations();
        const path: Array<ILatLong> = new Array<ILatLong>();
        p.forEach(l => path.push({ latitude: l.latitude, longitude: l.longitude }));
        return path;
    }

    /**
     * Gets the polygon paths.
     *
     * @returns {Array<Array<ILatLong>>} - Array of Array of {@link ILatLong} objects describing multiple polygon paths.
     *
     * @memberof BingPolygon
     */
    public GetPaths(): Array<Array<ILatLong>> {
        const p: Array<Array<Microsoft.Maps.Location>> = this._polygon.getRings();
        const paths: Array<Array<ILatLong>> = new Array<Array<ILatLong>>();
        p.forEach(x => {
            const path: Array<ILatLong> = new Array<ILatLong>();
            x.forEach(y => path.push({ latitude: y.latitude, longitude: y.longitude }));
            paths.push(path);
        });
        return paths;
    }

    /**
     * Gets whether the polygon is visible.
     *
     * @returns {boolean} - True if the polygon is visible, false otherwise.
     *
     * @memberof BingPolygon
     */
    public GetVisible(): boolean {
        return this._polygon.getVisible();
    }

    /**
     * Sets whether the polygon is dragable.
     *
     * @param {boolean} draggable - True to make the polygon dragable, false otherwise.
     *
     * @memberof BingPolygon
     */
    public SetDraggable(draggable: boolean): void {
        ///
        /// Bing polygons are not draggable by default.
        /// See https://social.msdn.microsoft.com/Forums/en-US/
        ///     7aaae748-4d5f-4be5-a7bb-90498e08b41c/how-can-i-make-polygonpolyline-draggable-in-bing-maps-8
        //      ?forum=bingmaps
        /// for a possible approach to be implemented in the model.
        ///
        throw(new Error('The bing maps implementation currently does not support draggable polygons.'));
    }

    /**
     * Sets wether the polygon path is editable.
     *
     * @param {boolean} editable - True to make polygon path editable, false otherwise.
     *
     * @memberof BingPolygon
     */
    public SetEditable(editable: boolean): void {
        this._isEditable = editable;
    }

    /**
     * Sets the polygon options
     *
     * @param {IPolygonOptions} options - {@link ILatLong} object containing the options. The options are merged with hte ones
     * already on the underlying model.
     *
     * @memberof Polygon
     */
    public SetOptions(options: IPolygonOptions): void {
        const o: Microsoft.Maps.IPolygonOptions = BingConversions.TranslatePolygonOptions(options);
        this._polygon.setOptions(o);
    }

    /**
     * Sets the polygon path.
     *
     * @param {Array<ILatLong>} path - An Array of {@link ILatLong} (or array of arrays) describing the polygons path.
     *
     * @memberof BingPolygon
     */
    public SetPath(path: Array<ILatLong>): void {
        if (!this._isEditable) {
            throw(new Error('Polygon is not editable. Use Polygon.SetEditable() to make the polygon editable.'));
        }
        const p: Array<Microsoft.Maps.Location> = new Array<Microsoft.Maps.Location>();
        path.forEach(x => p.push(new Microsoft.Maps.Location(x.latitude, x.longitude)));
        this._polygon.setLocations(p);
    }

    /**
     * Set the polygon path or paths.
     *
     * @param {(Array<Array<ILatLong>> | Array<ILatLong>)} paths
     * An Array of {@link ILatLong} (or array of arrays) describing the polygons path(s).
     *
     * @memberof BingPolygon
     */
    public SetPaths(paths: Array<Array<ILatLong>> | Array<ILatLong>): void {
        if (!this._isEditable) {
            throw(new Error('Polygon is not editable. Use Polygon.SetEditable() to make the polygon editable.'));
        }
        if (paths == null) { return; }
        if (!Array.isArray(paths)) { return; }
        if (paths.length === 0) {
            this._polygon.setRings(new Array<Microsoft.Maps.Location>());
            return;
        }
        if (Array.isArray(paths[0])) {
            // parameter is an array or arrays
            const p: Array<Array<Microsoft.Maps.Location>> = new Array<Array<Microsoft.Maps.Location>>();
            (<Array<Array<ILatLong>>>paths).forEach(path => {
                const _p: Array<Microsoft.Maps.Location> = new Array<Microsoft.Maps.Location>();
                path.forEach(x => _p.push(new Microsoft.Maps.Location(x.latitude, x.longitude)));
                p.push(_p);
            });
            this._polygon.setRings(p);
        } else {
            // parameter is a simple array....
            this.SetPath(<Array<ILatLong>>paths);
        }
    }

    /**
     * Sets whether the polygon is visible.
     *
     * @param {boolean} visible - True to set the polygon visible, false otherwise.
     *
     * @memberof BingPolygon
     */
    public SetVisible(visible: boolean): void {
        this._polygon.setOptions(<Microsoft.Maps.IPolygonOptions>{ visible: visible });
    }

}
