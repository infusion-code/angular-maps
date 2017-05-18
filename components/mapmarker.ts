import { Directive, SimpleChange, OnDestroy, OnChanges, EventEmitter, ContentChild, AfterContentInit, AfterViewInit } from '@angular/core';
import { IPoint } from "../interfaces/ipoint";
import { ILatLong } from "../interfaces/ilatlong";
import { IMarkerEvent } from "../interfaces/imarkerevent";
import { IMarkerIconInfo } from "../interfaces/imarkericoninfo";
import { MarkerService } from '../services/markerservice';
import { InfoBox } from './infobox';

let markerId:number = 0;

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
    selector: 'map-marker',
    inputs: ['latitude', 'longitude', 'title', 'label', 'draggable: markerDraggable', 'iconUrl', 'width', 'height', 'anchor', 'iconInfo'],
    outputs: ['MarkerClick', 'DragEnd','DynamicMarkerCreated']
})
export class MapMarker implements OnDestroy, OnChanges, AfterContentInit, AfterViewInit {

    ///
    /// Icon anchor relative to marker root 
    ///
    anchor: IPoint;

    ///
    /// The latitude position of the marker.
    ///
    latitude: number;

    ///
    /// The longitude position of the marker.
    ///
    longitude: number;

    ///
    /// The title of the marker.
    ///
    title: string;

    ///
    /// The label (a single uppercase character) for the marker.
    ///
    label: string;

    ///
    /// If true, the marker can be dragged. Default value is false.
    ///
    draggable: boolean = false;

    ///
    /// Icon (the URL of the image) for the foreground.
    ///
    iconUrl: string;

    ///
    /// Information for dynamic, custom created icons.
    ///
    iconInfo: IMarkerIconInfo;

    /// 
    /// Icon height
    ///
    height: number;

    ///
    /// Icon Widht
    ///
    width: number;

    ///
    /// This event emitter gets emitted when the user clicks on the marker.
    ///
    DynamicMarkerCreated: EventEmitter<IMarkerIconInfo> = new EventEmitter<IMarkerIconInfo>();

    ///
    /// This event emitter gets emitted when the user clicks on the marker.
    ///
    MarkerClick: EventEmitter<IMarkerEvent> = new EventEmitter<IMarkerEvent>();

    ///
    /// This event is fired when the user stops dragging the marker.
    ///
    DragEnd: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

    ///
    /// Any InfoBox that is a direct children of the marker 
    /// 
    @ContentChild(InfoBox) private _infoBox: InfoBox;
    private _inCustomLayer: boolean = false;
    private _inClusterLayer: boolean = false;
    private _markerAddedToManger: boolean = false;
    private _id: string;
    private _layerId: number;

    public get Id(): string { return this._id; }

    public get InClusterLayer(): boolean { return this._inClusterLayer; }
    public set InClusterLayer(val: boolean) { this._inClusterLayer = val; }

    public get InCustomLayer(): boolean { return this._inCustomLayer; }
    public set InCustomLayer(val: boolean) { this._inCustomLayer = val; }

    public get LayerId(): number { return this._layerId; }
    public set LayerId(val: number) { this._layerId = val; }

    constructor(private _markerService: MarkerService) {
        this._id = (markerId++).toString();
    }

    public LocationToPixel(): Promise<IPoint> {
        return this._markerService.LocationToPoint(this);
    } 

    public ngOnDestroy() { this._markerService.DeleteMarker(this); }

    public ngAfterContentInit() {
        if (this._infoBox != null) {
            this._infoBox.hostMarker = this;
        }
    }

    public ngAfterViewInit() {
        if (!this._markerAddedToManger) {
            this._markerService.AddMarker(this);
            this._markerAddedToManger = true;
            this.AddEventListeners();
        }
    }

    public ngOnChanges(changes: { [key: string]: SimpleChange }) {
        if (typeof this.latitude !== 'number' || typeof this.longitude !== 'number') {
            return;
        }
        if (!this._markerAddedToManger) return;
        if (changes['latitude'] || changes['longitude']) {
            this._markerService.UpdateMarkerPosition(this);
        }
        if (changes['title']) {
            this._markerService.UpdateTitle(this);
        }
        if (changes['label']) {
            this._markerService.UpdateLabel(this);
        }
        if (changes['draggable']) {
            this._markerService.UpdateDraggable(this);
        }
        if (changes['iconUrl'] || changes['iconInfo']) {
            this._markerService.UpdateIcon(this);
        }
        if (changes['anchor']) {
            this._markerService.UpdateAnchor(this);
        }
    }

    public toString(): string { return 'MapMarker-' + this._id.toString(); }

    private AddEventListeners(): void {
        this._markerService.CreateEventObservable('click', this).subscribe((e: MouseEvent) => {
            let t: MapMarker = this;
            if (this._infoBox != null) {
                this._infoBox.Open();
            }
            this.MarkerClick.emit({ Marker: this, Click: e});
        });
        this._markerService.CreateEventObservable<MouseEvent>('dragend', this)
            .subscribe((e: MouseEvent) => {
                this.DragEnd.emit(e);
            });
    }



}