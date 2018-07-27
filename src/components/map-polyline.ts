import {
    Directive, Input, Output, OnDestroy, OnChanges, ViewContainerRef,
    EventEmitter, ContentChild, AfterContentInit, SimpleChanges
} from '@angular/core';
import { Subscription } from 'rxjs';
import { IPoint } from '../interfaces/ipoint';
import { ILatLong } from '../interfaces/ilatlong';
import { IPolylineOptions } from '../interfaces/ipolyline-options';
import { PolylineService } from '../services/polyline.service';
import { IPolylineEvent } from '../interfaces/ipolyline-event';
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
     * @memberof MapPolylineDirective
     */
    @Input() public Clickable = true;

    /**
     * If set to true, the user can drag this shape over the map.
     *
     * @memberof MapPolylineDirective
     */
    @Input() public Draggable = false;

    /**
     * If set to true, the user can edit this shape by dragging the control
     * points shown at the vertices and on each segment.
     *
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
     * @memberof MapPolylineDirective
     */
    @Input() public Geodesic = false;

    /**
     * Arbitary metadata to assign to the Polyline. This is useful for events
     *
     * @memberof MapPolylineDirective
     */
    @Input() public Metadata: Map<string, any> = new Map<string, any>();

    /**
     * The ordered sequence of coordinates that designates a polyline.
     * Simple polylines may be defined using a single array of LatLngs. More
     * complex polylines may specify an array of arrays.
     *
     * @memberof MapPolylineDirective
     */
    @Input() public Path: Array<ILatLong> | Array<Array<ILatLong>> = [];

    /**
     * Whether to show the title of the polyline as the tooltip on the polygon.
     *
     * @memberof MapPolylineDirective
     */
    @Input() public ShowTooltip: boolean = true;

    /**
     * The stroke color.
     *
     * @memberof MapPolylineDirective
     */
    @Input() public StrokeColor: string;

    /**
     * The stroke opacity between 0.0 and 1.0
     *
     * @memberof MapPolylineDirective
     */
    @Input() public StrokeOpacity: number;

    /**
     * The stroke width in pixels.
     *
     * @memberof MapPolylineDirective
     */
    @Input() public StrokeWeight: number;

    /**
     * The title of the polygon.
     *
     * @memberof MapPolylineDirective
     */
    @Input() public Title: string;

    /**
     * Whether this polyline is visible on the map. Defaults to true.
     *
     * @memberof MapPolylineDirective
     */
    @Input() public Visible: boolean;

    /**
     * The zIndex compared to other polys.
     *
     * @memberof MapPolylineDirective
     */
    @Input() public zIndex: number;

    ///
    /// Delegate definitions
    ///

    /**
     * This event is fired when the DOM click event is fired on the Polyline.
     *
     * @memberof MapPolylineDirective
     */
    @Output() Click: EventEmitter<IPolylineEvent> = new EventEmitter<IPolylineEvent>();

    /**
     * This event is fired when the DOM dblclick event is fired on the Polyline.
     *
     * @memberof MapPolylineDirective
     */
    @Output() DblClick: EventEmitter<IPolylineEvent> = new EventEmitter<IPolylineEvent>();

    /**
     * This event is repeatedly fired while the user drags the polyline.
     *
     * @memberof MapPolylineDirective
     */
    @Output() Drag: EventEmitter<IPolylineEvent> = new EventEmitter<IPolylineEvent>();

    /**
     * This event is fired when the user stops dragging the polyline.
     *
     * @memberof MapPolylineDirective
     */
    @Output() DragEnd: EventEmitter<IPolylineEvent> = new EventEmitter<IPolylineEvent>();

    /**
     * This event is fired when the user starts dragging the polyline.
     *
     * @memberof MapPolylineDirective
     */
    @Output() DragStart: EventEmitter<IPolylineEvent> = new EventEmitter<IPolylineEvent>();

    /**
     * This event is fired when the DOM mousedown event is fired on the Polyline.
     *
     * @memberof MapPolylineDirective
     */
    @Output() MouseDown: EventEmitter<IPolylineEvent> = new EventEmitter<IPolylineEvent>();

    /**
     * This event is fired when the DOM mousemove event is fired on the Polyline.
     *
     * @memberof MapPolylineDirective
     */
    @Output() MouseMove: EventEmitter<IPolylineEvent> = new EventEmitter<IPolylineEvent>();

    /**
     * This event is fired on Polyline mouseout.
     *
     * @memberof MapPolylineDirective
     */
    @Output() MouseOut: EventEmitter<IPolylineEvent> = new EventEmitter<IPolylineEvent>();

    /**
     * This event is fired on Polyline mouseover.
     *
     * @memberof MapPolylineDirective
     */
    @Output() MouseOver: EventEmitter<IPolylineEvent> = new EventEmitter<IPolylineEvent>();

    /**
     * This event is fired whe the DOM mouseup event is fired on the Polyline
     *
     * @memberof MapPolylineDirective
     */
    @Output() MouseUp: EventEmitter<IPolylineEvent> = new EventEmitter<IPolylineEvent>();

    /**
     * This even is fired when the Polyline is right-clicked on.
     *
     * @memberof MapPolylineDirective
     */
    @Output() RightClick: EventEmitter<IPolylineEvent> = new EventEmitter<IPolylineEvent>();

    ///
    /// Property declarations
    ///

    /**
     * Gets whether the polyline has been registered with the service.
     * @readonly
     * @memberof MapPolylineDirective
     */
    public get AddedToService(): boolean { return this._addedToService; }

    /**
     * Get the id of the polyline.
     *
     * @readonly
     * @memberof MapPolylineDirective
     */
    public get Id(): number { return this._id; }

    /**
     * Gets the id of the polyline as a string.
     *
     * @readonly
     * @memberof MapPolylineDirective
     */
    public get IdAsString(): string { return this._id.toString(); }

    /**
     * Gets whether the polyline is in a custom layer. See {@link MapLayer}.
     *
     * @readonly
     * @memberof MapPolylineDirective
     */
    public get InCustomLayer(): boolean { return this._inCustomLayer; }

    /**
     * gets the id of the Layer the polyline belongs to.
     *
     * @readonly
     * @memberof MapPolylineDirective
     */
    public get LayerId(): number { return this._layerId; }

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of MapPolylineDirective.
     * @param _polylineManager
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
     * @param changes - Changes that have occured.
     *
     * @memberof MapPolylineDirective
     */
    ngOnChanges(changes: SimpleChanges): any {
        if (!this._addedToService) { return; }

        const o: IPolylineOptions = this.GeneratePolylineChangeSet(changes);
        if (o != null) {
            this._polylineService.SetOptions(this, o);
        }
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
     * @memberof MapPolylineDirective
     */
    private AddEventListeners() {
        const _getEventArg: (e: MouseEvent) => IPolylineEvent = e => {
            return {
                Polyline: this,
                Click: e
            };
        };
        this._polylineService.CreateEventObservable('click', this).subscribe((ev: MouseEvent) => {
            if (this._infoBox != null) {
                this._infoBox.Open(this._polylineService.GetCoordinatesFromClick(ev));
            }
            this.Click.emit(_getEventArg(ev));
        });
        const handlers = [
            { name: 'dblclick', handler: (ev: MouseEvent) => this.DblClick.emit(_getEventArg(ev)) },
            { name: 'drag', handler: (ev: MouseEvent) => this.Drag.emit(_getEventArg(ev)) },
            { name: 'dragend', handler: (ev: MouseEvent) => this.DragEnd.emit(_getEventArg(ev)) },
            { name: 'dragstart', handler: (ev: MouseEvent) => this.DragStart.emit(_getEventArg(ev)) },
            { name: 'mousedown', handler: (ev: MouseEvent) => this.MouseDown.emit(_getEventArg(ev)) },
            { name: 'mousemove', handler: (ev: MouseEvent) => this.MouseMove.emit(_getEventArg(ev)) },
            { name: 'mouseout', handler: (ev: MouseEvent) => this.MouseOut.emit(_getEventArg(ev)) },
            { name: 'mouseover', handler: (ev: MouseEvent) => this.MouseOver.emit(_getEventArg(ev)) },
            { name: 'mouseup', handler: (ev: MouseEvent) => this.MouseUp.emit(_getEventArg(ev)) },
            { name: 'rightclick', handler: (ev: MouseEvent) => this.RightClick.emit(_getEventArg(ev)) },
        ];
        handlers.forEach((obj) => {
            const os = this._polylineService.CreateEventObservable(obj.name, this).subscribe(obj.handler);
            this._events.push(os);
        });
    }


    /**
     * Generates IPolyline option changeset from directive settings.
     *
     * @param changes - {@link SimpleChanges} identifying the changes that occured.
     * @returns - {@link IPolylineOptions} containing the polyline options.
     *
     * @memberof MapPolylineDirective
     */
    private GeneratePolylineChangeSet(changes: SimpleChanges): IPolylineOptions {
        const options: IPolylineOptions = { id: this._id };
        let hasOptions: boolean = false;
        if (changes['Clickable']) { options.clickable = this.Clickable; hasOptions = true; }
        if (changes['Draggable']) { options.draggable = this.Draggable; hasOptions = true; }
        if (changes['Editable']) { options.editable = this.Editable; hasOptions = true; }
        if (changes['Geodesic']) { options.geodesic = this.Geodesic; hasOptions = true; }
        if (changes['ShowTooltip']) { options.showTooltip = this.ShowTooltip; hasOptions = true; }
        if (changes['StrokeColor']) { options.strokeColor = this.StrokeColor; hasOptions = true; }
        if (changes['StrokeOpacity']) { options.strokeOpacity = this.StrokeOpacity; hasOptions = true; }
        if (changes['StrokeWeight']) { options.strokeWeight = this.StrokeWeight; hasOptions = true; }
        if (changes['Title']) { options.title = this.Title; hasOptions = true; }
        if (changes['Visible']) { options.visible = this.Visible; hasOptions = true; }
        if (changes['zIndex']) { options.zIndex = this.zIndex; hasOptions = true; }
        return hasOptions ? options : null;
    }

}
