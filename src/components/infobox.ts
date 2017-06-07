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

/**
 * internal counter to use as ids for multiple infoboxes.
 */
let infoBoxId = 0;

/**
 * InfoBox renders a info window inside a {@link MapMarker} or standalone.
 *
 * ### Example
 * ```typescript
 * import {Component} from '@angular/core';
 * import {Map, MapMarker, InfoBox, InfoBoxAction} from '...';
 *
 * @Component({
 *  selector: 'my-map-cmp',
 *  styles: [`
 *    .map-container { height: 300px; }
 * `],
 *  template: `
 *    <x-map [Latitude]="lat" [Longitude]="lng" [Zoom]="zoom">
 *      <map-marker [Latitude]="lat" [Longitude]="lng" [Label]="'M'">
 *        <info-box [DisableAutoPan]="true">
 *          Hi, this is the content of the <strong>info window</strong>
 *         </info-box>
 *       </map-marker>
 *     </x-map>
 *  `
 * })
 * ```
 *
 * @export
 * @class InfoBox
 * @implements {OnDestroy}
 * @implements {OnChanges}
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
     * @private
     * @type {ElementRef}
     * @memberof InfoBox
     */
    @ViewChild('infoBoxContent') private _content: ElementRef;

    /**
     * Zero or more actions to show on the info window
     *
     * @private
     * @type {QueryList<InfoBoxAction>}
     * @memberof InfoBox
     */
    @ContentChildren(InfoBoxActionDirective) public InfoWindowActions: QueryList<InfoBoxActionDirective>;


    /**
     * The latitude position of the info window (only usefull if you use it ouside of a {@link MapMarker}).
     *
     * @type {number}
     * @memberof InfoBox
     */
    @Input() public Latitude: number;

    /**
     * The longitude position of the info window (only usefull if you use it ouside of a {@link MapMarker}).
     *
     * @type {number}
     * @memberof InfoBox
     */
    @Input() public Longitude: number;

    /**
     * The title to display in the info window
     *
     * @type {string}
     * @memberof InfoBox
     */
    @Input() public Title: string;

    /**
     * The description to display in the info window.
     *
     * @type {string}
     * @memberof InfoBox
     */
    @Input() public Description: string;

    /**
     * Disable auto-pan on open. By default, the info window will pan the map so that it is fully
     * visible when it opens.
     *
     * @type {boolean}
     * @memberof InfoBox
     */
    @Input() public DisableAutoPan: boolean;

    /**
     *  Maximum width of the infowindow, regardless of content's width. This value is only considered
     *  if it is set before a call to open. To change the maximum width when changing content, call
     *  close, update maxWidth, and then open.
     *
     * @type {number}
     * @memberof InfoBox
     */
    @Input() public MaxWidth: number;

    /**
     * Determine whether only one infobox can be open at a time. Note that ANY info box settings.
     *
     * @type {boolean}
     * @memberof InfoBox
     */
    @Input() public Modal = true;

    /**
     * Holds the marker that is the host of the info window (if available)
     *
     * @type {MapMarker}
     * @memberof InfoBox
     */
    @Input() public HostMarker: MapMarkerDirective;

    /**
     * Determines visibility of infobox
     *
     * @type {boolean}
     * @memberof InfoBox
     */
    @Input() public Visible = false;

    /**
     * Horizontal offset of the infobox from the host marker lat/long or the sepecified coordinates.
     *
     * @type {number}
     * @memberof InfoBox
     */
    @Input() public xOffset: number;

    /**
     * Vertical offset for the infobox from the host marker lat/long or the specified coordinates.
     *
     * @type {number}
     * @memberof InfoBox
     */
    @Input() public yOffset: number;

    /**
     * Determines if other info boxes should be closed before opening this one
     *
     * @type {boolean}
     * @memberof InfoBox
     */
    @Input() public CloseInfoBoxesOnOpen = true;

    ///
    /// Delegate defintions
    ///

    /**
     * Emits an event when the info window is closed.
     *
     * @type {EventEmitter<void>}
     * @memberof InfoBox
     */
    @Output() public InfoBoxClose: EventEmitter<void> = new EventEmitter<void>();

    ///
    /// Property declarations.
    ///

    /**
     * Gets the HTML content of the info box.
     *
     * @readonly
     * @type {string}
     * @memberof InfoBox
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
     * @type {string}
     * @memberof InfoBox
     */
    public get Id(): string { return this._id; }

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of InfoBox.
     * @param {InfoBoxService} _infoBoxService - Concrete {@link InfoBoxService} implementation for underlying Map architecture.
     *
     * @memberof InfoBox
     */
    constructor(private _infoBoxService: InfoBoxService) { }

    ///
    /// Public methods
    ///

    /**
     * Closes the Infobox.
     *
     * @returns {Promise<void>} -
     *
     * @memberof InfoBox
     */
    public Close(): Promise<void> {
        return this._infoBoxService.Close(this).then(() => {
            this.InfoBoxClose.emit(void 0);
        });
    }

    /**
     * Called on after component view as been initialized. Part of the ng Component life cycle.
     *
     * @returns {void}
     *
     * @memberof Map
     */
    public ngAfterViewInit() {
        this._infoBoxService.AddInfoWindow(this);
        this._infoBoxAddedToManager = true;
    }

    /**
     * Called when changes to the databoud properties occur. Part of the ng Component life cycle.
     *
     * @param {{ [propName: string]: SimpleChange }} changes - Changes that have occured.
     * @return {void}
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
     * @returns {void}
     *
     * @memberof Map
     */
    public ngOnDestroy() { this._infoBoxService.DeleteInfoWindow(this); }

    /**
     * Opens a closed info window.
     *
     * @param {ILatLong} [loc]  - {@link ILatLong } representing position on which to open the window.
     * @returns {Promise<void>} - Promise that is fullfilled when the infobox has been opened.
     *
     * @memberof InfoBox
     */
    public Open(loc?: ILatLong): Promise<void> {
        return this._infoBoxService.Open(this, loc);
    }

    /**
     * Returns a string representation of the info box.
     *
     * @returns {string} - string representation of the info box.
     *
     * @memberof InfoBox
     */
    public ToString(): string { return 'InfoBox-' + this._id.toString(); }

    ///
    /// Private methods
    ///

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
