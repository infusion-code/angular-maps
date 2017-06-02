import { Component, SimpleChange, OnDestroy, OnChanges, EventEmitter, AfterViewInit,
    ContentChildren, QueryList, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { IInfoWindowOptions } from '../interfaces/iinfowindowoptions';
import { ILatLong } from '../interfaces/ilatlong';
import { InfoBoxService } from '../services/infoboxservice';
import { MapMarkerDirective } from './mapmarker';
import { InfoBoxActionDirective } from './infoboxaction';

let infoBoxId = 0;

///
/// InfoBox renders a info window inside a {@link MapMarker} or standalone.
///
/// ### Example
/// ```typescript
/// import {Component} from '@angular/core';
/// import {Map, MapMarker, InfoBox, InfoBoxAction} from '...';
///
/// @Component({
///  selector: 'my-map-cmp',
///  styles: [`
///    .map-container { height: 300px; }
/// `],
///  template: `
///    <x-map [latitude]='lat' [longitude]='lng' [zoom]='zoom'>
///      <map-marker [latitude]='lat' [longitude]='lng' [label]=''M''>
///        <info-box [disableAutoPan]='true'>
///          Hi, this is the content of the <strong>info window</strong>
///         </info-box>
///       </map-marker>
///     </x-map>
///  `
/// })
/// ```
///
@Component({
    selector: 'x-info-box',
    inputs: ['latitude', 'longitude', 'disableAutoPan', 'title', 'description', 'visible', 'modal', 'xOffset', 'yOffset'],
    template: `
        <div #infoBoxContent class='info-box-content'>
            <ng-content></ng-content>
        </div>`,
    styles: [`
        x-map .MicrosoftMap .Infobox .infobox-title { padding: 10px 10px 5px 10px }
        x-map .MicrosoftMap .Infobox .infobox-info { padding: 3px 10px 10px 10px }
        x-map .MicrosoftMap .Infobox .infobox-actions { height: auto }
    `],
    outputs: ['infoBoxClose'],
    encapsulation: ViewEncapsulation.None
})
// onclick='console.log(window.infoWindow); window.infoWindow.close();return false;'
export class InfoBoxComponent implements OnDestroy, OnChanges, AfterViewInit {
    private static _infoBoxOptionsInputs: string[] = [
        'disableAutoPan', 'maxWidth', 'title', 'description', 'visible', 'xOffset', 'yOffset'
    ];
    private _infoBoxAddedToManager = false;
    private _id: string = (infoBoxId++).toString();
    ///
    /// The latitude position of the info window (only usefull if you use it ouside of a {@link
    /// SebmGoogleMapMarker}).
    ///
    latitude: number;

    ///
    /// The longitude position of the info window (only usefull if you use it ouside of a {@link
    /// SebmGoogleMapMarker}).
    ///
    longitude: number;

    ///
    /// The title to display in the info window
    ///
    title: string;

    ///
    /// The description to display in the info window.
    ///
    description: string;

    ///
    /// Disable auto-pan on open. By default, the info window will pan the map so that it is fully
    /// visible when it opens.
    ///
    disableAutoPan: boolean;

    ///
    /// Maximum width of the infowindow, regardless of content's width. This value is only considered
    /// if it is set before a call to open. To change the maximum width when changing content, call
    /// close, update maxWidth, and then open.
    ///
    maxWidth: number;

    ///
    /// Determine whether only one infobox can be open at a time. Note that ANY info box settings
    ///
    modal = true;

    ///
    /// Holds the marker that is the host of the info window (if available)
    ///
    hostMarker: MapMarkerDirective;

    ///
    /// Determines visibility of infobox
    ///
    visible = false;

    ///
    /// horizontal offset of the infobox from the host marker lat/long or the sepecified coordinates
    ///
    xOffset: number;

    ///
    /// vertical offset for the infobox from the host marker lat/long or the specified coordinates
    ///
    yOffset: number;

    ///
    /// Emits an event when the info window is closed.
    ///
    infoBoxClose: EventEmitter<void> = new EventEmitter<void>();

    ///
    /// Zero or more actions to show on the info window
    ///
    @ContentChildren(InfoBoxActionDirective) infoWindowActions: QueryList<InfoBoxActionDirective>;

    ///
    /// HTML conent of the infobox
    ///
    @ViewChild('infoBoxContent') content: ElementRef;
    public get HtmlContent(): string {
        if (this.content.nativeElement && this.content.nativeElement.innerText && this.content.nativeElement.innerText.trim() !== '') {
            return this.content.nativeElement.outerHTML;
        }
        return '';
    }

    public get Id(): string { return this._id; }

    constructor(private _infoBoxService: InfoBoxService) { }

    public Close(): Promise<void> {
        return this._infoBoxService.Close(this).then(() => {
            this.infoBoxClose.emit(void 0);
        });
    }

    public ngAfterViewInit() {
        this._infoBoxService.AddInfoWindow(this);
        this._infoBoxAddedToManager = true;
    }

    public ngOnDestroy() { this._infoBoxService.DeleteInfoWindow(this); }

    public ngOnChanges(changes: { [key: string]: SimpleChange }) {
        if (!this._infoBoxAddedToManager) { return; }
        if ((changes['latitude'] || changes['longitude']) && typeof this.latitude === 'number' &&
            typeof this.longitude === 'number') {
            this._infoBoxService.SetPosition(this);
        }
        this.SetInfoWindowOptions(changes);
    }

    public Open(loc?: ILatLong): Promise<void> {
        return this._infoBoxService.Open(this, loc);
    }

    public ToString(): string { return 'InfoBox-' + this._id.toString(); }

    private SetInfoWindowOptions(changes: { [key: string]: SimpleChange }) {
        const options: IInfoWindowOptions | any = {};
        Object.keys(changes)
            .filter(k => InfoBoxComponent._infoBoxOptionsInputs.indexOf(k) !== -1)
            .forEach((k) => {
                if (k === 'xOffset' || k === 'yOffset') {
                    if (options.pixelOffset == null) { options.pixelOffset = { x: 0, y: 0 }; }
                    if (k === 'xOffset') { options.pixelOffset.x = changes[k].currentValue; }
                    if (k === 'yOffset') { options.pixelOffset.y = changes[k].currentValue; }
                } else {
                    options[k] = changes[k].currentValue;
                }
            });
        this._infoBoxService.SetOptions(this, options);
    }

}
