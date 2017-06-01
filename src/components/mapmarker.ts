import { Directive, SimpleChange, Input, Output, OnDestroy, OnChanges, EventEmitter, ContentChild, AfterContentInit, ViewContainerRef } from '@angular/core';
import { IPoint } from "../interfaces/ipoint";
import { ILatLong } from "../interfaces/ilatlong";
import { IMarkerEvent } from "../interfaces/imarkerevent";
import { IMarkerIconInfo } from "../interfaces/imarkericoninfo";
import { MarkerService } from '../services/markerservice';
import { InfoBox } from './infobox';

/**
 * internal counter to use as ids for marker. 
 */
let markerId:number = 0;

/**
 * MapMarker renders a map marker inside a {@link Map}.
 *
 * ### Example
 * ```typescript
 * import {Component} from '@angular/core';
 * import {Map, MapMarker} from '...';
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
 *      <map-marker [Latitude]="lat" [Longitude]="lng" [Label]="'M'"></map-marker>
 *   </x-map>
 * `
 * })
 * ```
 * 
 * @export
 * @class MapMarker
 * @implements {OnDestroy}
 * @implements {OnChanges}
 * @implements {AfterContentInit}
 */
@Directive({
    selector: 'map-marker'
})
export class MapMarker implements OnDestroy, OnChanges, AfterContentInit {

    ///
    /// Field declarations
    ///
    private _inCustomLayer: boolean = false;
    private _inClusterLayer: boolean = false;
    private _markerAddedToManger: boolean = false;
    private _id: string;
    private _layerId: number;

    /**
     * Any InfoBox that is a direct children of the marker 
     * 
     * @protected
     * @type {InfoBox}
     * @memberof MapMarker
     */
    @ContentChild(InfoBox) protected _infoBox: InfoBox;

    /**
     *  Icon anchor relative to marker root 
     * 
     * @type {IPoint}
     * @memberof MapMarker
     */
    @Input() public Anchor: IPoint;

    /**
     * If true, the marker can be dragged. Default value is false.
     * 
     * @type {boolean}
     * @memberof MapMarker
     */
    @Input() public Draggable: boolean = false;
    
    /**
     * Icon height
     * 
     * @type {number}
     * @memberof MapMarker
     */
    @Input() public Height: number;

    /**
     * Information for dynamic, custom created icons.
     * 
     * @type {IMarkerIconInfo}
     * @memberof MapMarker
     */
    @Input() public IconInfo: IMarkerIconInfo;

    /**
     * Icon (the URL of the image) for the foreground.
     * 
     * @type {string}
     * @memberof MapMarker
     */
    @Input() public IconUrl: string;

    /**
     * The label (a single uppercase character) for the marker.
     * 
     * @type {string}
     * @memberof MapMarker
     */
    @Input() public Label: string;

    /**
     * The latitude position of the marker.
     * 
     * @type {number}
     * @memberof MapMarker
     */
    @Input() public Latitude: number;

    /**
     * The longitude position of the marker.
     * 
     * @type {number}
     * @memberof MapMarker
     */
    @Input() public Longitude: number;

    /**
     * Arbitary metadata to assign to the Marker. This is useful for events
     * 
     * @type {Map<string, any>}
     * @memberof MapMarker
     */
    @Input() public Metadata: Map<string, any> = new Map<string, any>();

    /**
     *  The title of the marker.
     * 
     * @type {string}
     * @memberof MapMarker
     */
    @Input() public Title: string;

    /**
     * Icon Width
     * 
     * @type {number}
     * @memberof MapMarker
     */
    @Input() public Width: number;

    ///
    /// Delegates
    ///

    /**
     * This event emitter gets emitted when the user clicks on the marker.
     * 
     * @type {EventEmitter<IMarkerIconInfo>}
     * @memberof MapMarker
     */
    @Output() public DynamicMarkerCreated: EventEmitter<IMarkerIconInfo> = new EventEmitter<IMarkerIconInfo>();

    /**
     * This event emitter gets emitted when the user clicks on the marker.
     * 
     * @type {EventEmitter<IMarkerEvent>}
     * @memberof MapMarker
     */
    @Output() public MarkerClick: EventEmitter<IMarkerEvent> = new EventEmitter<IMarkerEvent>();

    /**
     * This event is fired when the user stops dragging the marker.
     * 
     * @type {EventEmitter<MouseEvent>}
     * @memberof MapMarker
     */
    @Output() public  DragEnd: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();


    ///
    /// Property declarations
    ///

    /**
     * Getswhether the marker has already been added to the marker service and is ready for use.
     * 
     * @readonly
     * @type {boolean}
     * @memberof MapMarker
     */
    public get AddedToManager():boolean { return this._markerAddedToManger; }

    /**
     * Gets the id of the marker as a string.
     * 
     * @readonly
     * @type {string}
     * @memberof MapMarker
     */
    public get Id(): string { return this._id; }

    /**
     * Gets whether the marker is in a cluster layer. See {@link ClusterLayer}.
     * 
     * @readonly
     * @type {boolean}
     * @memberof MapMarker
     */
    public get InClusterLayer(): boolean { return this._inClusterLayer; }

    /**
     * Gets whether the marker is in a custom layer. See {@link MapLayer}.
     * 
     * @readonly
     * @type {boolean}
     * @memberof MapMarker
     */
    public get InCustomLayer(): boolean { return this._inCustomLayer; }
    
    /**
     * gets the id of the Layer the marker belongs to.
     * 
     * @readonly
     * @type {number}
     * @memberof MapMarker
     */
    public get LayerId(): number { return this._layerId; }

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of MapMarker.
     * @param {MarkerService} _markerService - Concreate implementation of a {@link MarkerService}. Expects a {@link BingMarkerService} instance.
     * @param {ViewContainerRef} _containerRef - View container hosting the marker. Used to determine parent layer through markup.
     * 
     * @memberof MapMarker
     */
    constructor(private _markerService: MarkerService, private _containerRef: ViewContainerRef) {
        this._id = (markerId++).toString();
    }

    ///
    /// Public methods
    ///

    /**
     * Translates a marker geo location to a pixel location relative to the map viewport. 
     * 
     * @param {ILatLong} [loc] - {@link ILatLong} containing the geo coordinates. If null, the marker's coordinates are used. 
     * @returns {Promise<IPoint>} - A promise that when fullfilled contains an {@link IPoint} representing the pixel coordinates. 
     * 
     * @memberof MapMarker
     */
    public LocationToPixel(loc?: ILatLong): Promise<IPoint> {
        return this._markerService.LocationToPoint(loc ? loc: this);
    } 

    /**
     * Called after Component content initialization. Part of ng Component life cycle.
     * @returns {void}
     * 
     * @memberof MapLayer
     */
    public ngAfterContentInit() {
        if (this._infoBox != null)  this._infoBox.hostMarker = this;
        if (this._containerRef.element.nativeElement.parentElement){
            let parentName:string =this._containerRef.element.nativeElement.parentElement.tagName;
            if (parentName.toLowerCase() == "cluster-layer") { this._inClusterLayer = true; }
            else if (parentName.toLowerCase() == "map-layer") { this._inCustomLayer = true; }
            this._layerId = Number(this._containerRef.element.nativeElement.parentElement.attributes["layerId"]);
        }
        if (!this._markerAddedToManger) {
            this._markerService.AddMarker(this);
            this._markerAddedToManger = true;
            this.AddEventListeners();
        }
    }

    /**
     * Called on component destruction. Frees the resources used by the component. Part of the ng Component life cycle. 
     * 
     * 
     * @memberof MapLayer
     */
    public ngOnDestroy() { this._markerService.DeleteMarker(this); }

    /**
     * Reacts to changes in data-bound properties of the component and actuates property changes in the underling layer model. 
     * 
     * @param {{ [propName: string]: SimpleChange }} changes - collection of changes. 
     * 
     * @memberof MapMarker
     */
    public ngOnChanges(changes: { [key: string]: SimpleChange }) {
        if (typeof this.Latitude !== 'number' || typeof this.Longitude !== 'number') {
            return;
        }
        if (!this._markerAddedToManger) return;
        if (changes['Latitude'] || changes['Longitude']) {
            this._markerService.UpdateMarkerPosition(this);
        }
        if (changes['Title']) {
            this._markerService.UpdateTitle(this);
        }
        if (changes['Label']) {
            this._markerService.UpdateLabel(this);
        }
        if (changes['Draggable']) {
            this._markerService.UpdateDraggable(this);
        }
        if (changes['IconUrl'] || changes['IconInfo']) {
            this._markerService.UpdateIcon(this);
        }
        if (changes['Anchor']) {
            this._markerService.UpdateAnchor(this);
        }
    }

    public toString(): string { return 'MapMarker-' + this._id.toString(); }

    ///
    /// Private methods
    ///

    /**
     * Adds various event listeners for the marker.
     * 
     * @private
     * 
     * @memberof MapMarker
     */
    private AddEventListeners(): void {
        this._markerService.CreateEventObservable('click', this).subscribe((e: MouseEvent) => {
            let t: MapMarker = this;
            if (this._infoBox != null) {
                this._infoBox.Open(this._markerService.GetCoordinatesFromClick(e));
            }
            this.MarkerClick.emit({ 
                Marker: this, 
                Click: e, 
                Location: this._markerService.GetCoordinatesFromClick(e),
                Pixels: this._markerService.GetPixelsFromClick(e),
            });
        });
        this._markerService.CreateEventObservable<MouseEvent>('dragend', this)
            .subscribe((e: MouseEvent) => {
                this.DragEnd.emit(e);
            });
    }



}