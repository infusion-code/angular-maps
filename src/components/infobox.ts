import {
    AfterViewInit,
    AfterContentInit,
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
import { Subscription } from 'rxjs/Rx';
import { IInfoWindowOptions } from '../interfaces/iinfo-window-options';
import { ILatLong } from '../interfaces/ilatlong';
import { InfoBoxService } from '../services/infobox.service';
import { INotificationEvent } from '../interfaces/inotification-event';
import { MapMarkerDirective } from './map-marker';
import { InfoBoxActionDirective } from './infobox-action';
import { InfoBoxContentComponent } from './infobox-content';

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
 * @class InfoBoxComponent
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
export class InfoBoxComponent implements OnDestroy, OnChanges, AfterViewInit, AfterContentInit {

    ///
    /// Field declarations
    ///
    private _infoBoxAddedToManager = false;
    private _id: string = (infoBoxId++).toString();
    private _trackedSubscriptions: Array<Subscription> = new Array<Subscription>();

    /**
     * HTML conent of the infobox
     *
     * @private
     * @type {ElementRef}
     * @memberof InfoBoxComponent
     */
    @ViewChild('infoBoxContent') private _content: ElementRef;

    /**
     * Zero or more content components (deriving from {@link InfoBoxContentComponent}) that implement
     * more complex infobox behaviors.
     *
     * @public
     * @type {QueryList<InfoBoxContentComponent>}
     * @memberof InfoBoxComponent
     */
    @ContentChildren(InfoBoxContentComponent) private _infoWindowObjects: QueryList<InfoBoxComponent>;

    /**
     * Zero or more actions to show on the info window
     *
     * @private
     * @type {QueryList<InfoBoxAction>}
     * @memberof InfoBoxComponent
     */
    @ContentChildren(InfoBoxActionDirective) public InfoWindowActions: QueryList<InfoBoxActionDirective>;

    /**
     * The latitude position of the info window (only usefull if you use it ouside of a {@link MapMarker}).
     *
     * @type {number}
     * @memberof InfoBoxComponent
     */
    @Input() public Latitude: number;

    /**
     * The longitude position of the info window (only usefull if you use it ouside of a {@link MapMarker}).
     *
     * @type {number}
     * @memberof InfoBoxComponent
     */
    @Input() public Longitude: number;

    /**
     * The title to display in the info window
     *
     * @type {string}
     * @memberof InfoBoxComponent
     */
    @Input() public Title: string;

    /**
     * The description to display in the info window.
     *
     * @type {string}
     * @memberof InfoBoxComponent
     */
    @Input() public Description: string;

    /**
     * Disable auto-pan on open. By default, the info window will pan the map so that it is fully
     * visible when it opens.
     *
     * @type {boolean}
     * @memberof InfoBoxComponent
     */
    @Input() public DisableAutoPan: boolean;

    /**
     *  Maximum width of the infowindow, regardless of content's width. This value is only considered
     *  if it is set before a call to open. To change the maximum width when changing content, call
     *  close, update maxWidth, and then open.
     *
     * @type {number}
     * @memberof InfoBoxComponent
     */
    @Input() public MaxWidth: number;

    /**
     * Determine whether only one infobox can be open at a time. Note that ANY info box settings.
     *
     * @type {boolean}
     * @memberof InfoBoxComponent
     */
    @Input() public Modal = true;

    /**
     * Holds the marker that is the host of the info window (if available)
     *
     * @type {MapMarker}
     * @memberof InfoBoxComponent
     */
    @Input() public HostMarker: MapMarkerDirective;

    /**
     * Determines visibility of infobox
     *
     * @type {boolean}
     * @memberof InfoBoxComponent
     */
    @Input() public Visible = false;

    /**
     * Horizontal offset of the infobox from the host marker lat/long or the sepecified coordinates.
     *
     * @type {number}
     * @memberof InfoBoxComponent
     */
    @Input() public xOffset: number;

    /**
     * Vertical offset for the infobox from the host marker lat/long or the specified coordinates.
     *
     * @type {number}
     * @memberof InfoBoxComponent
     */
    @Input() public yOffset: number;

    /**
     * Determines if other info boxes should be closed before opening this one
     *
     * @type {boolean}
     * @memberof InfoBoxComponent
     */
    @Input() public CloseInfoBoxesOnOpen = true;

    ///
    /// Delegate defintions
    ///

    /**
     * Emits an event when the info window is closed.
     *
     * @type {EventEmitter<string>}
     * @memberof InfoBoxComponent
     */
    @Output() public InfoBoxClose: EventEmitter<string> = new EventEmitter<string>();

    /**
     * Emits notification events originating from the events
     * emitted by any hosted {@link InfoBoxContentComponent}.
     *
     * @type {EventEmitter<INotificationEvent>}
     * @memberof InfoBoxComponent
     */
    @Output() public Notification: EventEmitter<INotificationEvent> = new EventEmitter<INotificationEvent>();

    ///
    /// Property declarations.
    ///

    /**
     * Gets the HTML content of the info box.
     *
     * @readonly
     * @type {string}
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
     * @type {string}
     * @memberof InfoBoxComponent
     */
    public get Id(): string { return this._id; }

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of InfoBoxComponent.
     *
     * @param {InfoBoxService} _infoBoxService - Concrete {@link InfoBoxService} implementation for underlying Map architecture.
     * @memberof InfoBoxComponent
     */
    constructor(private _infoBoxService: InfoBoxService) { }

    ///
    /// Public methods
    ///

    /**
     * Closes the Infobox.
     *
     * @returns {Promise<void>}
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
     * @returns {void}
     * @memberof InfoBoxComponent
     */
    public ngAfterViewInit() {
        this._infoBoxService.AddInfoWindow(this);
        this._infoBoxAddedToManager = true;
        this.HandleEvents();
    }

    /**
     * Called after child components have been created. Wires up event forwarding of the notification events.
     *
     * @returns {void}
     * @memberof InfoBoxComponent
     */
    public ngAfterContentInit() {
        if (this._infoWindowObjects != null) {
            this._infoWindowObjects.forEach(x => {
                this._trackedSubscriptions.push(
                    x.Notification.asObservable().subscribe(event => {
                        this.Notification.emit(event);
                }));
            });
        }
    }

    /**
     * Called when changes to the databoud properties occur. Part of the ng Component life cycle.
     *
     * @param {{ [propName: string]: SimpleChange }} changes - Changes that have occured.
     * @return {void}
     * @memberof InfoBoxComponent
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
     * @memberof InfoBoxComponent
     */
    public ngOnDestroy() {
        this._infoBoxService.DeleteInfoWindow(this);
        this._trackedSubscriptions.forEach(s => s.unsubscribe());
    }

    /**
     * Opens a closed info window.
     *
     * @param {ILatLong} [loc]  - {@link ILatLong } representing position on which to open the window.
     * @returns {Promise<void>} - Promise that is fullfilled when the infobox has been opened.
     * @memberof InfoBoxComponent
     */
    public Open(loc?: ILatLong): Promise<void> {
        return this._infoBoxService.Open(this, loc);
    }

    /**
     * Returns a string representation of the info box.
     *
     * @returns {string} - string representation of the info box.
     * @memberof InfoBoxComponent
     */
    public ToString(): string { return 'InfoBoxComponent-' + this._id; }

    ///
    /// Private methods
    ///

    /**
     * Delegate handling the map click events.
     *
     * @private
     * @memberof InfoBoxComponent
     */
    private HandleEvents(): void {
        this._infoBoxService.CreateEventObservable('infowindowclose', this).subscribe(e => {
            this.InfoBoxClose.emit(this._id);
        });
    }

    /**
     * Sets the info window options
     *
     * @private
     * @param {{ [key: string]: SimpleChange }} changes
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
