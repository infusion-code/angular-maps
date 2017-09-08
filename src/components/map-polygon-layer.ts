import {
    Directive, SimpleChange, Input, Output, OnDestroy, OnChanges,
    EventEmitter, ContentChild, AfterContentInit, ViewContainerRef, NgZone,
    SimpleChanges
} from '@angular/core';
import { Subscription } from 'rxjs/subscription';
import { Observable } from 'rxjs/Rx';
import { IPoint } from '../interfaces/ipoint';
import { ISize } from '../interfaces/isize';
import { ILatLong } from '../interfaces/ilatlong';
import { IPolygonEvent } from '../interfaces/ipolygon-event';
import { IPolygonOptions } from '../interfaces/ipolygon-options';
import { ILayerOptions } from '../interfaces/ilayer-options';
import { ILabelOptions } from '../interfaces/ilabel-options';
import { LayerService } from '../services/layer.service';
import { MapService } from '../services/map.service';
import { Layer } from '../models/layer';
import { Polygon } from '../models/polygon';
import { MapLabel } from '../models/map-label';
import { CanvasOverlay } from '../models/canvas-overlay';

/**
 * internal counter to use as ids for polygons.
 */
let layerId = 1000000;

/**
 * MapPolygonLayerDirective performantly renders a large set of polygons on a {@link MapComponent}.
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
 *      <x-map-polygon-layer [PolygonOptions]="_polygons"></x-map-polygon-layer>
 *   </x-map>
 * `
 * })
 * ```
 *
 * @export
 * @class MapPolygonLayerDirective
 * @implements {OnDestroy}
 * @implements {OnChanges}
 * @implements {AfterContentInit}
 */
@Directive({
    selector: 'x-map-polygon-layer'
})
export class MapPolygonLayerDirective implements OnDestroy, OnChanges, AfterContentInit {

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
    private _polygons: Array<IPolygonOptions> = new Array<IPolygonOptions>();
    private _polygonsLast: Array<IPolygonOptions> = new Array<IPolygonOptions>();

    /**
     * Set the maximum zoom at which the polygon labels are visible. Ignored if ShowLabel is false.
     * @type {number}
     * @memberof MapPolygonLayerDirective
     */
    @Input() public LabelMaxZoom: number = Number.MAX_SAFE_INTEGER;

    /**
     * Set the minimum zoom at which the polygon labels are visible. Ignored if ShowLabel is false.
     * @type {number}
     * @memberof MapPolygonLayerDirective
     */
    @Input() public LabelMinZoom: number = -1;

    /**
     * Sepcifies styleing options for on-map polygon labels.
     *
     * @type {ILabelOptions}
     * @memberof MapPolygonLayerDirective
     */
    @Input() public LabelOptions: ILabelOptions;

    /**
     * Gets or sets An offset applied to the positioning of the layer.
     *
     * @type {IPoint}
     * @memberof MapPolygonLayerDirective
     */
    @Input() public LayerOffset: IPoint = null;

    /**
     * An array of polygon options representing the polygons in the layer.
     *
     * @type {Array<IPolygonOptions>}
     * @memberof MapPolygonLayerDirective
     */
    @Input()
        public get PolygonOptions(): Array<IPolygonOptions> { return this._polygons; }
        public set PolygonOptions(val: Array<IPolygonOptions>) {
            if (this._streaming) {
                this._polygonsLast = val.slice(0);
                this._polygons.push(...val);
            }
            else {
                this._polygons = val.slice(0);
            }
        }

    /**
     * Whether to show the polygon titles as the labels on the polygons.
     *
     * @type {boolean}
     * @memberof MapPolygonLayerDirective
     */
    @Input() public ShowLabels: boolean = false;

    /**
     * Whether to show the titles of the polygosn as the tooltips on the polygons.
     *
     * @type {boolean}
     * @memberof MapPolygonLayerDirective
     */
    @Input() public ShowTooltips: boolean = true;

    /**
     * Sets whether to treat changes in the PolygonOptions as streams of new markers. In this mode, changing the
     * Array supplied in PolygonOptions will be incrementally drawn on the map as opposed to replace the polygons on the map.
     *
     * @type {boolean}
     * @memberof MapPolygonLayerDirective
     */
    @Input()
        public get TreatNewPolygonOptionsAsStream(): boolean { return this._streaming; }
        public set TreatNewPolygonOptionsAsStream(val: boolean) { this._streaming = val; }

    /**
     * Sets the visibility of the marker layer
     *
     * @type {string}
     * @memberof MapPolygonLayerDirective
     */
    @Input() public Visible: boolean;

    /**
     * Gets or sets the z-index of the layer. If not used, layers get stacked in the order created.
     *
     * @type {number}
     * @memberof MapPolygonLayerDirective
     */
    @Input() public ZIndex: number = 0;

    ///
    /// Delegates
    ///

    /**
     * This event emitter gets emitted when the user clicks a polygon in the layer.
     *
     * @type {EventEmitter<IPolygonEvent>}
     * @memberof MapPolygonLayerDirective
     */
    @Output() public PolygonClick: EventEmitter<IPolygonEvent> = new EventEmitter<IPolygonEvent>();

    /**
     * This event is fired when the DOM dblclick event is fired on a polygon in the layer.
     *
     * @type {EventEmitter<IPolygonEvent>}
     * @memberof MapPolygonLayerDirective
     */
    @Output() PolygonDblClick: EventEmitter<IPolygonEvent> = new EventEmitter<IPolygonEvent>();

    /**
     * This event is fired when the DOM mousemove event is fired on a polygon in the layer.
     *
     * @type {EventEmitter<IPolygonEvent>}
     * @memberof MapPolygonLayerDirective
     */
    @Output() PolygonMouseMove: EventEmitter<IPolygonEvent> = new EventEmitter<IPolygonEvent>();

    /**
     * This event is fired on mouseout on a polygon in the layer.
     *
     * @type {EventEmitter<IPolygonEvent>}
     * @memberof MapPolygonLayerDirective
     */
    @Output() PolygonMouseOut: EventEmitter<IPolygonEvent> = new EventEmitter<IPolygonEvent>();

    /**
     * This event is fired on mouseover on a polygon in a layer.
     *
     * @type {EventEmitter<IPolygonEvent>}
     * @memberof MapPolygonLayerDirective
     */
    @Output() PolygonMouseOver: EventEmitter<IPolygonEvent> = new EventEmitter<IPolygonEvent>();



    ///
    /// Property declarations
    ///

    /**
     * Gets the id of the marker layer.
     *
     * @readonly
     * @type {number}
     * @memberof MapPolygonLayerDirective
     */
    public get Id(): number { return this._id; }

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of MapPolygonLayerDirective.
     * @param {LayerService} _layerService - Concreate implementation of a {@link LayerService}.
     * @param {MapService} _mapService - Concreate implementation of a {@link MapService}.
     * @param {NgZone} _zone - Concreate implementation of a {@link NgZone} service.
     * @memberof MapPolygonLayerDirective
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
     * @memberof MapPolygonLayerDirective
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
            }
            this._layerService.AddLayer(fakeLayerDirective);
            this._layerPromise = this._layerService.GetNativeLayer(fakeLayerDirective);
            this._mapService.CreateCanvasOverlay(el => this.DrawLabels(el)).then(c => {
                this._canvas = c;
                c._canvasReady.then(b => {
                    this._tooltip = c.GetToolTipOverlay();
                    this.ManageTooltip(this.ShowTooltips);
                });
                if (this.PolygonOptions) {
                    this._zone.runOutsideAngular(() => this.UpdatePolygons());
                }
            });
            this._service = this._layerService;
        });
    }

    /**
     * Called on component destruction. Frees the resources used by the component. Part of the ng Component life cycle.
     *
     * @memberof MapPolygonLayerDirective
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
     * @memberof MapPolygonLayerDirective
     */
    public ngOnChanges(changes: { [key: string]: SimpleChange }) {
        if (changes['PolygonOptions']) {
            this._zone.runOutsideAngular(() => {
                this.UpdatePolygons();
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
            this.ManageTooltip(changes['ShowTooltips'].currentValue)
        }
    }

    /**
     * Obtains a string representation of the Marker Id.
     * @return {string} - string representation of the marker id.
     * @memberof MapPolygonLayerDirective
     */
    public toString(): string { return 'MapPolygonLayer-' + this._id.toString(); }

    ///
    /// Private methods
    ///

    /**
     * Adds various event listeners for the marker.
     *
     * @param {Polygon} p - the polygon for which to add the event.
     * @private
     *
     * @memberof MapPolygonLayerDirective
     */
    private AddEventListeners(p: Polygon): void {
        const handlers = [
            { name: 'click', handler: (ev: MouseEvent) => this.PolygonClick.emit({Polygon: p, Click: ev}) },
            { name: 'dblclick', handler: (ev: MouseEvent) => this.PolygonDblClick.emit({Polygon: p, Click: ev}) },
            { name: 'mousemove', handler: (ev: MouseEvent) => this.PolygonMouseMove.emit({Polygon: p, Click: ev}) },
            { name: 'mouseout', handler: (ev: MouseEvent) => this.PolygonMouseOut.emit({Polygon: p, Click: ev}) },
            { name: 'mouseover', handler: (ev: MouseEvent) => this.PolygonMouseOver.emit({Polygon: p, Click: ev}) }
        ];
        handlers.forEach((obj) => p.AddListener(obj.name, obj.handler));
    }

    /**
     * Draws the polygon labels. Called by the Canvas overlay.
     *
     * @private
     * @param {HTMLCanvasElement} el - The canvas on which to draw the labels.
     * @memberof MapPolygonLayerDirective
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
        const strokeWeight: number = lo.strokeWeight
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
            this._tooltipSubscriptions.push(this.PolygonMouseMove.asObservable().subscribe(e => {
                if (this._tooltipVisible) {
                    const loc: ILatLong = this._canvas.GetCoordinatesFromClick(e.Click);
                    this._tooltip.Set('position', loc);
                }
            }));
            this._tooltipSubscriptions.push(this.PolygonMouseOver.asObservable().subscribe(e => {
                if (e.Polygon.Title && e.Polygon.Title.length > 0) {
                    const loc: ILatLong = this._canvas.GetCoordinatesFromClick(e.Click);
                    this._tooltip.Set('text', e.Polygon.Title);
                    this._tooltip.Set('position', loc);
                    if (!this._tooltipVisible) {
                        this._tooltip.Set('hidden', false);
                        this._tooltipVisible = true;
                    }
                }
            }));
            this._tooltipSubscriptions.push(this.PolygonMouseOut.asObservable().subscribe(e => {
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
            this._tooltip.Set('hidden', false);
            this._tooltipVisible = false;
        }
    }

    /**
     * Sets or updates the polygons based on the polygon options. This will place the polygons on the map
     * and register the associated events.
     *
     * @memberof MapPolygonLayerDirective
     * @method
     * @private
     */
    private UpdatePolygons(): void {
        if (this._layerPromise == null) { return; }
        this._layerPromise.then(l => {
            const polygons: Array<IPolygonOptions> = this._streaming ? this._polygonsLast : this._polygons;

            if (!this._streaming) { this._labels.splice(0); }
            if (this.Visible === false) { this.PolygonOptions.forEach(o => o.visible = false); }

            // generate the promise for the markers
            const lp: Promise<Array<Polygon>> = this._service.CreatePolygons(l.GetOptions().id, polygons);

            // set markers once promises are fullfilled.
            lp.then(p => {
                p.forEach(poly => {
                    if (poly.Title != null && poly.Title.length > 0) { this._labels.push({loc: poly.Centroid, title: poly.Title}); }
                    this.AddEventListeners(poly);
                });
                this._streaming ? l.AddEntities(p) : l.SetEntities(p);
                if (this._canvas) { this._canvas.Redraw(!this._streaming); }
            });
        });
    }

}
