import {
    Directive, SimpleChange, Input, Output, OnDestroy, OnChanges,
    EventEmitter, ContentChild, AfterContentInit, ViewContainerRef, NgZone,
    SimpleChanges
} from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx';
import { IPoint } from '../interfaces/ipoint';
import { ISize } from '../interfaces/isize';
import { ILatLong } from '../interfaces/ilatlong';
import { IPolylineEvent } from '../interfaces/ipolyline-event';
import { IPolylineOptions } from '../interfaces/ipolyline-options';
import { ILayerOptions } from '../interfaces/ilayer-options';
import { ILabelOptions } from '../interfaces/ilabel-options';
import { LayerService } from '../services/layer.service';
import { MapService } from '../services/map.service';
import { Layer } from '../models/layer';
import { Polyline } from '../models/polyline';
import { MapLabel } from '../models/map-label';
import { CanvasOverlay } from '../models/canvas-overlay';

/**
 * internal counter to use as ids for polylines.
 */
let layerId = 1000000;

/**
 * MapPolylineLayerDirective performantly renders a large set of polyline on a {@link MapComponent}.
 *
 * ### Example
 * ```typescript
 * import {Component} from '@angular/core';
 * import {MapComponent} from '...';
 *
 * @Component({
 *  selector: 'my-map-cmp',
 *  styles: [`
 *   .map-container {
 *     height: 300px;
 *   }
 * `],
 * template: `
 *   <x-map [Latitude]="lat" [Longitude]="lng" [Zoom]="zoom">
 *      <x-map-polyline-layer [PolygonOptions]="_polyline"></x-map-polyline-layer>
 *   </x-map>
 * `
 * })
 * ```
 *
 * @export
 * @class MapPolylineLayerDirective
 * @implements {OnDestroy}
 * @implements {OnChanges}
 * @implements {AfterContentInit}
 */
@Directive({
    selector: 'x-map-polyline-layer'
})
export class MapPolylineLayerDirective implements OnDestroy, OnChanges, AfterContentInit {

    ///
    /// Field declarations
    ///
    private _id: number;
    private _layerPromise: Promise<Layer>;
    private _service: LayerService;
    private _canvas: CanvasOverlay;
    private _labels: Array<{loc: ILatLong, title: string}> = new Array<{loc: ILatLong, title: string}>();
    private _tooltip: MapLabel;
    private _tooltipSubscriptions: Array<Subscription> = new Array<Subscription>();
    private _tooltipVisible: boolean = false;
    private _defaultOptions: ILabelOptions = {
        fontSize: 11,
        fontFamily: 'sans-serif',
        strokeWeight: 2,
        strokeColor: '#000000',
        fontColor: '#ffffff'
    };
    private _streaming: boolean = false;
    private _polylines: Array<IPolylineOptions> = new Array<IPolylineOptions>();
    private _polylinesLast: Array<IPolylineOptions> = new Array<IPolylineOptions>();

    /**
     * Set the maximum zoom at which the polyline labels are visible. Ignored if ShowLabel is false.
     * @type {number}
     * @memberof MapPolylineLayerDirective
     */
    @Input() public LabelMaxZoom: number = Number.MAX_SAFE_INTEGER;

    /**
     * Set the minimum zoom at which the polyline labels are visible. Ignored if ShowLabel is false.
     * @type {number}
     * @memberof MapPolylineLayerDirective
     */
    @Input() public LabelMinZoom: number = -1;

    /**
     * Sepcifies styleing options for on-map polyline labels.
     *
     * @type {ILabelOptions}
     * @memberof MapPolylineLayerDirective
     */
    @Input() public LabelOptions: ILabelOptions;

    /**
     * Gets or sets An offset applied to the positioning of the layer.
     *
     * @type {IPoint}
     * @memberof MapPolylineLayerDirective
     */
    @Input() public LayerOffset: IPoint = null;

    /**
     * An array of polyline options representing the polylines in the layer.
     *
     * @type {Array<IPolylineOptions>}
     * @memberof MapPolylineLayerDirective
     */
    @Input()
        public get PolylineOptions(): Array<IPolylineOptions> { return this._polylines; }
        public set PolylineOptions(val: Array<IPolylineOptions>) {
            if (this._streaming) {
                this._polylinesLast.push(...val.slice(0));
                this._polylines.push(...val);
            }
            else {
                this._polylines = val.slice(0);
            }
        }

    /**
     * Whether to show the polylines titles as the labels on the polylines.
     *
     * @type {boolean}
     * @memberof MapPolylineLayerDirective
     */
    @Input() public ShowLabels: boolean = false;

    /**
     * Whether to show the titles of the polylines as the tooltips on the polylines.
     *
     * @type {boolean}
     * @memberof MapPolylineLayerDirective
     */
    @Input() public ShowTooltips: boolean = true;

    /**
     * Sets whether to treat changes in the PolylineOptions as streams of new markers. In this mode, changing the
     * Array supplied in PolylineOptions will be incrementally drawn on the map as opposed to replace the polylines on the map.
     *
     * @type {boolean}
     * @memberof MapPolylineLayerDirective
     */
    @Input()
        public get TreatNewPolylineOptionsAsStream(): boolean { return this._streaming; }
        public set TreatNewPolylineOptionsAsStream(val: boolean) { this._streaming = val; }

    /**
     * Sets the visibility of the marker layer
     *
     * @type {string}
     * @memberof MapPolylineLayerDirective
     */
    @Input() public Visible: boolean;

    /**
     * Gets or sets the z-index of the layer. If not used, layers get stacked in the order created.
     *
     * @type {number}
     * @memberof MapPolylineLayerDirective
     */
    @Input() public ZIndex: number = 0;

    ///
    /// Delegates
    ///

    /**
     * This event emitter gets emitted when the user clicks a polyline in the layer.
     *
     * @type {EventEmitter<IPolylineEvent>}
     * @memberof MapPolylineLayerDirective
     */
    @Output() public PolylineClick: EventEmitter<IPolylineEvent> = new EventEmitter<IPolylineEvent>();

    /**
     * This event is fired when the DOM dblclick event is fired on a polyline in the layer.
     *
     * @type {EventEmitter<IPolylineEvent>}
     * @memberof MapPolylineLayerDirective
     */
    @Output() PolylineDblClick: EventEmitter<IPolylineEvent> = new EventEmitter<IPolylineEvent>();

    /**
     * This event is fired when the DOM mousemove event is fired on a polyline in the layer.
     *
     * @type {EventEmitter<IPolylineEvent>}
     * @memberof MapPolylineLayerDirective
     */
    @Output() PolylineMouseMove: EventEmitter<IPolylineEvent> = new EventEmitter<IPolylineEvent>();

    /**
     * This event is fired on mouseout on a polyline in the layer.
     *
     * @type {EventEmitter<IPolygonEvent>}
     * @memberof MapPolylineLayerDirective
     */
    @Output() PolylineMouseOut: EventEmitter<IPolylineEvent> = new EventEmitter<IPolylineEvent>();

    /**
     * This event is fired on mouseover on a polyline in a layer.
     *
     * @type {EventEmitter<IPolylineEvent>}
     * @memberof MapPolylineLayerDirective
     */
    @Output() PolylineMouseOver: EventEmitter<IPolylineEvent> = new EventEmitter<IPolylineEvent>();



    ///
    /// Property declarations
    ///

    /**
     * Gets the id of the polyline layer.
     *
     * @readonly
     * @type {number}
     * @memberof MapPolylineLayerDirective
     */
    public get Id(): number { return this._id; }

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of MapPolylineLayerDirective.
     * @param {LayerService} _layerService - Concreate implementation of a {@link LayerService}.
     * @param {MapService} _mapService - Concreate implementation of a {@link MapService}.
     * @param {NgZone} _zone - Concreate implementation of a {@link NgZone} service.
     * @memberof MapPolylineLayerDirective
     */
    constructor(
        private _layerService: LayerService,
        private _mapService: MapService,
        private _zone: NgZone) {
        this._id = layerId++;
    }

    ///
    /// Public methods
    ///

    /**
     * Called after Component content initialization. Part of ng Component life cycle.
     * @returns {void}
     *
     * @memberof MapPolylineLayerDirective
     */
    public ngAfterContentInit() {
        const layerOptions: ILayerOptions = {
            id: this._id
        };
        this._zone.runOutsideAngular(() => {
            const fakeLayerDirective: any = {
                Id : this._id,
                Visible: this.Visible,
                LayerOffset: this.LayerOffset,
                ZIndex: this.ZIndex
            };
            this._layerService.AddLayer(fakeLayerDirective);
            this._layerPromise = this._layerService.GetNativeLayer(fakeLayerDirective);

            Promise.all([
                    this._layerPromise,
                    this._mapService.CreateCanvasOverlay(el => this.DrawLabels(el))
                ]).then(values => {
                    values[0].SetVisible(this.Visible);
                    this._canvas = values[1];
                    this._canvas._canvasReady.then(b => {
                        this._tooltip = this._canvas.GetToolTipOverlay();
                        this.ManageTooltip(this.ShowTooltips);
                    });
                    if (this.PolylineOptions) {
                        this._zone.runOutsideAngular(() => this.UpdatePolylines());
                    }
                });
            this._service = this._layerService;
        });
    }

    /**
     * Called on component destruction. Frees the resources used by the component. Part of the ng Component life cycle.
     *
     * @memberof MapPolylineLayerDirective
     */
    public ngOnDestroy() {
        this._tooltipSubscriptions.forEach(s => s.unsubscribe());
        this._layerPromise.then(l => {
            l.Delete();
        });
        if (this._canvas) { this._canvas.Delete(); }
    }

    /**
     * Reacts to changes in data-bound properties of the component and actuates property changes in the underling layer model.
     *
     * @param {{ [propName: string]: SimpleChange }} changes - collection of changes.
     * @memberof MapPolylineLayerDirective
     */
    public ngOnChanges(changes: { [key: string]: SimpleChange }) {
        if (changes['PolylineOptions']) {
            this._zone.runOutsideAngular(() => {
                this.UpdatePolylines();
            });
        }
        if (changes['Visible'] && !changes['Visible'].firstChange) {
            this._layerPromise.then(l => l.SetVisible(this.Visible));
        }
        if ((changes['ZIndex'] && !changes['ZIndex'].firstChange) ||
            (changes['LayerOffset'] && !changes['LayerOffset'].firstChange)
        ) {
            throw (new Error('You cannot change ZIndex or LayerOffset after the layer has been created.'));
        }
        if ((changes['ShowLabels'] && !changes['ShowLabels'].firstChange) ||
            (changes['LabelMinZoom'] && !changes['LabelMinZoom'].firstChange) ||
            (changes['LabelMaxZoom'] && !changes['LabelMaxZoom'].firstChange)
        ) {
            if (this._canvas) {
                this._canvas.Redraw(true);
            }
        }
        if (changes['ShowTooltips'] && this._tooltip) {
            this.ManageTooltip(changes['ShowTooltips'].currentValue);
        }
    }

    /**
     * Obtains a string representation of the Layer Id.
     * @return {string} - string representation of the layer id.
     * @memberof MapPolylineLayerDirective
     */
    public toString(): string { return 'MapPolylineLayer-' + this._id.toString(); }

    ///
    /// Private methods
    ///

    /**
     * Adds various event listeners for the polylines.
     *
     * @param {Polyline} p - the polyline for which to add the event.
     * @private
     *
     * @memberof MapPolylineLayerDirective
     */
    private AddEventListeners(p: Polyline): void {
        const handlers = [
            { name: 'click', handler: (ev: MouseEvent) => this.PolylineClick.emit({Polyline: p, Click: ev}) },
            { name: 'dblclick', handler: (ev: MouseEvent) => this.PolylineDblClick.emit({Polyline: p, Click: ev}) },
            { name: 'mousemove', handler: (ev: MouseEvent) => this.PolylineMouseMove.emit({Polyline: p, Click: ev}) },
            { name: 'mouseout', handler: (ev: MouseEvent) => this.PolylineMouseOut.emit({Polyline: p, Click: ev}) },
            { name: 'mouseover', handler: (ev: MouseEvent) => this.PolylineMouseOver.emit({Polyline: p, Click: ev}) }
        ];
        handlers.forEach((obj) => p.AddListener(obj.name, obj.handler));
    }

    /**
     * Draws the polyline labels. Called by the Canvas overlay.
     *
     * @private
     * @param {HTMLCanvasElement} el - The canvas on which to draw the labels.
     * @memberof MapPolylineLayerDirective
     */
    private DrawLabels(el: HTMLCanvasElement): void {
        if (this.ShowLabels) {
            this._mapService.GetZoom().then(z => {
                if (this.LabelMinZoom <= z && this.LabelMaxZoom >= z) {
                    const ctx: CanvasRenderingContext2D = el.getContext('2d');
                    const labels = this._labels.map(x => x.title);
                    this._mapService.LocationsToPoints(this._labels.map(x => x.loc)).then(locs => {
                        const size: ISize = this._mapService.MapSize;
                        for (let i = 0, len = locs.length; i < len; i++) {
                            // Don't draw the point if it is not in view. This greatly improves performance when zoomed in.
                            if (locs[i].x >= 0 && locs[i].y >= 0 && locs[i].x <= size.width && locs[i].y <= size.height) {
                                this.DrawText(ctx, locs[i], labels[i]);
                            }
                        }
                    });
                }
            });
        }
    }

    /**
     * Draws the label text at the appropriate place on the canvas.
     * @param {CanvasRenderingContext2D} ctx - Canvas drawing context.
     * @param {IPoint} loc - Pixel location on the canvas where to center the text.
     * @param {string} text - Text to draw.
     */
    private DrawText(ctx: CanvasRenderingContext2D, loc: IPoint, text: string) {
        let lo: ILabelOptions = this.LabelOptions;
        if (lo == null && this._tooltip) { lo = this._tooltip.DefaultLabelStyle; }
        if (lo == null) { lo = this._defaultOptions; }

        ctx.strokeStyle = lo.strokeColor;
        ctx.font = `${lo.fontSize}px ${lo.fontFamily}`;
        ctx.textAlign = 'center';
        const strokeWeight: number = lo.strokeWeight;
        if (text && strokeWeight && strokeWeight > 0) {
                ctx.lineWidth = strokeWeight;
                ctx.strokeText(text, loc.x, loc.y);
        }
        ctx.fillStyle = lo.fontColor;
        ctx.fillText(text, loc.x, loc.y);
    }

    /**
     * Manages the tooltip and the attachment of the associated events.
     *
     * @private
     * @param {boolean} show - True to enable the tooltip, false to disable.
     * @memberof MapPolygonLayerDirective
     */
    private ManageTooltip(show: boolean): void {
        if (show && this._canvas) {
            // add tooltip subscriptions
            this._tooltip.Set('hidden', true);
            this._tooltipVisible = false;
            this._tooltipSubscriptions.push(this.PolylineMouseMove.asObservable().subscribe(e => {
                if (this._tooltipVisible) {
                    const loc: ILatLong = this._canvas.GetCoordinatesFromClick(e.Click);
                    this._tooltip.Set('position', loc);
                }
            }));
            this._tooltipSubscriptions.push(this.PolylineMouseOver.asObservable().subscribe(e => {
                if (e.Polyline.Title && e.Polyline.Title.length > 0) {
                    const loc: ILatLong = this._canvas.GetCoordinatesFromClick(e.Click);
                    this._tooltip.Set('text', e.Polyline.Title);
                    this._tooltip.Set('position', loc);
                    if (!this._tooltipVisible) {
                        this._tooltip.Set('hidden', false);
                        this._tooltipVisible = true;
                    }
                }
            }));
            this._tooltipSubscriptions.push(this.PolylineMouseOut.asObservable().subscribe(e => {
                if (this._tooltipVisible) {
                    this._tooltip.Set('hidden', true);
                    this._tooltipVisible = false;
                }
            }));
        }
        else {
            // remove tooltip subscriptions
            this._tooltipSubscriptions.forEach(s => s.unsubscribe());
            this._tooltipSubscriptions.splice(0);
            this._tooltip.Set('hidden', true);
            this._tooltipVisible = false;
        }
    }

    /**
     * Sets or updates the polyliness based on the polyline options. This will place the polylines on the map
     * and register the associated events.
     *
     * @memberof MapPolylineLayerDirective
     * @method
     * @private
     */
    private UpdatePolylines(): void {
        if (this._layerPromise == null) {
            return;
        }
        this._layerPromise.then(l => {
            const polylines: Array<IPolylineOptions> = this._streaming ? this._polylinesLast.splice(0) : this._polylines;
            if (!this._streaming) { this._labels.splice(0); }

            // generate the promise for the polylines
            const lp: Promise<Array<Polyline|Array<Polyline>>> = this._service.CreatePolylines(l.GetOptions().id, polylines);

            // set polylines once promises are fullfilled.
            lp.then(p => {
                const y: Array<Polyline> = new Array<Polyline>();
                p.forEach(poly => {
                    if (Array.isArray(poly)) {
                        let title: string = '';
                        const centroids: Array<ILatLong> = new Array<ILatLong>();
                        poly.forEach(x => {
                            y.push(x);
                            this.AddEventListeners(x);
                            centroids.push(x.Centroid);
                            if (x.Title != null && x.Title.length > 0 && title.length === 0) { title = x.Title; }
                        });
                        this._labels.push({loc: Polyline.GetPolylineCentroid(centroids), title: title});
                    }
                    else {
                        y.push(poly);
                        if (poly.Title != null && poly.Title.length > 0) { this._labels.push({loc: poly.Centroid, title: poly.Title}); }
                        this.AddEventListeners(poly);
                    }
                });
                this._streaming ? l.AddEntities(y) : l.SetEntities(y);
                if (this._canvas) { this._canvas.Redraw(!this._streaming); }
            });
        });
    }

}
