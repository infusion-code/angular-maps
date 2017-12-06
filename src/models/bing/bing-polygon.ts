import { ILatLong } from '../../interfaces/ilatlong';
import { IPolygonOptions } from '../../interfaces/ipolygon-options';
import { IPolygonEvent } from '../../interfaces/ipolygon-event';
import { BingConversions } from '../../services/bing/bing-conversions';
import { BingMapService } from '../../services/bing/bing-map.service';
import { Polygon } from '../polygon';
import { BingMapLabel } from './bing-label';

/**
 * Concrete implementation for a polygon model for Bing Maps V8.
 *
 * @export
 * @extends Polygon
 * @implements Polygon
 * @class BingPolygon
 */
export class BingPolygon extends Polygon implements Polygon {

    ///
    /// Field declarations
    ///
    private _map: Microsoft.Maps.Map = null;
    private _isEditable: boolean = false;
    private _title: string = '';
    private _maxZoom: number = -1;
    private _minZoom: number = -1;
    private _showLabel: boolean = false;
    private _showTooltip: boolean = false;
    private _label: BingMapLabel = null;
    private _tooltip: BingMapLabel = null;
    private _hasToolTipReceiver: boolean = false;
    private _tooltipVisible: boolean = false;
    private _mouseOverListener: Microsoft.Maps.IHandlerId;
    private _mouseMoveListener: Microsoft.Maps.IHandlerId;
    private _mouseOutListener: Microsoft.Maps.IHandlerId;
    private _metadata: Map<string, any> = new Map<string, any>();
    private _originalPath: Array<Array<ILatLong>>;
    private _editingCompleteEmitter: (event: IPolygonEvent) => void;

    ///
    /// Property declarations
    ///

    /**
     * Gets or sets the maximum zoom at which the label is displayed. Ignored or ShowLabel is false.
     *
     * @type {number}
     * @memberof GooglePolygon
     * @property
     * @public
     */
    public get LabelMaxZoom(): number { return this._maxZoom; }
    public set LabelMaxZoom(val: number) {
        this._maxZoom = val;
        this.ManageLabel();
    }

    /**
     * Gets or sets the minimum zoom at which the label is displayed. Ignored or ShowLabel is false.
     *
     * @type {number}
     * @memberof GooglePolygon
     * @property
     * @public
     */
    public get LabelMinZoom(): number { return this._minZoom; }
    public set LabelMinZoom(val: number) {
        this._minZoom = val;
        this.ManageLabel();
    }

    /**
     * Gets the polygon metadata.
     *
     * @readonly
     * @type {Map<string, any>}
     * @memberof BingPolygon
     */
    public get Metadata(): Map<string, any> { return this._metadata; }

    /**
     * Gets the native primitve implementing the polygon, in this case {@link Microsoft.Maps.Polygon}
     *
     * @readonly
     * @type {*}
     * @memberof BingPolygon
     */
    public get NativePrimitve(): Microsoft.Maps.Polygon { return this._polygon; }

    /**
     * Gets or sets whether to show the label
     *
     * @abstract
     * @type {boolean}
     * @memberof BingPolygon
     * @property
     * @public
     */
    public get ShowLabel(): boolean { return this._showLabel; }
    public set ShowLabel(val: boolean) {
        this._showLabel = val;
        this.ManageLabel();
    }

    /**
     * Gets or sets whether to show the tooltip
     *
     * @abstract
     * @type {boolean}
     * @memberof BingPolygon
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
     * @memberof BingPolygon
     * @property
     * @public
     */
    public get Title(): string { return this._title; }
    public set Title(val: string) {
        this._title = val;
        this.ManageLabel();
        this.ManageTooltip();
    }

    ///
    /// constructor
    ///

    /**
     * Creates an instance of BingPolygon.
     * @param {Microsoft.Maps.Polygon} _polygon - The {@link Microsoft.Maps.Polygon} underlying the model.
     * @param {BingMapService} - Instance of the Map Service.
     * @param {Microsoft.Maps.Layer} _layer - The context layer.
     * @memberof BingPolygon
     */
    constructor(
        private _polygon: Microsoft.Maps.Polygon,
        protected _mapService: BingMapService,
        protected _layer: Microsoft.Maps.Layer,
    ) {
        super();
        this._map = this._mapService.MapInstance;
        this._originalPath = this.GetPaths();
    }

    /**
     * Adds a delegate for an event.
     *
     * @param {string} eventType - String containing the event name.
     * @param fn - Delegate function to execute when the event occurs.

     * @memberof BingPolygon
     */
    public AddListener(eventType: string, fn: Function): void {
        const supportedEvents = ['click', 'dblclick', 'drag', 'dragend', 'dragstart', 'mousedown', 'mouseout', 'mouseover', 'mouseup'];
        if (supportedEvents.indexOf(eventType) !== -1) {
            Microsoft.Maps.Events.addHandler(this._polygon, eventType, (e) => {
                fn(e);
            });
        }
        if (eventType === 'mousemove') {
            let handlerId: Microsoft.Maps.IHandlerId;
            Microsoft.Maps.Events.addHandler(this._polygon, 'mouseover', e => {
                handlerId = Microsoft.Maps.Events.addHandler(this._map, 'mousemove', m => fn(m));
            });
            Microsoft.Maps.Events.addHandler(this._polygon, 'mouseout', e => {
                if (handlerId) { Microsoft.Maps.Events.removeHandler(handlerId); }
            });
        } if (eventType === 'pathchanged') {
            this._editingCompleteEmitter = <(event: IPolygonEvent) => void>fn;
        }
    }

    /**
     * Deleted the polygon.
     *
     * @memberof BingPolygon
     */
    public Delete(): void {
        if (this._layer) { this._layer.remove(this.NativePrimitve); }
        else {
            this._map.entities.remove(this.NativePrimitve);
        }
        if (this._label) { this._label.Delete(); }
        if (this._tooltip) { this._tooltip.Delete(); }
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
        throw (new Error('The bing maps implementation currently does not support draggable polygons.'));
    }

    /**
     * Sets wether the polygon path is editable.
     *
     * @param {boolean} editable - True to make polygon path editable, false otherwise.
     *
     * @memberof BingPolygon
     */
    public SetEditable(editable: boolean): void {
        const isChanged = this._isEditable !== editable;
        this._isEditable = editable;
        if (!isChanged) {
            return;
        }

        if (this._isEditable) {
            this._originalPath = this.GetPaths();
            this._mapService.GetDrawingTools().then(t => {
                t.edit(this._polygon);
            });
        }
        else {
            this._mapService.GetDrawingTools().then(t => {
                t.finish((editedPolygon: Microsoft.Maps.Polygon) => {
                    if (editedPolygon !== this._polygon || !this._editingCompleteEmitter) {
                        return;
                    }
                    const newPath: Array<Array<ILatLong>> = this.GetPaths();
                    const originalPath: Array<Array<ILatLong>> = this._originalPath;
                    this.SetPaths(newPath);
                        // this is necessary for the new path to persist it appears.
                    this._editingCompleteEmitter({
                        Click: null,
                        Polygon: this,
                        OriginalPath: originalPath,
                        NewPath: newPath
                    });
                });
            });
        }
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
        if (options.visible != null && this._showLabel && this._label) { this._label.Set('hidden', !options.visible); }

        if (typeof options.editable !== 'undefined') {
            this.SetEditable(options.editable);
        }
    }

    /**
     * Sets the polygon path.
     *
     * @param {Array<ILatLong>} path - An Array of {@link ILatLong} (or array of arrays) describing the polygons path.
     *
     * @memberof BingPolygon
     */
    public SetPath(path: Array<ILatLong>): void {
        const p: Array<Microsoft.Maps.Location> = new Array<Microsoft.Maps.Location>();
        path.forEach(x => p.push(new Microsoft.Maps.Location(x.latitude, x.longitude)));
        this._originalPath = [path];
        this._polygon.setLocations(p);
        if (this._label) {
            this._centroid = null;
            this.ManageLabel();
        }
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
        if (paths == null) { return; }
        if (!Array.isArray(paths)) { return; }
        if (paths.length === 0) {
            this._polygon.setRings(new Array<Microsoft.Maps.Location>());
            if (this._label) {
                this._label.Delete();
                this._label = null;
            }
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
            this._originalPath = <Array<Array<ILatLong>>>paths;
            this._polygon.setRings(p);
            if (this._label) {
                this._centroid = null;
                this.ManageLabel();
            }
        }
        else {
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
        if (this._showLabel && this._label) { this._label.Set('hidden', !visible); }
    }

    ///
    /// Private methods
    ///

    /**
     * Configures the label for the polygon
     * @memberof Polygon
     * @private
     */
    private ManageLabel(): void {
        if (this.GetPath == null || this.GetPath().length === 0) { return; }
        if (this._showLabel && this._title != null && this._title !== '') {
            const o: { [key: string]: any } = {
                text: this._title,
                position: BingConversions.TranslateLocation(this.Centroid)
            };
            if (o.position == null) { return; }
            if (this._minZoom !== -1) { o.minZoom = this._minZoom; }
            if (this._maxZoom !== -1) { o.maxZoom = this._maxZoom; }
            if (this._label == null) {
                this._label = new BingMapLabel(o);
                this._label.SetMap(this._map);
            }
            else {
                this._label.SetValues(o);
            }
            this._label.Set('hidden', !this.GetVisible());
        }
        else {
            if (this._label) {
                this._label.SetMap(null);
                this._label = null;
            }
        }
    }

    /**
     * Configures the tooltip for the polygon
     * @memberof Polygon
     * @private
     */
    private ManageTooltip(): void {
        if (this._showTooltip && this._title != null && this._title !== '') {
            const o: { [key: string]: any } = {
                text: this._title,
                align: 'left',
                offset: new Microsoft.Maps.Point(0, 25),
                backgroundColor: 'bisque',
                hidden: true,
                fontSize: 12,
                fontColor: '#000000',
                strokeWeight: 0
            };
            if (this._tooltip == null) {
                this._tooltip = new BingMapLabel(o);
                this._tooltip.SetMap(this._map);
            }
            else {
                this._tooltip.SetValues(o);
            }
            if (!this._hasToolTipReceiver) {
                this._mouseOverListener = Microsoft.Maps.Events.addHandler(
                    this._polygon, 'mouseover', (e: Microsoft.Maps.IMouseEventArgs) => {
                        this._tooltip.Set('position', e.location);
                        if (!this._tooltipVisible) {
                            this._tooltip.Set('hidden', false);
                            this._tooltipVisible = true;
                        }
                        this._mouseMoveListener = Microsoft.Maps.Events.addHandler(
                            this._map, 'mousemove', (m: Microsoft.Maps.IMouseEventArgs) => {
                                if (this._tooltipVisible && m.location && m.primitive === this._polygon) {
                                    this._tooltip.Set('position', m.location);
                                }
                            });
                    });
                this._mouseOutListener = Microsoft.Maps.Events.addHandler(
                    this._polygon, 'mouseout', (e: Microsoft.Maps.IMouseEventArgs) => {
                        if (this._tooltipVisible) {
                            this._tooltip.Set('hidden', true);
                            this._tooltipVisible = false;
                        }
                        if (this._mouseMoveListener) { Microsoft.Maps.Events.removeHandler(this._mouseMoveListener); }
                    });
                this._hasToolTipReceiver = true;
            }
        }
        if ((!this._showTooltip || this._title === '' || this._title == null)) {
            if (this._hasToolTipReceiver) {
                if (this._mouseOutListener) { Microsoft.Maps.Events.removeHandler(this._mouseOutListener); }
                if (this._mouseOverListener) { Microsoft.Maps.Events.removeHandler(this._mouseOverListener); }
                if (this._mouseMoveListener) { Microsoft.Maps.Events.removeHandler(this._mouseMoveListener); }
                this._hasToolTipReceiver = false;
            }
            if (this._tooltip) {
                this._tooltip.SetMap(null);
                this._tooltip = null;
            }
        }
    }

}
