import {
    Directive, SimpleChange, Input, Output, OnDestroy, OnChanges,
    EventEmitter, ContentChild, AfterContentInit, ViewContainerRef, NgZone
} from '@angular/core';
import { IPoint } from '../interfaces/ipoint';
import { ILatLong } from '../interfaces/ilatlong';
import { IMarkerEvent } from '../interfaces/imarker-event';
import { IMarkerOptions } from '../interfaces/imarker-options';
import { ILayerOptions } from '../interfaces/ilayer-options';
import { IMarkerIconInfo } from '../interfaces/imarker-icon-info';
import { IClusterIconInfo } from '../interfaces/icluster-icon-info';
import { IClusterOptions } from '../interfaces/icluster-options';
import { MarkerService } from '../services/marker.service';
import { LayerService } from '../services/layer.service';
import { ClusterService } from '../services/cluster.service';
import { MapService } from '../services/map.service';
import { Layer } from '../models/layer';
import { Marker } from '../models/marker';
import { ClusterClickAction } from '../models/cluster-click-action';
import { ClusterPlacementMode } from '../models/cluster-placement-mode';
import { ClusterLayerDirective } from './cluster-layer';

/**
 * internal counter to use as ids for marker.
 */
let layerId = 1000000;

/**
 * MapMarkerLayerDirective performantly renders a large set of map marker inside a {@link MapComponent}.
 *
 * ### Example
 * ```typescript
 * import {Component} from '@angular/core';
 * import {MapComponent, MapMarkerDirective} from '...';
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
 *      <x-map-marker-layer [MarkerOptions]="_markers"></x-map-marker-layer>
 *   </x-map>
 * `
 * })
 * ```
 *
 * @export
 */
@Directive({
    selector: 'x-map-marker-layer'
})
export class MapMarkerLayerDirective implements OnDestroy, OnChanges, AfterContentInit {

    ///
    /// Field declarations
    ///
    private _id: number;
    private _layerPromise: Promise<Layer>;
    private _service: LayerService;
    private _styles: Array<IClusterIconInfo>;
    private _useDynamicSizeMarker = false;
    private _dynamicMarkerBaseSize = 18;
    private _dynamicMarkerRanges: Map<number, string> = new Map<number, string>([
        [10, 'rgba(20, 180, 20, 0.5)'],
        [100, 'rgba(255, 210, 40, 0.5)'],
        [Number.MAX_SAFE_INTEGER , 'rgba(255, 40, 40, 0.5)']
    ]);
    private _iconCreationCallback: (m: Array<Marker>, i: IMarkerIconInfo) => string;
    private _streaming: boolean = false;
    private _markers: Array<IMarkerOptions> = new Array<IMarkerOptions>();
    private _markersLast: Array<IMarkerOptions> = new Array<IMarkerOptions>();


    /**
     * Gets or sets the the Cluster Click Action {@link ClusterClickAction}.
     *
     * @memberof MapMarkerLayerDirective
     */
    @Input() public ClusterClickAction: ClusterClickAction =  ClusterClickAction.ZoomIntoCluster;

    /**
     * Gets or sets the IconInfo to be used to create a custom cluster marker. Supports font-based, SVG, graphics and more.
     * See {@link IMarkerIconInfo}.
     *
     * @memberof MapMarkerLayerDirective
     */
    @Input() public ClusterIconInfo: IMarkerIconInfo;

    /**
     * Gets or sets the cluster placement mode. {@link ClusterPlacementMode}
     *
     * @memberof MapMarkerLayerDirective
     */
    @Input()  public ClusterPlacementMode: ClusterPlacementMode = ClusterPlacementMode.MeanValue;

    /**
     * Gets or sets the callback invoked to create a custom cluster marker. Note that when {@link UseDynamicSizeMarkers} is enabled,
     * you cannot set a custom marker callback.
     *
     * @memberof MapMarkerLayerDirective
     */
    @Input()
        public get CustomMarkerCallback(): (m: Array<Marker>, i: IMarkerIconInfo) => string  { return this._iconCreationCallback; }
        public set CustomMarkerCallback(val: (m: Array<Marker>, i: IMarkerIconInfo) => string) {
            if (this._useDynamicSizeMarker) {
                throw(
                    new Error(`You cannot set a custom marker callback when UseDynamicSizeMarkers is set to true.
                    Set UseDynamicSizeMakers to false.`)
                );
            }
            this._iconCreationCallback = val;
        }

    /**
     * Gets or sets the base size of dynamic markers in pixels. The actualy size of the dynamic marker is based on this.
     * See {@link UseDynamicSizeMarkers}.
     *
     * @memberof ClusterLayerDirective
     */
    @Input()
        public get DynamicMarkerBaseSize(): number  { return this._dynamicMarkerBaseSize; }
        public set DynamicMarkerBaseSize(val: number) { this._dynamicMarkerBaseSize = val; }

    /**
     * Gets or sets the ranges to use to calculate breakpoints and colors for dynamic markers.
     * The map contains key/value pairs, with the keys being
     * the breakpoint sizes and the values the colors to be used for the dynamic marker in that range. See {@link UseDynamicSizeMarkers}.
     *
     * @memberof ClusterLayerDirective
     */
    @Input()
        public get DynamicMarkerRanges(): Map<number, string>  { return this._dynamicMarkerRanges; }
        public set DynamicMarkerRanges(val: Map<number, string>) { this._dynamicMarkerRanges = val; }

    /**
     * Determines whether the layer clusters. This property can only be set on creation of the layer.
     *
     * @memberof MapMarkerLayerDirective
     */
    @Input() public EnableClustering: boolean = false;

    /**
     * Gets or sets the grid size to be used for clustering.
     *
     * @memberof MapMarkerLayerDirective
     */
    @Input() public GridSize: number = 150;

    /**
     * Gets or sets the IconInfo to be used to create a custom marker images. Supports font-based, SVG, graphics and more.
     * See {@link IMarkerIconInfo}.
     *
     * @memberof MapMarkerLayerDirective
     */
    @Input() public IconInfo: IMarkerIconInfo;

    /**
     * Gets or sets An offset applied to the positioning of the layer.
     *
     * @memberof MapMarkerLayerDirective
     */
    @Input() public LayerOffset: IPoint = null;

    /**
     *  IMarkerOptions array holding the marker info.
     *
     * @memberof MapMarkerLayerDirective
     */
    @Input()
        public get MarkerOptions(): Array<IMarkerOptions> { return this._markers; }
        public set MarkerOptions(val: Array<IMarkerOptions>) {
            if (this._streaming) {
                this._markersLast.push(...val.slice(0));
                this._markers.push(...val);
            }
            else {
                this._markers = val.slice(0);
            }
        }

    /**
     * Gets or sets the cluster styles
     *
     * @memberof MapMarkerLayerDirective
     */
    @Input()
        public get Styles(): Array<IClusterIconInfo> { return this._styles; }
        public set Styles(val: Array<IClusterIconInfo>) { this._styles = val; }

    /**
     * Sets whether to treat changes in the MarkerOptions as streams of new markers. In thsi mode, changing the
     * Array supplied in MarkerOptions will be incrementally drawn on the map as opposed to replace the markers on the map.
     *
     * @memberof MapMarkerLayerDirective
     */
    @Input()
        public get TreatNewMarkerOptionsAsStream(): boolean { return this._streaming; }
        public set TreatNewMarkerOptionsAsStream(val: boolean) { this._streaming = val; }

    /**
     * Gets or sets whether to use dynamic markers. Dynamic markers change in size and color depending on the number of
     * pins in the cluster. If set to true, this will take precendence over any custom marker creation.
     *
     * @memberof MapMarkerLayerDirective
     */
    @Input()
        public get UseDynamicSizeMarkers(): boolean { return this._useDynamicSizeMarker; }
        public set UseDynamicSizeMarkers(val: boolean) {
            this._useDynamicSizeMarker = val;
            if (val) {
                this._iconCreationCallback = (m: Array<Marker>, info: IMarkerIconInfo) => {
                    return ClusterLayerDirective.CreateDynamicSizeMarker(
                        m.length, info, this._dynamicMarkerBaseSize, this._dynamicMarkerRanges);
                };
            }
        }

    /**
     * Sets the visibility of the marker layer
     *
     * @memberof MapMarkerLayerDirective
     */
    @Input() public Visible: boolean;

    /**
     * Gets or sets the z-index of the layer. If not used, layers get stacked in the order created.
     *
     * @memberof MapMarkerLayerDirective
     */
    @Input() public ZIndex: number = 0;

    /**
     * Gets or sets whether the cluster should zoom in on click
     *
     * @readonly
     * @memberof MapMarkerLayerDirective
     */
    @Input() public ZoomOnClick: boolean = true;


    ///
    /// Delegates
    ///

    /**
     * This event emitter gets emitted when the dynamic icon for a marker is being created.
     *
     * @memberof MapMarkerLayerDirective
     */
    @Output() public DynamicMarkerCreated: EventEmitter<IMarkerIconInfo> = new EventEmitter<IMarkerIconInfo>();

    /**
     * This event emitter gets emitted when the user clicks a marker in the layer.
     *
     * @memberof MapMarkerLayerDirective
     */
    @Output() public MarkerClick: EventEmitter<IMarkerEvent> = new EventEmitter<IMarkerEvent>();

    /**
     * This event is fired when the user stops dragging a marker.
     *
     * @memberof MapMarkerLayerDirective
     */
    @Output() public DragEnd: EventEmitter<IMarkerEvent> = new EventEmitter<IMarkerEvent>();


    ///
    /// Property declarations
    ///

    /**
     * Gets the id of the marker layer.
     *
     * @readonly
     * @memberof MapMarkerLayerDirective
     */
    public get Id(): number { return this._id; }

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of MapMarkerLayerDirective.
     * @param _markerService - Concreate implementation of a {@link MarkerService}.
     * @param _layerService - Concreate implementation of a {@link LayerService}.
     * @param _clusterService - Concreate implementation of a {@link ClusterService}.
     * @param _mapService - Concreate implementation of a {@link MapService}.
     * @param _zone - Concreate implementation of a {@link NgZone} service.
     *
     * @memberof MapMarkerLayerDirective
     */
    constructor(
        private _markerService: MarkerService,
        private _layerService: LayerService,
        private _clusterService: ClusterService,
        private _mapService: MapService,
        private _zone: NgZone) {
        this._id = layerId++;
    }

    ///
    /// Public methods
    ///

    /**
     * Translates a geo location to a pixel location relative to the map viewport.
     *
     * @param [loc] - {@link ILatLong} containing the geo coordinates.
     * @returns - A promise that when fullfilled contains an {@link IPoint} representing the pixel coordinates.
     *
     * @memberof MapMarkerLayerDirective
     */
    public LocationToPixel(loc: ILatLong): Promise<IPoint> {
        return this._markerService.LocationToPoint(loc);
    }

    /**
     * Called after Component content initialization. Part of ng Component life cycle.
     *
     * @memberof MapMarkerLayerDirective
     */
    public ngAfterContentInit() {
        const layerOptions: ILayerOptions = {
            id: this._id
        };
        this._zone.runOutsideAngular(() => {
            const fakeLayerDirective: any = {
                Id : this._id,
                Visible: this.Visible
            };
            if (!this.EnableClustering) {
                this._layerService.AddLayer(fakeLayerDirective);
                this._layerPromise = this._layerService.GetNativeLayer(fakeLayerDirective);
                this._service = this._layerService;
            }
            else {
                fakeLayerDirective.LayerOffset = this.LayerOffset;
                fakeLayerDirective.ZIndex = this.ZIndex;
                fakeLayerDirective.ClusteringEnabled = this.EnableClustering;
                fakeLayerDirective.ClusterPlacementMode = this.ClusterPlacementMode;
                fakeLayerDirective.GridSize = this.GridSize;
                fakeLayerDirective.ClusterClickAction = this.ClusterClickAction;
                fakeLayerDirective.IconInfo = this.ClusterIconInfo;
                fakeLayerDirective.CustomMarkerCallback = this.CustomMarkerCallback;
                fakeLayerDirective.UseDynamicSizeMarkers = this.UseDynamicSizeMarkers;
                this._clusterService.AddLayer(fakeLayerDirective);
                this._layerPromise = this._clusterService.GetNativeLayer(fakeLayerDirective);
                this._service = this._clusterService;
            }
            this._layerPromise.then(l => {
                l.SetVisible(this.Visible);
                if (this.MarkerOptions) {
                    this._zone.runOutsideAngular(() => this.UpdateMarkers());
                }
            });
        });
    }

    /**
     * Called on component destruction. Frees the resources used by the component. Part of the ng Component life cycle.
     *
     *
     * @memberof MapMarkerLayerDirective
     */
    public ngOnDestroy() {
        this._layerPromise.then(l => {
            l.Delete();
        });
    }

    /**
     * Reacts to changes in data-bound properties of the component and actuates property changes in the underling layer model.
     *
     * @param changes - collection of changes.
     *
     * @memberof MapMarkerLayerDirective
     */
    public ngOnChanges(changes: { [key: string]: SimpleChange }) {
        let shouldSetOptions: boolean = false;
        const o: IClusterOptions = {
            id: this._id
        };
        if (changes['MarkerOptions']) {
            this._zone.runOutsideAngular(() => {
                this.UpdateMarkers();
            });
        }
        if (changes['Visible'] && !changes['Visible'].firstChange) {
            this._zone.runOutsideAngular(() => {
                this._layerPromise.then(l => l.SetVisible(this.Visible));
            });
        }
        if (changes['EnableClustering'] && !changes['EnableClustering'].firstChange) {
            if ('StopClustering' in this._service) {
                o.clusteringEnabled = this.EnableClustering;
                shouldSetOptions = true;
            }
            else {
                throw (new Error('You cannot change EnableClustering after the layer has been created.'));
            }
        }
        if (changes['ClusterPlacementMode'] && !changes['ClusterPlacementMode'].firstChange && 'StopClustering' in this._service) {
            o.placementMode = this.ClusterPlacementMode;
            shouldSetOptions = true;
        }
        if (changes['GridSize'] && !changes['GridSize'].firstChange && 'StopClustering' in this._service) {
            o.gridSize = this.GridSize;
            shouldSetOptions = true;
        }
        if (changes['ClusterClickAction'] && !changes['ClusterClickAction'].firstChange && 'StopClustering' in this._service) {
            o.zoomOnClick = this.ClusterClickAction === ClusterClickAction.ZoomIntoCluster;
            shouldSetOptions = true;
        }
        if ((changes['ZIndex'] && !changes['ZIndex'].firstChange) ||
            (changes['LayerOffset'] && !changes['LayerOffset'].firstChange) ||
            (changes['IconInfo'] && !changes['IconInfo'].firstChange)
        ) {
            throw (new Error('You cannot change ZIndex or LayerOffset after the layer has been created.'));
        }

        if (shouldSetOptions) {
            this._zone.runOutsideAngular(() => {
                const fakeLayerDirective: any = {Id : this._id};
                this._layerPromise.then(l => l.SetOptions(o));
            });
        }
    }

    /**
     * Obtains a string representation of the Marker Id.
     * @returns - string representation of the marker id.
     * @memberof MapMarkerLayerDirective
     */
    public toString(): string { return 'MapMarkerLayer-' + this._id.toString(); }

    ///
    /// Private methods
    ///

    /**
     * Adds various event listeners for the marker.
     *
     * @param m - the marker for which to add the event.
     *
     * @memberof MapMarkerLayerDirective
     */
    private AddEventListeners(m: Marker): void {
        m.AddListener('click', (e: MouseEvent) => this.MarkerClick.emit({
                Marker: m,
                Click: e,
                Location: this._markerService.GetCoordinatesFromClick(e),
                Pixels: this._markerService.GetPixelsFromClick(e)
            }));
        m.AddListener('dragend', (e: MouseEvent) => this.DragEnd.emit({
                Marker: m,
                Click: e,
                Location: this._markerService.GetCoordinatesFromClick(e),
                Pixels: this._markerService.GetPixelsFromClick(e)
            }));
    }

    /**
     * Sets or updates the markers based on the marker options. This will place the markers on the map
     * and register the associated events.
     *
     * @memberof MapMarkerLayerDirective
     * @method
     */
    private UpdateMarkers(): void {
        if (this._layerPromise == null) { return; }
        this._layerPromise.then(l => {
            const markers: Array<IMarkerOptions> = this._streaming ? this._markersLast.splice(0) : this._markers;

            // generate the promise for the markers
            const mp: Promise<Array<Marker>> = this._service.CreateMarkers(markers, this.IconInfo);

            // set markers once promises are fullfilled.
            mp.then(m => {
                m.forEach(marker => {
                     this.AddEventListeners(marker);
                });
                this._streaming ? l.AddEntities(m) : l.SetEntities(m);
            });
        });
    }

}
