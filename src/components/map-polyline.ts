import {
    Directive, Input, Output, OnDestroy, OnChanges, ViewContainerRef,
    EventEmitter, ContentChild, AfterContentInit, SimpleChanges
} from '@angular/core';
import { Subscription } from 'rxjs/subscription';
import { IPoint } from '../interfaces/ipoint';
import { ILatLong } from '../interfaces/ilatlong';
import { IPolylineOptions } from './../interfaces/ipolyline-options';
import { PolylineService } from './../services/polyline.service';
import { InfoBoxComponent } from './infobox';

let polylineId = 0;

/**
 *
 * MapPolylineDirective renders a polyline inside a {@link MapComponent}.
 *
 * ### Example
 * ```typescript
 * import {Component} from '@angular/core';
 * import {MapComponent, MapPolylineDirective} from '...';
 *
 * @Component({
 *  selector: 'my-map,
 *  styles: [`
 *   .map-container { height: 300px; }
 * `],
 * template: `
 *   <x-map [Latitude]="lat" [Longitude]="lng" [Zoom]="zoom">
 *      <x-map-polyline [Paths]="path"></x-map-polyline>
 *   </x-map>
 * `
 * })
 * ```
 *
 *
 * @export
 * @class MapPolylineDirective
 * @implements {OnDestroy}
 * @implements {OnChanges}
 * @implements {AfterContentInit}
 */
@Directive({
    selector: 'x-map-polyline'
})
export class MapPolylineDirective implements OnDestroy, OnChanges, AfterContentInit {

    ///
    /// Field declarations
    ///
    private _inCustomLayer = false;
    private _id: number;
    private _layerId: number;
    private _addedToService = false;
    private _events: Subscription[] = [];

    ///
    /// Any InfoBox that is a direct children of the polyline
    ///
    @ContentChild(InfoBoxComponent) protected _infoBox: InfoBoxComponent;


    /**
     * Gets or sets whether this Polyline handles mouse events.
     *
     * @type {boolean}
     * @memberof MapPolylineDirective
     */
    @Input() public Clickable = true;

    /**
     * If set to true, the user can drag this shape over the map.
     *
     * @type {boolean}
     * @memberof MapPolylineDirective
     */
    @Input() public Draggable = false;

    /**
     * If set to true, the user can edit this shape by dragging the control
     * points shown at the vertices and on each segment.
     *
     * @type {boolean}
     * @memberof MapPolylineDirective
     */
    @Input() public Editable = false;

    /**
     * When true, edges of the polyline are interpreted as geodesic and will
     * follow the curvature of the Earth. When false, edges of the polyline are
     * rendered as straight lines in screen space. Note that the shape of a
     * geodesic polyline may appear to change when dragged, as the dimensions
     * are maintained relative to the surface of the earth. Defaults to false.
     *
     * @type {boolean}
     * @memberof MapPolylineDirective
     */
    @Input() public Geodesic = false;

    /**
     * The ordered sequence of coordinates that designates a polyline.
     * Simple polylines may be defined using a single array of LatLngs. More
     * complex polylines may specify an array of arrays.
     *
     * @type {(Array<ILatLong>}
     * @memberof MapPolylineDirective
     */
    @Input() public Path: Array<ILatLong> | Array<Array<ILatLong>> = [];

    /**
     * The stroke color.
     *
     * @type {string}
     * @memberof MapPolylineDirective
     */
    @Input() public StrokeColor: string;

    /**
     * The stroke opacity between 0.0 and 1.0
     *
     * @type {number}
     * @memberof MapPolylineDirective
     */
    @Input() public StrokeOpacity: number;

    /**
     * The stroke width in pixels.
     *
     * @type {number}
     * @memberof MapPolylineDirective
     */
    @Input() public StrokeWeight: number;

    /**
     * Whether this polyline is visible on the map. Defaults to true.
     *
     * @type {boolean}
     * @memberof MapPolylineDirective
     */
    @Input() public Visible: boolean;

    /**
     * The zIndex compared to other polys.
     *
     * @type {number}
     * @memberof MapPolylineDirective
     */
    @Input() public zIndex: number;

    ///
    /// Delegate definitions
    ///

    /**
     * This event is fired when the DOM click event is fired on the Polyline.
     *
     *   @type {EventEmitter<MouseEvent>}
     * @memberof MapPolylineDirective
     */
    @Output() Click: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

    /**
     * This event is fired when the DOM dblclick event is fired on the Polyline.
     *
     * @type {EventEmitter<MouseEvent>}
     * @memberof MapPolylineDirective
     */
    @Output() DblClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

    /**
     * This event is repeatedly fired while the user drags the polyline.
     *
     * @type {EventEmitter<MouseEvent>}
     * @memberof MapPolylineDirective
     */
    @Output() Drag: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

    /**
     * This event is fired when the user stops dragging the polyline.
     *
     * @type {EventEmitter<MouseEvent>}
     * @memberof MapPolylineDirective
     */
    @Output() DragEnd: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

    /**
     * This event is fired when the user starts dragging the polyline.
     *
     * @type {EventEmitter<MouseEvent>}
     * @memberof MapPolylineDirective
     */
    @Output() DragStart: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

    /**
     * This event is fired when the DOM mousedown event is fired on the Polyline.
     *
     * @type {EventEmitter<MouseEvent>}
     * @memberof MapPolylineDirective
     */
    @Output() MouseDown: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

    /**
     * This event is fired when the DOM mousemove event is fired on the Polyline.
     *
     * @type {EventEmitter<MouseEvent>}
     * @memberof MapPolylineDirective
     */
    @Output() MouseMove: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

    /**
     * This event is fired on Polyline mouseout.
     *
     * @type {EventEmitter<MouseEvent>}
     * @memberof MapPolylineDirective
     */
    @Output() MouseOut: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

    /**
     * This event is fired on Polyline mouseover.
     *
     * @type {EventEmitter<MouseEvent>}
     * @memberof MapPolylineDirective
     */
    @Output() MouseOver: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

    /**
     * This event is fired whe the DOM mouseup event is fired on the Polyline
     *
     * @type {EventEmitter<MouseEvent>}
     * @memberof MapPolylineDirective
     */
    @Output() MouseUp: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

    /**
     * This even is fired when the Polyline is right-clicked on.
     *
     * @type {EventEmitter<MouseEvent>}
     * @memberof MapPolylineDirective
     */
    @Output() RightClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

    ///
    /// Property declarations
    ///

    /**
     * Gets whether the polyline has been registered with the service.
     * @readonly
     * @type {boolean}
     * @memberof MapPolylineDirective
     */
    public get AddedToService(): boolean { return this._addedToService; }

    /**
     * Get the id of the polyline.
     *
     * @readonly
     * @type {number}
     * @memberof MapPolylineDirective
     */
    public get Id(): number { return this._id; }

    /**
     * Gets the id of the polyline as a string.
     *
     * @readonly
     * @type {string}
     * @memberof MapPolylineDirective
     */
    public get IdAsString(): string { return this._id.toString(); }

    /**
     * Gets whether the polyline is in a custom layer. See {@link MapLayer}.
     *
     * @readonly
     * @type {boolean}
     * @memberof MapPolylineDirective
     */
    public get InCustomLayer(): boolean { return this._inCustomLayer; }

    /**
     * gets the id of the Layer the polyline belongs to.
     *
     * @readonly
     * @type {number}
     * @memberof MapPolylineDirective
     */
    public get LayerId(): number { return this._layerId; }

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of MapPolylineDirective.
     * @param {PolylineManager} _polylineManager
     *
     * @memberof MapPolylineDirective
     */
    constructor(private _polylineService: PolylineService, private _containerRef: ViewContainerRef) {
        this._id = polylineId++;
    }

    ///
    /// Public methods
    ///

    /**
     * Called after the content intialization of the directive is complete. Part of the ng Component life cycle.
     *
     * @return {void}
     *
     * @memberof MapPolylineDirective
     */
    ngAfterContentInit(): void {
        if (this._containerRef.element.nativeElement.parentElement) {
            const parentName: string = this._containerRef.element.nativeElement.parentElement.tagName;
            if (parentName.toLowerCase() === 'x-map-layer') {
                this._inCustomLayer = true;
                this._layerId = Number(this._containerRef.element.nativeElement.parentElement.attributes['layerId']);
            }
        }
        if (!this._addedToService) {
            this._polylineService.AddPolyline(this);
            this._addedToService = true;
            this.AddEventListeners();
        }
        return;
    }

    /**
     * Called when changes to the databoud properties occur. Part of the ng Component life cycle.
     *
     * @param {{ [propName: string]: SimpleChange }} changes - Changes that have occured.
     * @return {void}
     *
     * @memberof MapPolylineDirective
     */
    ngOnChanges(changes: SimpleChanges): any {
        if (!this._addedToService) { return; }

        const o: IPolylineOptions = this.GeneratePolylineChangeSet(changes);
        this._polylineService.SetOptions(this, o);

        if (changes['Path'] && !changes['Path'].isFirstChange()) {
            this._polylineService.UpdatePolyline(this);
        }
    }

    /**
     * Called when the polyline is being destroyed. Part of the ng Component life cycle. Release resources.
     *
     *
     * @memberof MapPolylineDirective
     */
    ngOnDestroy() {
        this._polylineService.DeletePolyline(this);
        this._events.forEach((s) => s.unsubscribe());
            ///
            /// remove event subscriptions
            ///
    }

    ///
    /// Private methods
    ///

    /**
     * Wires up the event receivers.
     *
     * @private
     *
     * @memberof MapPolylineDirective
     */
    private AddEventListeners() {
        this._polylineService.CreateEventObservable('click', this).subscribe((ev: MouseEvent) => {
            if (this._infoBox != null) {
                this._infoBox.Open(this._polylineService.GetCoordinatesFromClick(ev));
            }
        });
        const handlers = [
            { name: 'click', handler: (ev: MouseEvent) => this.Click.emit(ev) },
            { name: 'dblclick', handler: (ev: MouseEvent) => this.DblClick.emit(ev) },
            { name: 'drag', handler: (ev: MouseEvent) => this.Drag.emit(ev) },
            { name: 'dragend', handler: (ev: MouseEvent) => this.DragEnd.emit(ev) },
            { name: 'dragstart', handler: (ev: MouseEvent) => this.DragStart.emit(ev) },
            { name: 'mousedown', handler: (ev: MouseEvent) => this.MouseDown.emit(ev) },
            { name: 'mousemove', handler: (ev: MouseEvent) => this.MouseMove.emit(ev) },
            { name: 'mouseout', handler: (ev: MouseEvent) => this.MouseOut.emit(ev) },
            { name: 'mouseover', handler: (ev: MouseEvent) => this.MouseOver.emit(ev) },
            { name: 'mouseup', handler: (ev: MouseEvent) => this.MouseUp.emit(ev) },
            { name: 'rightclick', handler: (ev: MouseEvent) => this.RightClick.emit(ev) },
        ];
        handlers.forEach((obj) => {
            const os = this._polylineService.CreateEventObservable(obj.name, this).subscribe(obj.handler);
            this._events.push(os);
        });
    }


    /**
     * Generates IPolyline option changeset from directive settings.
     *
     * @private
     * @param {SimpleChanges} changes - {@link SimpleChanges} identifying the changes that occured.
     * @returns {IPolylineOptions} - {@link IPolylineOptions} containing the polyline options.
     *
     * @memberof MapPolylineDirective
     */
    private GeneratePolylineChangeSet(changes: SimpleChanges): IPolylineOptions {
        const options: IPolylineOptions = { id: this._id };
        if (changes['Clickable']) { options.clickable = this.Clickable; }
        if (changes['Draggable']) { options.draggable = this.Draggable; }
        if (changes['Editable']) { options.editable = this.Editable; }
        if (changes['Geodesic']) { options.geodesic = this.Geodesic; }
        if (changes['StrokeColor']) { options.strokeColor = this.StrokeColor; }
        if (changes['StrokeOpacity']) { options.strokeOpacity = this.StrokeOpacity; }
        if (changes['StrokeWeight']) { options.strokeWeight = this.StrokeWeight; }
        if (changes['Visible']) { options.visible = this.Visible; }
        if (changes['zIndex']) { options.zIndex = this.zIndex; }
        return options;
    }

}
