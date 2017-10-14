import { ILatLong } from '../../interfaces/ilatlong';
import { IPolylineOptions } from '../../interfaces/ipolyline-options';
import { GoogleConversions } from '../../services/google/google-conversions';
import * as GoogleMapTypes from '../../services/google/google-map-types';
import { GoogleMapLabel } from './google-label';
import { Polyline } from '../polyline';

declare var google: any;

/**
 * Concrete implementation for a polyline model for Google Maps.
 *
 * @export
 * @implements Polyline
 * @class Polyline
 */
export class GooglePolyline extends Polyline implements Polyline {

    ///
    /// Field declarations
    ///
    private _title: string = '';
    private _showTooltip: boolean = false;
    private _tooltip: GoogleMapLabel = null;
    private _tooltipVisible: boolean = false;
    private _hasToolTipReceiver: boolean = false;
    private _mouseOverListener: GoogleMapTypes.MapsEventListener = null;
    private _mouseOutListener: GoogleMapTypes.MapsEventListener = null;
    private _mouseMoveListener: GoogleMapTypes.MapsEventListener = null;
    private _metadata: Map<string, any> = new Map<string, any>();

    ///
    /// Property declarations
    ///

    /**
     * Gets the polyline metadata.
     *
     * @readonly
     * @type {Map<string, any>}
     * @memberof GooglePolyline
     */
    public get Metadata(): Map<string, any> { return this._metadata; }

    /**
     * Gets the native primitve implementing the marker, in this case {@link GoogleMApTypes.Polyline}
     *
     * @readonly
     * @type {GoogleMApTypes.Polyline}
     * @memberof GooglePolygon
     */
    public get NativePrimitve(): GoogleMapTypes.Polyline { return this._polyline; }

    /**
     * Gets or sets whether to show the tooltip
     *
     * @abstract
     * @type {boolean}
     * @memberof GooglePolygon
     * @property
     * @public
     */
    public get ShowTooltip(): boolean { return this._showTooltip; }
    public set ShowTooltip(val: boolean) {
        this._showTooltip = val;
        this.ManageTooltip();
    }

    /**
     * Gets or sets the title off the polygon
     *
     * @abstract
     * @type {string}
     * @memberof GooglePolygon
     * @property
     * @public
     */
    public get Title(): string { return this._title; }
    public set Title(val: string) {
        this._title = val;
        this.ManageTooltip();
    }

    ///
    /// constructor
    ///

     /**
     * Creates an instance of GooglePolygon.
     * @param {GoogleMapTypes.Polyline} _polyline - The {@link GoogleMApTypes.Polyline} underlying the model.
     *
     * @memberof GooglePolyline
     */
    constructor(private _polyline: GoogleMapTypes.Polyline) {
        super();
    }

    /**
     * Adds a delegate for an event.
     *
     * @param {string} eventType - String containing the event name.
     * @param fn - Delegate function to execute when the event occurs.
     * @memberof Polyline
     */
    public AddListener(eventType: string, fn: Function): void {
        const supportedEvents = [
            'click',
            'dblclick',
            'drag', 'dragend',
            'dragstart',
            'mousedown',
            'mousemove',
            'mouseout',
            'mouseover',
            'mouseup',
            'rightclick'
        ];
        if (supportedEvents.indexOf(eventType) !== -1) {
            this._polyline.addListener(eventType, fn);
        }
    }

    /**
     * Deleted the polyline.
     *
     *
     * @memberof Polyline
     */
    public Delete(): void {
        this._polyline.setMap(null);
        if (this._tooltip) { this._tooltip.Delete(); }
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
        if (options.path) {
            this.SetPath(<Array<ILatLong>>options.path);
        }
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

    ///
    /// Private methods
    ///
    /**
     * Configures the tooltip for the polyline
     * @memberof GooglePolyline
     * @private
     */
    private ManageTooltip(): void {
        if (this._showTooltip && this._title != null && this._title !== '') {
            const o: { [key: string]: any } = {
                text: this._title,
                align: 'left',
                offset: new google.maps.Point(0, 25),
                backgroundColor: 'bisque',
                hidden: true,
                fontSize: 12,
                fontColor: '#000000',
                strokeWeight: 0
            };
            if (this._tooltip == null) {
                o.map = this.NativePrimitve.getMap();
                o.zIndex = 100000;
                this._tooltip = new GoogleMapLabel(o);
            }
            else {
                this._tooltip.SetValues(o);
            }
            if (!this._hasToolTipReceiver) {
                this._mouseOverListener = this.NativePrimitve.addListener('mouseover', (e: GoogleMapTypes.MouseEvent) => {
                    this._tooltip.Set('position', e.latLng);
                    if (!this._tooltipVisible) {
                        this._tooltip.Set('hidden', false);
                        this._tooltipVisible = true;
                    }
                });
                this._mouseMoveListener = this.NativePrimitve.addListener('mousemove', (e: GoogleMapTypes.MouseEvent) => {
                    if (this._tooltipVisible) { this._tooltip.Set('position', e.latLng); }
                });
                this._mouseOutListener = this.NativePrimitve.addListener('mouseout', (e: GoogleMapTypes.MouseEvent) => {
                    if (this._tooltipVisible) {
                        this._tooltip.Set('hidden', true);
                        this._tooltipVisible = false;
                    }
                });
                this._hasToolTipReceiver = true;
            }
        }
        if ((!this._showTooltip || this._title === '' || this._title == null)) {
            if (this._hasToolTipReceiver) {
                if (this._mouseOutListener) { google.maps.event.removeListener(this._mouseOutListener); }
                if (this._mouseOverListener) { google.maps.event.removeListener(this._mouseOverListener); }
                if (this._mouseMoveListener) { google.maps.event.removeListener(this._mouseMoveListener); }
                this._hasToolTipReceiver = false;
            }
            if (this._tooltip) {
                this._tooltip.SetMap(null);
                this._tooltip = null;
            }
        }
    }

}
