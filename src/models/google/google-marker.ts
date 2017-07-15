import { GoogleConversions } from './../../services/google/google-conversions';
import { IMarkerOptions } from './../../interfaces/imarker-options';
import { ILatLong } from './../../interfaces/ilatlong';
import { Marker } from './../marker';
import * as GoogleMapTypes from '../../services/google/google-map-types';

/**
 * Concrete implementation of the {@link Marker} contract for the Google Maps map architecture.
 *
 * @export
 * @class GoogleMarker
 * @implements {Marker}
 */
export class GoogleMarker implements Marker {

    ///
    /// Field declarations
    ///
    private _metadata: Map<string, any> = new Map<string, any>();
    private _isFirst = false;
    private _isLast = true;

    ///
    /// Public properties
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
     * @abstract
     * @type {*}
     * @memberof BingMarker
     */
    public get NativePrimitve(): any { return this._marker; }

    /**
     * Gets the Location of the marker
     *
     * @readonly
     * @abstract
     * @type {ILatLong}
     * @memberof BingMarker
     */
    public get Location(): ILatLong {
        const l: GoogleMapTypes.LatLng = this._marker.getPosition();
        return {
            latitude: l.lat(),
            longitude: l.lng()
        }
    }

    ///
    /// Constructors
    ///

    /**
     * Creates an instance of GoogleMarker.
     * @param {GoogleMapTypes.Marker} _marker
     *
     * @memberof GoogleMarker
     */
    constructor(private _marker: GoogleMapTypes.Marker) { }

    ///
    /// Public methods
    ///

    /**
     * Adds an event listener to the marker.
     *
     * @param {string} eventType - String containing the event for which to register the listener (e.g. "click")
     * @param {Function} fn - Delegate invoked when the event occurs.
     *
     * @memberof GoogleMarker
     */
    public AddListener(eventType: string, fn: Function): void {
        this._marker.addListener(eventType, fn);
    }

    /**
     * Deletes the marker.
     *
     *
     * @memberof GoogleMarker
     */
    public DeleteMarker(): void {
        this._marker.setVisible(false);
    }

    /**
     * Gets the marker label
     *
     * @returns {string}
     *
     * @memberof GoogleMarker
     */
    public GetLabel(): string {
        return this._marker.getLabel().text;
    }

    /**
     * Gets whether the marker is visible.
     *
     * @returns {boolean} - True if the marker is visible, false otherwise.
     *
     * @memberof GoogleMarker
     */
    public GetVisible(): boolean {
        return this._marker.getVisible();
    }

    /**
     * Sets the anchor for the marker. Use this to adjust the root location for the marker to accomodate various marker image sizes.
     *
     * @param {IPoint} anchor - Point coordinates for the marker anchor.
     *
     * @memberof GoogleMarker
     */
    public SetAnchor(anchor: any): void {
        // not implemented
    }

    /**
     * Sets the draggability of a marker.
     *
     * @param {boolean} draggable - True to mark the marker as draggable, false otherwise.
     *
     * @memberof GoogleMarker
     */
    public SetDraggable(draggable: boolean): void {
        this._marker.setDraggable(draggable);
    }

    /**
     * Sets the icon for the marker.
     *
     * @param {string} icon - String containing the icon in various forms (url, data url, etc.)
     *
     * @memberof GoogleMarker
     */
    public SetIcon(icon: string): void {
        this._marker.setIcon(icon);
    }

    /**
     * Sets the marker label.
     *
     * @param {string} label - String containing the label to set.
     *
     * @memberof GoogleMarker
     */
    public SetLabel(label: string): void {
        this._marker.setLabel(label);
    }

    /**
     * Sets the marker position.
     *
     * @param {ILatLong} latLng - Geo coordinates to set the marker position to.
     *
     * @memberof GoogleMarker
     */
    public SetPosition(latLng: ILatLong): void {
        const p: GoogleMapTypes.LatLng = GoogleConversions.TranslateLocationObject(latLng);
        this._marker.setPosition(p);
    }

    /**
     * Sets the marker title.
     *
     * @param {string} title - String containing the title to set.
     *
     * @memberof GoogleMarker
     */
    public SetTitle(title: string): void {
        this._marker.setTitle(title);
    }

    /**
     * Sets the marker options.
     *
     * @param {IMarkerOptions} options - {@link IMarkerOptions} object containing the marker options to set. The supplied options are
     * merged with the underlying marker options.
     *
     * @memberof GoogleMarker
     */
    public SetOptions(options: IMarkerOptions): void {
        const o: GoogleMapTypes.MarkerOptions = GoogleConversions.TranslateMarkerOptions(options);
        this._marker.setOptions(o);
    }

    /**
     * Sets whether the marker is visible.
     *
     * @param {boolean} visible - True to set the marker visible, false otherwise.
     *
     * @memberof GoogleMarker
     */
    public SetVisible(visible: boolean): void {
        this._marker.setVisible(visible);
    }

}
