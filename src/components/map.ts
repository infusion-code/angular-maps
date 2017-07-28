import {
    Component,
    EventEmitter,
    OnChanges,
    OnInit,
    OnDestroy,
    SimpleChange,
    ViewChild,
    ContentChildren,
    Input,
    Output,
    ElementRef,
    HostBinding,
    ViewEncapsulation
} from '@angular/core';
import { MapServiceFactory } from '../services/mapservicefactory';
import { MapService } from '../services/map.service';
import { MarkerService } from '../services/marker.service';
import { InfoBoxService } from '../services/infobox.service';
import { LayerService } from '../services/layer.service';
import { PolygonService } from '../services/polygon.service';
import { PolylineService } from '../services/polyline.service';
import { ClusterService } from '../services/cluster.service';
import { ILatLong } from '../interfaces/ilatlong';
import { IBox } from '../interfaces/ibox';
import { IMapOptions } from '../interfaces/imap-options';
import { MapTypeId } from '../models/map-type-id';
import { MapMarkerDirective } from './map-marker';

/**
 * Renders a map based on a given provider.
 * **Important note**: To be able see a map in the browser, you have to define a height for the CSS
 * class `map-container`.
 *
 * ### Example
 * ```typescript
 * import {Component} from '@angular/core';
 * import {MapComponent} from '...';
 *
 * @Component({
 *  selector: 'my-map',
 *  styles: [`
 *    .map-container { height: 300px; }
 * `],
 *  template: `
 *    <x-map [Latitude]="lat" [Longitude]="lng" [Zoom]="zoom"></x-map>
 *  `
 * })
 * ```
 *
 * @export
 * @class MapComponent
 * @implements {OnChanges}
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
    selector: 'x-map',
    providers: [
        { provide: MapService, deps: [MapServiceFactory], useFactory: MapServiceCreator },
        { provide: MarkerService, deps: [MapServiceFactory, MapService, LayerService, ClusterService], useFactory: MarkerServiceFactory },
        {
            provide: InfoBoxService, deps: [MapServiceFactory, MapService,
                MarkerService], useFactory: InfoBoxServiceFactory
        },
        { provide: LayerService, deps: [MapServiceFactory, MapService], useFactory: LayerServiceFactory },
        { provide: ClusterService, deps: [MapServiceFactory, MapService], useFactory: ClusterServiceFactory },
        { provide: PolygonService, deps: [MapServiceFactory, MapService, LayerService], useFactory: PolygonServiceFactory },
        { provide: PolylineService, deps: [MapServiceFactory, MapService, LayerService], useFactory: PolylineServiceFactory }
    ],
    template: `
        <div #container class='map-container-inner'></div>
        <div class='map-content'>
            <ng-content></ng-content>
        </div>
    `,
    styles: [`
        .map-container-inner { width: inherit; height: inherit; }
        .map-container-inner div { background-repeat: no-repeat; }
        .map-content { display:none; }
    `],
    encapsulation: ViewEncapsulation.None
})
export class MapComponent implements OnChanges, OnInit, OnDestroy {

    ///
    /// Field declarations
    ///
    private _longitude = 0;
    private _latitude = 0;
    private _zoom = 0;
    private _clickTimeout: number | NodeJS.Timer;
    private _options: IMapOptions = {};
    private _box: IBox = null;
    private _mapPromise: Promise<void>;
    @HostBinding('class.map-container') private _containerClass: boolean = true;
    @ViewChild('container') private _container: ElementRef;
    @ContentChildren(MapMarkerDirective) private _markers: Array<MapMarkerDirective>;

    ///
    /// Property declarations
    ///

    /**
     * Get or sets the maximum and minimum bounding box for map.
     *
     * @type {IBox}
     * @memberof MapComponent
     */
    @Input()
    public get Box(): IBox { return this._box; }
    public set Box(val: IBox) { this._box = val; }

    /**
     * Gets or sets the latitude that sets the center of the map.
     *
     * @type {(number | string)}
     * @memberof MapComponent
     */
    @Input()
    public get Latitude(): number | string { return this._longitude; }
    public set Latitude(value: number | string) {
        this._latitude = this.ConvertToDecimal(value);
        this.UpdateCenter();
    }

    /**
     * Gets or sets the longitude that sets the center of the map.
     *
     * @type {(number| string)}
     * @memberof MapComponent
     */
    @Input()
    public get Longitude(): number | string { return this._longitude; }
    public set Longitude(value: number | string) {
        this._longitude = this.ConvertToDecimal(value);
        this.UpdateCenter();
    }

    /**
     * Gets or sets general map Options
     *
     * @type {IMapOptions}
     * @memberof MapComponent
     */
    @Input()
    public get Options(): IMapOptions { return this._options };
    public set Options(val: IMapOptions) { this._options = val; }

    /**
     * Gets or sets the zoom level of the map. The default value is `8`.
     *
     * @type {(number | string)}
     * @memberof MapComponent
     */
    @Input()
    public get Zoom(): number | string { return this._zoom; }
    public set Zoom(value: number | string) {
        this._zoom = this.ConvertToDecimal(value, 8);
        if (typeof this._zoom === 'number') {
            this._mapService.SetZoom(this._zoom);
        }
    }

    /**
     * This event emitter is fired when the map bounding box changes.
     *
     * @type {EventEmitter<IBox>}
     * @memberof MapComponent
     */
    @Output()
    BoundsChange: EventEmitter<IBox> = new EventEmitter<IBox>();

    /**
     * This event emitter is fired when the map center changes.
     *
     * @type {EventEmitter<ILatLong>}
     * @memberof MapComponent
     */
    @Output()
    CenterChange: EventEmitter<ILatLong> = new EventEmitter<ILatLong>();

    /**
     * This event emitter gets emitted when the user clicks on the map (but not when they click on a
     * marker or infoWindow).
     *
     * @type {EventEmitter<MouseEvent>}
     * @memberof MapComponent
     */
    @Output()
    MapClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

    /**
     * This event emitter gets emitted when the user double-clicks on the map (but not when they click
     * on a marker or infoWindow).
     *
     * @type {EventEmitter<MouseEvent>}
     * @memberof MapComponent
     */
    @Output()
    MapDblClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

    /**
     * This event emitter gets emitted when the user right-clicks on the map (but not when they click
     * on a marker or infoWindow).
     *
     * @type {EventEmitter<MouseEvent>}
     * @memberof MapComponent
     */
    @Output()
    MapRightClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

    /**
     * This event emitter gets emitted when the user double-clicks on the map (but not when they click
     * on a marker or infoWindow).
     *
     * @type {EventEmitter<MouseEvent>}
     * @memberof MapComponent
     */
    @Output()
    MapMouseOver: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

    /**
     * This event emitter gets emitted when the user double-clicks on the map (but not when they click
     * on a marker or infoWindow).
     *
     * @type {EventEmitter<MouseEvent>}
     * @memberof MapComponent
     */
    @Output()
    MapMouseOut: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

    /**
     * This event emitter gets emitted when the user double-clicks on the map (but not when they click
     * on a marker or infoWindow).
     *
     * @type {EventEmitter<MouseEvent>}
     * @memberof MapComponent
     */
    @Output()
    MapMouseMove: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

    /**
     * This event emiiter is fired when the map zoom changes
     *
     * @type {EventEmitter<Number>}
     * @memberof MapComponent
     */
    @Output()
    ZoomChange: EventEmitter<Number> = new EventEmitter<Number>();


    ///
    /// Constructor
    ///

    /**
     * Creates an instance of MapComponent.
     *
     * @param {MapService} _mapService - Concreted implementation of a map service for the underlying maps implementations.
     *                                   Generally provided via injections.
     * @memberof MapComponent
     */
    constructor(private _mapService: MapService) { }

    ///
    /// Public methods
    ///

    /**
     * Called on Component initialization. Part of ng Component life cycle.
     *
     * @returns {void}
     *
     * @memberof MapComponent
     */
    public ngOnInit(): void {
        this.InitMapInstance(this._container.nativeElement);
    }

    /**
     * Called when changes to the databoud properties occur. Part of the ng Component life cycle.
     *
     * @param {{ [propName: string]: SimpleChange }} changes - Changes that have occured.
     * @return {void}
     *
     * @memberof MapComponent
     */
    public ngOnChanges(changes: { [propName: string]: SimpleChange }): void {
        if (this._mapPromise) {
            if (changes['Box']) {
                if (this._box != null) {
                    this._mapService.SetViewOptions(<IMapOptions>{
                        bounds: this._box
                    });
                }
            }
            if (changes['Options']) {
                this._mapService.SetMapOptions(this._options);
            }
        }
    }

    /**
     * Called on component destruction. Frees the resources used by the component. Part of the ng Component life cycle.
     *
     * @returns {void}
     *
     * @memberof MapComponent
     */
    public ngOnDestroy(): void {
        this._mapService.DisposeMap();
    }

    /**
     * Triggers a resize event on the map instance.
     *
     * @returns {Promise<void>} - A promise that gets resolved after the event was triggered.
     *
     * @memberof MapComponent
     */
    public TriggerResize(): Promise<void> {
        // Note: When we would trigger the resize event and show the map in the same turn (which is a
        // common case for triggering a resize event), then the resize event would not
        // work (to show the map), so we trigger the event in a timeout.
        return new Promise<void>((resolve) => {
            setTimeout(
                () => { return this._mapService.TriggerMapEvent('resize').then(() => resolve()); });
        });
    }

    ///
    /// Private methods.
    ///

    /**
     * Converts a number-ish value to a number.
     *
     * @private
     * @param {(string | number)} value - The value to convert.
     * @param {number} [defaultValue=null] - Default value to use if the conversion cannot be performed.
     * @returns {number} - Converted number of the default.
     *
     * @memberof MapComponent
     */
    private ConvertToDecimal(value: string | number, defaultValue: number = null): number {
        if (typeof value === 'string') {
            return parseFloat(value);
        } else if (typeof value === 'number') {
            return <number>value;
        }
        return defaultValue;
    }

    /**
     * Delegate handling the map click events.
     *
     * @private
     *
     * @memberof MapComponent
     */
    private HandleMapClickEvents(): void {
        this._mapService.SubscribeToMapEvent<any>('click').subscribe(e => {
            //
            // this is necessary since bing will treat a doubleclick first as two clicks...'
            ///
            this._clickTimeout = setTimeout(() => {
                this.MapClick.emit(<MouseEvent>e);
            }, 300)
        });
        this._mapService.SubscribeToMapEvent<any>('dblclick').subscribe(e => {
            if (this._clickTimeout) {
                clearTimeout(<NodeJS.Timer>this._clickTimeout);
            }
            this.MapDblClick.emit(<MouseEvent>e);
        });
        this._mapService.SubscribeToMapEvent<any>('rightclick').subscribe(e => {
            this.MapRightClick.emit(<MouseEvent>e);
        });
        this._mapService.SubscribeToMapEvent<any>('mouseover').subscribe(e => {
            this.MapMouseOver.emit(<MouseEvent>e);
        });
        this._mapService.SubscribeToMapEvent<any>('mouseout').subscribe(e => {
            this.MapMouseOut.emit(<MouseEvent>e);
        });
        this._mapService.SubscribeToMapEvent<any>('mousemove').subscribe(e => {
            this.MapMouseMove.emit(<MouseEvent>e);
        });
    }

    /**
     * Delegate handling map center change events.
     *
     * @private
     *
     * @memberof MapComponent
     */
    private HandleMapBoundsChange(): void {
        this._mapService.SubscribeToMapEvent<void>('boundschanged').subscribe(() => {
            this._mapService.GetBounds().then((bounds: IBox) => {
                this.BoundsChange.emit(bounds);
            });
        });
    }

    /**
     * Delegate handling map center change events.
     *
     * @private
     *
     * @memberof MapComponent
     */
    private HandleMapCenterChange(): void {
        this._mapService.SubscribeToMapEvent<void>('centerchanged').subscribe(() => {
            this._mapService.GetCenter().then((center: ILatLong) => {
                if (this._latitude !== center.latitude || this._longitude !== center.longitude) {
                    this._latitude = center.latitude;
                    this._longitude = center.longitude;
                    this.CenterChange.emit(<ILatLong>{ latitude: this._latitude, longitude: this._longitude });
                }
            });
        });
    }

    /**
     * Delegate handling map zoom change events.
     *
     * @private
     *
     * @memberof MapComponent
     */
    private HandleMapZoomChange(): void {
        this._mapService.SubscribeToMapEvent<void>('zoomchanged').subscribe(() => {
            this._mapService.GetZoom().then((z: number) => {
                if (this._zoom !== z) {
                    this._zoom = z;
                    this.ZoomChange.emit(z);
                }
            });
        });
    }

    /**
     * Initializes the map.
     *
     * @private
     * @param {HTMLElement} el - Html elements which will host the map canvas.
     *
     * @memberof MapComponent
     */
    private InitMapInstance(el: HTMLElement) {
        if (this._options.center == null) { this._options.center = { latitude: this._latitude, longitude: this._longitude }; }
        if (this._options.zoom == null) { this._options.zoom = this._zoom; }
        if (this._options.mapTypeId == null) { this._options.mapTypeId = MapTypeId.aerial; }
        if (this._box != null) { this._options.bounds = this._box; }
        this._mapPromise = this._mapService.CreateMap(el, this._options);
        this.HandleMapCenterChange();
        this.HandleMapBoundsChange();
        this.HandleMapZoomChange();
        this.HandleMapClickEvents();
    }

    /**
     * Updates the map center based on the geo properties of the component.
     *
     * @private
     * @returns {void}
     *
     * @memberof MapComponent
     */
    private UpdateCenter(): void {
        if (typeof this._latitude !== 'number' || typeof this._longitude !== 'number') {
            return;
        }
        this._mapService.SetCenter({
            latitude: this._latitude,
            longitude: this._longitude,
        });
    }
}

/**
 * Factory function to generate a cluster service instance. This is necessary because of constraints with AOT that do no allow
 * us to use lamda functions inline.
 *
 * @export
 * @param {MapServiceFactory} f - The {@link MapServiceFactory} implementation.
 * @param {MapService} m - A {@link MapService} instance.
 * @returns {ClusterService} - A concrete instance of a Cluster Service based on the underlying map architecture
 */
export function ClusterServiceFactory(f: MapServiceFactory, m: MapService): ClusterService { return f.CreateClusterService(m); }

/**
 * Factory function to generate a infobox service instance. This is necessary because of constraints with AOT that do no allow
 * us to use lamda functions inline.
 *
 * @export
 * @param {MapServiceFactory} f - The {@link MapServiceFactory} implementation.
 * @param {MapService} m - A {@link MapService} instance.
 * @param {MarkerService} m - A {@link MarkerService} instance.
 * @returns {InfoBoxService} - A concrete instance of a InfoBox Service based on the underlying map architecture.
 */
export function InfoBoxServiceFactory(f: MapServiceFactory, m: MapService,
    ma: MarkerService): InfoBoxService { return f.CreateInfoBoxService(m, ma); }

/**
 * Factory function to generate a layer service instance. This is necessary because of constraints with AOT that do no allow
 * us to use lamda functions inline.
 *
 * @export
 * @param {MapServiceFactory} f - The {@link MapServiceFactory} implementation.
 * @param {MapService} m - A {@link MapService} instance.
 * @returns {LayerService} - - A concrete instance of a Layer Service based on the underlying map architecture.
 */
export function LayerServiceFactory(f: MapServiceFactory, m: MapService): LayerService { return f.CreateLayerService(m); }

/**
 * Factory function to generate a map service instance. This is necessary because of constraints with AOT that do no allow
 * us to use lamda functions inline.
 *
 * @export
 * @param {MapServiceFactory} f - The {@link MapServiceFactory} implementation.
 * @returns {MapService} - A concrete instance of a MapService based on the underlying map architecture.
 */
export function MapServiceCreator(f: MapServiceFactory): MapService { return f.Create(); }

/**
 * Factory function to generate a marker service instance. This is necessary because of constraints with AOT that do no allow
 * us to use lamda functions inline.
 *
 * @export
 * @param {MapServiceFactory} f - The {@link MapServiceFactory} implementation.
 * @param {MapService} m - A {@link MapService} instance.
 * @param {LayerService} l - A {@link LayerService} instance.
 * @param {ClusterService} c - A {@link ClusterService} instance.
 * @returns {MarkerService} - A concrete instance of a Marker Service based on the underlying map architecture.
 */
export function MarkerServiceFactory(f: MapServiceFactory, m: MapService, l: LayerService, c: ClusterService): MarkerService {
    return f.CreateMarkerService(m, l, c);
}

/**
 * Factory function to generate a polygon service instance. This is necessary because of constraints with AOT that do no allow
 * us to use lamda functions inline.
 *
 * @export
 * @param {MapServiceFactory} f - The {@link MapServiceFactory} implementation.
 * @param {MapService} m - A {@link MapService} instance.
 * @param {LayerService} l - A {@link LayerService} instance.
 * @returns {PolygonService} - A concrete instance of a Polygon Service based on the underlying map architecture.
 */
export function PolygonServiceFactory(f: MapServiceFactory, m: MapService, l: LayerService): PolygonService {
    return f.CreatePolygonService(m, l);
}

/**
 * Factory function to generate a polyline service instance. This is necessary because of constraints with AOT that do no allow
 * us to use lamda functions inline.
 *
 * @export
 * @param {MapServiceFactory} f - The {@link MapServiceFactory} implementation.
 * @param {MapService} m - A {@link MapService} instance.
 * @param {LayerService} l - A {@link LayerService} instance.
 * @returns {PolylineService} - A concrete instance of a Polyline Service based on the underlying map architecture.
 */
export function PolylineServiceFactory(f: MapServiceFactory, m: MapService, l: LayerService): PolylineService {
    return f.CreatePolylineService(m, l);
}
