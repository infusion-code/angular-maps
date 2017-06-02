import { Directive, SimpleChange, Input, Output, OnDestroy, OnChanges,
    EventEmitter, ContentChild, AfterContentInit, ViewContainerRef } from '@angular/core';
// import { IPoint } from '../interfaces/ipoint';
// import { ILatLong } from '../interfaces/ilatlong';
// import { IMarkerEvent } from '../interfaces/imarkerevent';
// import { IMarkerIconInfo } from '../interfaces/imarkericoninfo';
// import { MarkerService } from '../services/markerservice';
// import { InfoBox } from './infobox';

// let markerId = 0;

///
/// MapMarker renders a map marker inside a {@link Map}.
///
/// ### Example
/// ```typescript
/// import {Component} from '@angular/core';
/// import {Map, MapMarker} from '...';
///
/// @Component({
///  selector: 'my-map-cmp',
///  styles: [`
///   .map-container {
///     height: 300px;
///   }
/// `],
/// template: `
///   <x-map [latitude]="lat" [longitude]="lng" [zoom]="zoom">
///      <map-marker [latitude]="lat" [longitude]="lng" [label]="'M'"></map-marker>
///   </x-map>
/// `
/// })
/// ```
///
@Directive({
    selector: '[mapPolygon]'
})
export class PolygonDirective implements OnDestroy, OnChanges, AfterContentInit {
    // private _inCustomLayer = false;
    // private _inClusterLayer = false;
    // private _markerAddedToManger = false;
    // private _id: string;
    // private _layerId: number;

    // public get AddedToManager(): boolean { return this._markerAddedToManger; }
    // public get Id(): string { return this._id; }
    // public get InClusterLayer(): boolean { return this._inClusterLayer; }
    // public get InCustomLayer(): boolean { return this._inCustomLayer; }
    // public get LayerId(): number { return this._layerId; }

    // ///
    // /// Any InfoBox that is a direct children of the marker
    // ///
    // @ContentChild(InfoBox) protected _infoBox: InfoBox;

    // ///
    // /// Icon anchor relative to marker root
    // ///
    // @Input() public Anchor: IPoint;

    // ///
    // /// If true, the marker can be dragged. Default value is false.
    // ///
    // @Input() public Draggable: boolean = false;

    // ///
    // /// Icon height
    // ///
    // @Input() public Height: number;

    // ///
    // /// Information for dynamic, custom created icons.
    // ///
    // @Input() public IconInfo: IMarkerIconInfo;

    // ///
    // /// Icon (the URL of the image) for the foreground.
    // ///
    // @Input() public IconUrl: string;

    // ///
    // /// The label (a single uppercase character) for the marker.
    // ///
    // @Input() public Label: string;

    // ///
    // /// The latitude position of the marker.
    // ///
    // @Input() public Latitude: number;

    // ///
    // /// The longitude position of the marker.
    // ///
    // @Input() public Longitude: number;

    // ///
    // /// Arbitary metadata to assign to the Marker. This is useful for events
    // ///
    // @Input() public Metadata: Map<string, any> = new Map<string, any>();

    // ///
    // /// The title of the marker.
    // ///
    // @Input() public Title: string;

    // ///
    // /// Icon Widht
    // ///
    // @Input() public Width: number;

    // ///
    // /// This event emitter gets emitted when the user clicks on the marker.
    // ///
    // @Output() public DynamicMarkerCreated: EventEmitter<IMarkerIconInfo> = new EventEmitter<IMarkerIconInfo>();

    // ///
    // /// This event emitter gets emitted when the user clicks on the marker.
    // ///
    // @Output() public MarkerClick: EventEmitter<IMarkerEvent> = new EventEmitter<IMarkerEvent>();

    // ///
    // /// This event is fired when the user stops dragging the marker.
    // ///
    // @Output() public  DragEnd: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

    // constructor(private _markerService: MarkerService, private _containerRef: ViewContainerRef) {
    //     this._id = (markerId++).toString();
    // }

    // public LocationToPixel(loc?: ILatLong): Promise<IPoint> {
    //     return this._markerService.LocationToPoint(loc ? loc: this);
    // }

    // public ngAfterContentInit() {
    //     if (this._infoBox != null)  this._infoBox.hostMarker = this;
    //     if (this._containerRef.element.nativeElement.parentElement){
    //         let parentName:string =this._containerRef.element.nativeElement.parentElement.tagName;
    //         if (parentName.toLowerCase() == "cluster-layer") { this._inClusterLayer = true; }
    //         else if (parentName.toLowerCase() == "map-layer") { this._inCustomLayer = true; }
    //         this._layerId = Number(this._containerRef.element.nativeElement.parentElement.attributes["layerId"]);
    //     }
    //     if (!this._markerAddedToManger) {
    //         this._markerService.AddMarker(this);
    //         this._markerAddedToManger = true;
    //         this.AddEventListeners();
    //     }
    // }

    // public ngOnDestroy() { this._markerService.DeleteMarker(this); }

    // public ngOnChanges(changes: { [key: string]: SimpleChange }) {
    //     if (typeof this.Latitude !== 'number' || typeof this.Longitude !== 'number') {
    //         return;
    //     }
    //     if (!this._markerAddedToManger) return;
    //     if (changes['Latitude'] || changes['Longitude']) {
    //         this._markerService.UpdateMarkerPosition(this);
    //     }
    //     if (changes['Title']) {
    //         this._markerService.UpdateTitle(this);
    //     }
    //     if (changes['Label']) {
    //         this._markerService.UpdateLabel(this);
    //     }
    //     if (changes['Draggable']) {
    //         this._markerService.UpdateDraggable(this);
    //     }
    //     if (changes['IconUrl'] || changes['IconInfo']) {
    //         this._markerService.UpdateIcon(this);
    //     }
    //     if (changes['Anchor']) {
    //         this._markerService.UpdateAnchor(this);
    //     }
    // }

    // public toString(): string { return 'MapMarker-' + this._id.toString(); }

    // private AddEventListeners(): void {
    //     this._markerService.CreateEventObservable('click', this).subscribe((e: MouseEvent) => {
    //         const t: MapMarker = this;
    //         if (this._infoBox != null) {
    //             this._infoBox.Open(this._markerService.GetCoordinatesFromClick(e));
    //         }
    //         this.MarkerClick.emit({
    //             Marker: this,
    //             Click: e,
    //             Location: this._markerService.GetCoordinatesFromClick(e),
    //             Pixels: this._markerService.GetPixelsFromClick(e),
    //         });
    //     });
    //     this._markerService.CreateEventObservable<MouseEvent>('dragend', this)
    //         .subscribe((e: MouseEvent) => {
    //             this.DragEnd.emit(e);
    //         });
    // }



}
