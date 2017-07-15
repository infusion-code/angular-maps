import { ILatLong } from './../../interfaces/ilatlong';
import { IPoint } from './../../interfaces/ipoint';
import { IMarkerOptions } from './../../interfaces/imarker-options';
import { Marker } from './../marker';
import { BingMapService } from './../../services/bing/bing-map.service';
import { BingConversions } from './../../services/bing/bing-conversions';

/**
 * Concrete implementation of the {@link Marker} contract for the Bing Maps V8 map architecture.
 *
 * @export
 * @class BingMarker
 * @implements {Marker}
 */
export class BingMarker implements Marker {

    ///
    /// Field definitions
    ///
    private _metadata: Map<string, any> = new Map<string, any>();
    private _isFirst = false;
    private _isLast = true;

    ///
    /// Property definitions
    ///

    /**
     * Indicates that the marker is the first marker in a set.
     *
     * @type {boolean}
     * @memberof Marker
     */
    public get IsFirst(): boolean { return this._isFirst; }
    public set IsFirst(val: boolean) { this._isFirst = val; }

    /**
     * Indicates that the marker is the last marker in the set.
     *
     * @type {boolean}
     * @memberof Marker
     */
    public get IsLast(): boolean { return this._isLast; }
    public set IsLast(val: boolean) { this._isLast = val; }

    /**
     * Gets the Location of the marker
     *
     * @readonly
     * @type {ILatLong}
     * @memberof BingMarker
     */
    public get Location(): ILatLong {
        const l: Microsoft.Maps.Location = this._pushpin.getLocation();
        return {
            latitude: l.latitude,
            longitude: l.longitude
        }
    }

    /**
     * Gets the marker metadata.
     *
     * @readonly
     * @type {Map<string, any>}
     * @memberof BingMarker
     */
    public get Metadata(): Map<string, any> { return this._metadata; }

    /**
     * Gets the native primitve implementing the marker, in this case {@link Microsoft.Maps.Pushpin}
     *
     * @readonly
     * @type {*}
     * @memberof BingMarker
     */
    public get NativePrimitve(): any { return this._pushpin; }

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of BingMarker.
     * @param {Microsoft.Maps.Pushpin} _pushpin - The {@link Microsoft.Maps.Pushpin} underlying the model.
     *
     * @memberof BingMarker
     */
    constructor(private _pushpin: Microsoft.Maps.Pushpin) { }

    ///
    /// Public methods
    ///

    /**
     * Adds an event listener to the marker.
     *
     * @abstract
     * @param {string} eventType - String containing the event for which to register the listener (e.g. "click")
     * @param {Function} fn - Delegate invoked when the event occurs.
     *
     * @memberof BingMarker
     */
    public AddListener(eventType: string, fn: Function): void {
        Microsoft.Maps.Events.addHandler(this._pushpin, eventType, (e) => {
            fn(e);
        });
    }

    /**
     * Deletes the marker.
     *
     * @abstract
     *
     * @memberof BingMarker
     */
    public DeleteMarker(): void {
        const o: Microsoft.Maps.IPushpinOptions = {};
        o.visible = false;
        this._pushpin.setOptions(o);
    }

    /**
     * Gets the marker label
     *
     * @abstract
     * @returns {string}
     *
     * @memberof BingMarker
     */
    public GetLabel(): string {
        return this._pushpin.getText();
    }

    /**
     * Gets whether the marker is visible.
     *
     * @returns {boolean} - True if the marker is visible, false otherwise.
     *
     * @memberof BingMarker
     */
    public GetVisible(): boolean {
        return this._pushpin.getVisible();
    }

    /**
     * Sets the anchor for the marker. Use this to adjust the root location for the marker to accomodate various marker image sizes.
     *
     * @abstract
     * @param {IPoint} anchor - Point coordinates for the marker anchor.
     *
     * @memberof BingMarker
     */
    public SetAnchor(anchor: IPoint): void {
        const o: Microsoft.Maps.IPushpinOptions = {};
        o.anchor = new Microsoft.Maps.Point(anchor.x, anchor.y);
        this._pushpin.setOptions(o);
    }

    /**
     * Sets the draggability of a marker.
     *
     * @abstract
     * @param {boolean} draggable - True to mark the marker as draggable, false otherwise.
     *
     * @memberof BingMarker
     */
    public SetDraggable(draggable: boolean): void {
        const o: Microsoft.Maps.IPushpinOptions = {};
        o.draggable = draggable;
        this._pushpin.setOptions(o);
    }

    /**
     * Sets the icon for the marker.
     *
     * @abstract
     * @param {string} icon - String containing the icon in various forms (url, data url, etc.)
     *
     * @memberof BingMarker
     */
    public SetIcon(icon: string): void {
        const o: Microsoft.Maps.IPushpinOptions = {};
        o.icon = icon;
        this._pushpin.setOptions(o);
    }

    /**
     * Sets the marker label.
     *
     * @abstract
     * @param {string} label - String containing the label to set.
     *
     * @memberof BingMarker
     */
    public SetLabel(label: string): void {
        const o: Microsoft.Maps.IPushpinOptions = {};
        o.text = label;
        this._pushpin.setOptions(o);
    }

    /**
     * Sets the marker position.
     *
     * @abstract
     * @param {ILatLong} latLng - Geo coordinates to set the marker position to.
     *
     * @memberof BingMarker
     */
    public SetPosition(latLng: ILatLong): void {
        const p: Microsoft.Maps.Location = BingConversions.TranslateLocation(latLng);
        this._pushpin.setLocation(p);
    }

    /**
     * Sets the marker title.
     *
     * @abstract
     * @param {string} title - String containing the title to set.
     *
     * @memberof BingMarker
     */
    public SetTitle(title: string): void {
        const o: Microsoft.Maps.IPushpinOptions | any = {};
        o.title = title;
        this._pushpin.setOptions(o);
    }

    /**
     * Sets the marker options.
     *
     * @abstract
     * @param {IMarkerOptions} options - {@link IMarkerOptions} object containing the marker options to set. The supplied options are
     * merged with the underlying marker options.
     * @memberof Marker
     */
    public SetOptions(options: IMarkerOptions): void {
        const o: Microsoft.Maps.IPushpinOptions = BingConversions.TranslateOptions(options);
        this._pushpin.setOptions(o);
    }

    /**
     * Sets whether the marker is visible.
     *
     * @param {boolean} visible - True to set the marker visible, false otherwise.
     *
     * @memberof Marker
     */
    public SetVisible(visible: boolean): void {
        const o: Microsoft.Maps.IPushpinOptions | any = {};
        o.visible = visible;
        this._pushpin.setOptions(o);
    }

}
