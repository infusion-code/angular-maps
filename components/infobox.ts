import {
    AfterViewInit,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    QueryList,
    SimpleChange,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
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
/// import { Component, Input, Output } from '@angular/core';
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
    template: `
        <div #infoBoxContent class='info-box-content'>
            <ng-content></ng-content>
        </div>`,
    styles: [`
        x-map .MicrosoftMap .Infobox .infobox-title { padding: 10px 10px 5px 10px }
        x-map .MicrosoftMap .Infobox .infobox-info { padding: 3px 10px 10px 10px }
        x-map .MicrosoftMap .Infobox .infobox-actions { height: auto }
    `],
    encapsulation: ViewEncapsulation.None
})
// onclick='console.log(window.infoWindow); window.infoWindow.close();return false;'
export class InfoBoxComponent implements OnDestroy, OnChanges, AfterViewInit {
    private _infoBoxAddedToManager = false;
    private _id: string = (infoBoxId++).toString();
    ///
    /// The latitude position of the info window (only usefull if you use it ouside of a {@link
    /// SebmGoogleMapMarker}).
    ///
    @Input()
    latitude: number;

    ///
    /// The longitude position of the info window (only usefull if you use it ouside of a {@link
    /// SebmGoogleMapMarker}).
    ///
    @Input()
    longitude: number;

    ///
    /// The title to display in the info window
    ///
    @Input()
    title: string;

    ///
    /// The description to display in the info window.
    ///
    @Input()
    description: string;

    ///
    /// Disable auto-pan on open. By default, the info window will pan the map so that it is fully
    /// visible when it opens.
    ///
    @Input()
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
    @Input()
    modal = true;

    ///
    /// Holds the marker that is the host of the info window (if available)
    ///
    hostMarker: MapMarkerDirective;

    ///
    /// Determines visibility of infobox
    ///
    @Input()
    visible = false;

    ///
    /// horizontal offset of the infobox from the host marker lat/long or the sepecified coordinates
    ///
    @Input()
    xOffset: number;

    ///
    /// vertical offset for the infobox from the host marker lat/long or the specified coordinates
    ///
    @Input()
    yOffset: number;

    ///
    /// Emits an event when the info window is closed.
    ///
    @Output()
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

    /**
     * The Id
     *
     * @readonly
     * @type {string}
     * @memberof InfoBoxComponent
     */
    public get Id(): string { return this._id; }

    ///
    /// Constructors
    ///

    /**
     * Creates an instance of InfoBoxComponent.
     * @param {InfoBoxService} _infoBoxService
     *
     * @memberof InfoBoxComponent
     */
    constructor(private _infoBoxService: InfoBoxService) { }

    ///
    /// Public methods
    ///

    /**
     * Infobox close method
     *
     * @returns {Promise<void>}
     *
     * @memberof InfoBoxComponent
     */
    public Close(): Promise<void> {
        return this._infoBoxService.Close(this).then(() => {
            this.infoBoxClose.emit(void 0);
        });
    }

    /**
     *
     * Called after the content intialization of the directive is complete. Part of the ng Component life cycle.
     *
     * @memberof InfoBoxComponent
     */
    public ngAfterViewInit() {
        this._infoBoxService.AddInfoWindow(this);
        this._infoBoxAddedToManager = true;
    }

    /**
     * Called when the poygon is being destroyed. Part of the ng Component life cycle. Release resources.
     *
     *
     * @memberof MapPolygonDirective
     */
    public ngOnDestroy() { this._infoBoxService.DeleteInfoWindow(this); }

    /**
     * Called when changes to the databoud properties occur. Part of the ng Component life cycle.
     *
     * @param {{ [propName: string]: SimpleChange }} changes - Changes that have occured.
     * @return {void}
     *
     * @memberof InfoBoxComponent
     */
    public ngOnChanges(changes: { [key: string]: SimpleChange }) {
        if (!this._infoBoxAddedToManager) { return; }
        if ((changes['latitude'] || changes['longitude']) && typeof this.latitude === 'number' &&
            typeof this.longitude === 'number') {
            this._infoBoxService.SetPosition(this, {
                latitude: changes['latitude'].currentValue,
                longitude: changes['longitude'].currentValue
            });
        }
        this.SetInfoWindowOptions(changes);
    }

    /**
     * Opens the info window
     *
     * @param {ILatLong} [loc]
     * @returns {Promise<void>}
     *
     * @memberof InfoBoxComponent
     */
    public Open(loc?: ILatLong): Promise<void> {
        return this._infoBoxService.Open(this, loc);
    }

    /**
     * ToString implementation that returns the infobox id
     *
     * @returns {string}
     *
     * @memberof InfoBoxComponent
     */
    public ToString(): string { return 'InfoBox-' + this._id.toString(); }

    /**
     * Sets the info window options
     *
     * @private
     * @param {{ [key: string]: SimpleChange }} changes
     *
     * @memberof InfoBoxComponent
     */
    private SetInfoWindowOptions(changes: { [key: string]: SimpleChange }) {
        const options: IInfoWindowOptions = {};
        if (changes['title']) { options.title = this.title; }
        if (changes['description']) { options.description = this.description; }
        if (changes['disableAutoPan']) { options.disableAutoPan = this.disableAutoPan; }
        if (changes['visible']) { options.visible = this.visible; }
        if (changes['xOffset'] || changes['yOffset']) {
            if (options.pixelOffset == null) { options.pixelOffset = { x: 0, y: 0 }; }
            options.pixelOffset.x = this.xOffset;
            options.pixelOffset.y = this.yOffset;
        }
        this._infoBoxService.SetOptions(this, options);
    }

}
