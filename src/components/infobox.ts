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
import { IInfoWindowOptions } from '../interfaces/iinfo-window-options';
import { ILatLong } from '../interfaces/ilatlong';
import { InfoBoxService } from '../services/infobox.service';
import { MapMarkerDirective } from './map-marker';
import { InfoBoxActionDirective } from './infobox-action';

/**
 * internal counter to use as ids for multiple infoboxes.
 */
let infoBoxId = 0;

/**
 * InfoBox renders a info window inside a {@link MapMarkerDirective} or standalone.
 *
 * ### Example
 * ```typescript
 * import {Component} from '@angular/core';
 * import {MapComponent, MapMarkerDirective, InfoBoxComponent, InfoBoxActionDirective} from '...';
 *
 * @Component({
 *  selector: 'my-map-cmp',
 *  styles: [`
 *    .map-container { height: 300px; }
 * `],
 *  template: `
 *    <x-map [Latitude]="lat" [Longitude]="lng" [Zoom]="zoom">
 *      <x-map-marker [Latitude]="lat" [Longitude]="lng" [Label]="'M'">
 *        <x-info-box [DisableAutoPan]="true">
 *          Hi, this is the content of the <strong>info window</strong>
 *         </x-info-box>
 *       </x-map-marker>
 *     </x-map>
 *  `
 * })
 * ```
 *
 * @export
 */
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
export class InfoBoxComponent implements OnDestroy, OnChanges, AfterViewInit {

    ///
    /// Field declarations
    ///
    private _infoBoxAddedToManager = false;
    private _id: string = (infoBoxId++).toString();

    /**
     * HTML conent of the infobox
     *
     * @memberof InfoBoxComponent
     */
    @ViewChild('infoBoxContent') private _content: ElementRef;

    /**
     * Zero or more actions to show on the info window
     *
     * @memberof InfoBoxComponent
     */
    @ContentChildren(InfoBoxActionDirective) public InfoWindowActions: QueryList<InfoBoxActionDirective>;


    /**
     * The latitude position of the info window (only usefull if you use it ouside of a {@link MapMarker}).
     *
     * @memberof InfoBoxComponent
     */
    @Input() public Latitude: number;

    /**
     * The longitude position of the info window (only usefull if you use it ouside of a {@link MapMarker}).
     *
     * @memberof InfoBoxComponent
     */
    @Input() public Longitude: number;

    /**
     * The title to display in the info window
     *
     * @memberof InfoBoxComponent
     */
    @Input() public Title: string;

    /**
     * The description to display in the info window.
     *
     * @memberof InfoBoxComponent
     */
    @Input() public Description: string;

    /**
     * Disable auto-pan on open. By default, the info window will pan the map so that it is fully
     * visible when it opens.
     *
     * @memberof InfoBoxComponent
     */
    @Input() public DisableAutoPan: boolean;

    /**
     *  Maximum width of the infowindow, regardless of content's width. This value is only considered
     *  if it is set before a call to open. To change the maximum width when changing content, call
     *  close, update maxWidth, and then open.
     *
     * @memberof InfoBoxComponent
     */
    @Input() public MaxWidth: number;

    /**
     * Determine whether only one infobox can be open at a time. Note that ANY info box settings.
     *
     * @memberof InfoBoxComponent
     */
    @Input() public Modal = true;

    /**
     * Holds the marker that is the host of the info window (if available)
     *
     * @memberof InfoBoxComponent
     */
    @Input() public HostMarker: MapMarkerDirective;

    /**
     * Determines visibility of infobox
     *
     * @memberof InfoBoxComponent
     */
    @Input() public Visible = false;

    /**
     * Horizontal offset of the infobox from the host marker lat/long or the sepecified coordinates.
     *
     * @memberof InfoBoxComponent
     */
    @Input() public xOffset: number;

    /**
     * Vertical offset for the infobox from the host marker lat/long or the specified coordinates.
     *
     * @memberof InfoBoxComponent
     */
    @Input() public yOffset: number;

    /**
     * Determines if other info boxes should be closed before opening this one
     *
     * @memberof InfoBoxComponent
     */
    @Input() public CloseInfoBoxesOnOpen = true;

    ///
    /// Delegate defintions
    ///

    /**
     * Emits an event when the info window is closed.
     *
     * @memberof InfoBoxComponent
     */
    @Output() public InfoBoxClose: EventEmitter<string> = new EventEmitter<string>();

    ///
    /// Property declarations.
    ///

    /**
     * Gets the HTML content of the info box.
     *
     * @readonly
     * @memberof InfoBoxComponent
     */
    public get HtmlContent(): string {
        if (this._content.nativeElement && this._content.nativeElement.innerText && this._content.nativeElement.innerText.trim() !== '') {
            return this._content.nativeElement.outerHTML;
        }
        return '';
    }

    /**
     * Gets the Id of the info box as a string.
     *
     * @readonly
     * @memberof InfoBoxComponent
     */
    public get Id(): string { return this._id; }

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of InfoBoxComponent.
     * @param _infoBoxService - Concrete {@link InfoBoxService} implementation for underlying Map architecture.
     *
     * @memberof InfoBoxComponent
     */
    constructor(private _infoBoxService: InfoBoxService) { }

    ///
    /// Public methods
    ///

    /**
     * Closes the Infobox.
     *
     * @memberof InfoBoxComponent
     */
    public Close(): Promise<void> {
        return this._infoBoxService.Close(this).then(() => {
            this.InfoBoxClose.emit(this._id);
        });
    }

    /**
     * Called on after component view as been initialized. Part of the ng Component life cycle.
     *
     * @memberof Map
     */
    public ngAfterViewInit() {
        this._infoBoxService.AddInfoWindow(this);
        this._infoBoxAddedToManager = true;
        this.HandleEvents();
    }

    /**
     * Called when changes to the databoud properties occur. Part of the ng Component life cycle.
     *
     * @param changes - Changes that have occured.
     *
     * @memberof Map
     */
    public ngOnChanges(changes: { [key: string]: SimpleChange }) {
        if (!this._infoBoxAddedToManager) { return; }
        if ((changes['latitude'] || changes['longitude']) && typeof this.Latitude === 'number' &&
            typeof this.Longitude === 'number') {
            this._infoBoxService.SetPosition(this, {
                latitude: changes['latitude'].currentValue,
                longitude: changes['longitude'].currentValue
            });
        }
        this.SetInfoWindowOptions(changes);
    }

    /**
     * Called on component destruction. Frees the resources used by the component. Part of the ng Component life cycle.
     *
     * @memberof Map
     */
    public ngOnDestroy() { this._infoBoxService.DeleteInfoWindow(this); }

    /**
     * Opens a closed info window.
     *
     * @param [loc]  - {@link ILatLong } representing position on which to open the window.
     * @returns - Promise that is fullfilled when the infobox has been opened.
     *
     * @memberof InfoBoxComponent
     */
    public Open(loc?: ILatLong): Promise<void> {
        return this._infoBoxService.Open(this, loc);
    }

    /**
     * Returns a string representation of the info box.
     *
     * @returns - string representation of the info box.
     *
     * @memberof InfoBoxComponent
     */
    public ToString(): string { return 'InfoBoxComponent-' + this._id; }

    ///
    /// Private methods
    ///

    /**
     * Delegate handling the map click events.
     *
     * @memberof MapComponent
     */
    private HandleEvents(): void {
        this._infoBoxService.CreateEventObservable('infowindowclose', this).subscribe(e => {
            this.InfoBoxClose.emit(this._id);
        });
    }

    /**
     * Sets the info window options
     *
     * @param changes
     *
     * @memberof InfoBoxComponent
     */
    private SetInfoWindowOptions(changes: { [key: string]: SimpleChange }) {
        const options: IInfoWindowOptions = {};
        if (changes['title']) { options.title = this.Title; }
        if (changes['description']) { options.description = this.Description; }
        if (changes['disableAutoPan']) { options.disableAutoPan = this.DisableAutoPan; }
        if (changes['visible']) { options.visible = this.Visible; }
        if (changes['xOffset'] || changes['yOffset']) {
            if (options.pixelOffset == null) { options.pixelOffset = { x: 0, y: 0 }; }
            options.pixelOffset.x = this.xOffset;
            options.pixelOffset.y = this.yOffset;
        }
        this._infoBoxService.SetOptions(this, options);
    }
}
