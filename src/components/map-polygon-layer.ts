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
import { LayerService } from '../services/layer.service';
import { MapService } from '../services/map.service';
import { Layer } from '../models/layer';
import { Polygon } from '../models/polygon';
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
    private _canvasLayerPromise: Promise<CanvasOverlay>;

    /**
     * Set the maximum zoom at which the polygon labels are visible. Ignored if ShowLabel is false.
     * @type {number}
     * @memberof MapPolygonLayerDirective
     */
    @Input() public LabelMaxZoom: number;

    /**
     * Set the minimum zoom at which the polygon labels are visible. Ignored if ShowLabel is false.
     * @type {number}
     * @memberof MapPolygonLayerDirective
     */
    @Input() public LabelMinZoom: number;

    /**
     * An array of polygon options representing the polygons in the layer.
     *
     * @type {Array<IPolygonOptions>}
     * @memberof MapPolygonLayerDirective
     */
    @Input() public PolygonOptions: Array<IPolygonOptions> = [];

    /**
     * Whether to show the polygon titles as the labels on the polygons.
     *
     * @type {boolean}
     * @memberof MapPolygonLayerDirective
     */
    @Input() public ShowLabel: boolean;

    /**
     * Whether to show the titles of the polygosn as the tooltips on the polygons.
     *
     * @type {boolean}
     * @memberof MapPolygonLayerDirective
     */
    @Input() public ShowTooltip: boolean = true;

    /**
     * Gets or sets An offset applied to the positioning of the layer.
     *
     * @type {IPoint}
     * @memberof MapPolygonLayerDirective
     */
    @Input() public LayerOffset: IPoint = null;

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
            this._canvasLayerPromise = this._mapService.CreateCanvasOverlay(el => this.DrawCanvas(el));
            this._service = this._layerService;

            if (this.PolygonOptions) {
                this._zone.runOutsideAngular(() => this.UpdatePolygons());
            }
        });
    }

    /**
     * Called on component destruction. Frees the resources used by the component. Part of the ng Component life cycle.
     *
     *
     * @memberof MapPolygonLayerDirective
     */
    public ngOnDestroy() {
        this._layerPromise.then(l => {
            l.Delete();
        });
        this._canvasLayerPromise.then(c => {
            c.Delete();
        });
    }

    /**
     * Reacts to changes in data-bound properties of the component and actuates property changes in the underling layer model.
     *
     * @param {{ [propName: string]: SimpleChange }} changes - collection of changes.
     *
     * @memberof MapPolygonLayerDirective
     */
    public ngOnChanges(changes: { [key: string]: SimpleChange }) {
        const o: IPolygonOptions = this.GeneratePolygonChangeSet(changes);
        if (changes['PolygonOptions']) {
            this._zone.runOutsideAngular(() => {
                this.UpdatePolygons();
            });
        }
        if (changes['Visible'] && !changes['Visible'].firstChange) {
            this._zone.runOutsideAngular(() => {
                this._layerPromise.then(l => l.SetVisible(this.Visible));
            });
        }
        if ((changes['ZIndex'] && !changes['ZIndex'].firstChange) ||
            (changes['LayerOffset'] && !changes['LayerOffset'].firstChange)
        ) {
            throw (new Error('You cannot change ZIndex or LayerOffset after the layer has been created.'));
        }
        if (o != null) {
            this._zone.runOutsideAngular(() => {
                const fakeLayerDirective: any = {Id : this._id};
                this._layerPromise.then(l => l.SetOptions(o));
            });
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

    private DrawCanvas(el: HTMLCanvasElement): void {
        // Create a pushpin icon on an off screen canvas.
        const offScreenCanvas = document.createElement('canvas');
        offScreenCanvas.width = 14;
        offScreenCanvas.height = 14;

        // Draw a circle on the off screen canvas.
        const offCtx = offScreenCanvas.getContext('2d');
        offCtx.fillStyle = 'red';
        offCtx.lineWidth = 0;
        offCtx.strokeStyle = 'black';
        offCtx.beginPath();
        offCtx.arc(7, 7, 5, 0, 2 * Math.PI);
        offCtx.closePath();
        offCtx.fill();
        offCtx.stroke();

        const ctx: CanvasRenderingContext2D = el.getContext('2d');
        this._mapService.GetBounds().then(bounds => {
            const locations = MapService.GetRandonLocations(1000, bounds);
            this._mapService.LocationsToPoints(locations).then(locs => {
                const size: ISize = this._mapService.MapSize;
                for (let i = 0, len = locs.length; i < len; i++) {
                    // Don't draw the point if it is not in view. This greatly improves performance when zoomed in.
                    if (locs[i].x >= -7 && locs[i].y >= -7 && locs[i].x <= (size.width + 7) && locs[i].y <= (size.height + 7)) {
                        ctx.drawImage(offScreenCanvas, locs[i].x - 7, locs[i].y - 7, 10, 10);
                    }
                    else {
                        console.log(`out of bounds: i:${i}, x:${locs[i].x}, y:${locs[i].y}`)
                    }
                }
            });
        });
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
            if (this.Visible === false) { this.PolygonOptions.forEach(o => o.visible = false); }

            // generate the promise for the markers
            const lp: Promise<Array<Polygon>> = this._service.CreatePolygons(l.GetOptions().id, this.PolygonOptions);

            // set markers once promises are fullfilled.
            lp.then(p => {
                p.forEach(poly => {
                     this.AddEventListeners(poly);
                });
                l.SetEntities(p);
            });
        });
    }




    /**
     * Generates IPolygon option changeset from directive settings.
     *
     * @private
     * @param {SimpleChanges} changes - {@link SimpleChanges} identifying the changes that occured.
     * @returns {IPolygonOptions} - {@link IPolygonOptions} containing the polygon options.
     *
     * @memberof MapPolygonLayerDirective
     */
    private GeneratePolygonChangeSet(changes: SimpleChanges): IPolygonOptions {
        const options: IPolygonOptions = { id: this._id };
        let hasOptions: boolean = false;
        if (changes['LabelMaxZoom']) { options.labelMaxZoom = this.LabelMaxZoom; hasOptions = true; }
        if (changes['LabelMinZoom']) { options.labelMinZoom = this.LabelMinZoom; hasOptions = true; }
        if (changes['ShowTooltip']) { options.showTooltip = this.ShowTooltip; hasOptions = true; }
        if (changes['ShowLabel']) { options.showLabel = this.ShowLabel; hasOptions = true; }
        return hasOptions ? options : null;
    }

}
