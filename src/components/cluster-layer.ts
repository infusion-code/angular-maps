import { IClusterIconInfo } from './../interfaces/icluster-icon-info';
import { Directive, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChange,
    ContentChildren, Input, ElementRef, ViewContainerRef } from '@angular/core';
import { Marker } from '../models/marker';
import { Layer } from '../models/layer';
import { ClusterPlacementMode } from '../models/cluster-placement-mode';
import { ClusterClickAction } from '../models/cluster-click-action';
import { IPoint } from '../interfaces/ipoint';
import { IClusterOptions } from '../interfaces/icluster-options';
import { IMarkerIconInfo} from '../interfaces/imarker-icon-info';
import { ClusterService } from '../services/cluster.service';
import { ISpiderClusterOptions } from '../interfaces/ispider-cluster-options';
import { MapMarkerDirective } from './map-marker';
import { MapLayerDirective } from './map-layer';

/**
 *
 * Creates a cluster layer on a {@link MapComponent}.
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
 *   <x-map [Latitude]='lat' [Longitude]='lng' [Zoom]='zoom'>
 *     <x-cluster-layer [Visible]='visible'>
 *         <x-map-marker [Latitude]='lat' [Longitude]='lng' [Label]=''M''></x-map-marker>
 *     </x-cluster-layer>
 *   </x-map>
 * `
 * })
 * ```
 *
 * @export
 * @class ClusterLayerDirective
 * @extends {MapLayerDirective}
 * @implements {OnInit}
 * @implements {OnDestroy}
 * @implements {OnChanges}
 */
@Directive({
    selector: 'x-cluster-layer'
})
export class ClusterLayerDirective extends MapLayerDirective implements OnInit, OnDestroy, OnChanges {

    ///
    /// Field declarations
    ///
    private _clusteringEnabled = true;
    private _clusterPlacementMode: ClusterPlacementMode = ClusterPlacementMode.MeanValue;
    private _clusterClickAction: ClusterClickAction = ClusterClickAction.ZoomIntoCluster;
    private _spiderClusterOptions: ISpiderClusterOptions;
    private _zIndex: number;
    private _gridSize: number;
    private _layerOffset: IPoint;
    private _iconInfo: IMarkerIconInfo;
    private _minimumClusterSize: number;
    private _styles: Array<IClusterIconInfo>;
    private _useDynamicSizeMarker = false;
    private _dynamicMarkerBaseSize = 18;
    private _dynamicMarkerRanges: Map<number, string> = new Map<number, string>([
        [10, 'rgba(20, 180, 20, 0.5)'],
        [100, 'rgba(255, 210, 40, 0.5)'],
        [Number.MAX_SAFE_INTEGER , 'rgba(255, 40, 40, 0.5)']
    ]);
    private _zoomOnClick = true;
    private _iconCreationCallback: (m: Array<Marker>, i: IMarkerIconInfo) => string;

    ///
    /// Property defintions
    ///

    /**
     * Gets or sets the the Cluster Click Action {@link ClusterClickAction}.
     *
     * @type {ClusterClickAction}
     * @memberof ClusterLayerDirective
     */
    @Input()
        public get ClusterClickAction(): ClusterClickAction  { return this._clusterClickAction; }
        public set ClusterClickAction(val: ClusterClickAction) { this._clusterClickAction = val; }

    /**
     * Gets or sets whether the clustering layer enables clustering. When set to false, the layer
     * behaves like a generic layer. This is handy if you want to prevent clustering at certain zoom levels.
     *
     * @type {boolean}
     * @memberof ClusterLayerDirective
     */
    @Input()
        public get ClusteringEnabled(): boolean  { return this._clusteringEnabled; }
        public set ClusteringEnabled(val: boolean) { this._clusteringEnabled = val; }

    /**
     * Gets or sets the cluster placement mode. {@link ClusterPlacementMode}
     *
     * @type {ClusterPlacementMode}
     * @memberof ClusterLayerDirective
     */
    @Input()
        public get ClusterPlacementMode(): ClusterPlacementMode  { return this._clusterPlacementMode; }
        public set ClusterPlacementMode(val: ClusterPlacementMode) { this._clusterPlacementMode = val; }

    /**
     * Gets or sets the callback invoked to create a custom cluster marker. Note that when {@link UseDynamicSizeMarkers} is enabled,
     * you cannot set a custom marker callback.
     *
     * @type (Array<Marker>, IMarkerIconInfo) => string
     * @memberof ClusterLayerDirective
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
     * @type {number}
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
     * @type {Map<number, string>}
     * @memberof ClusterLayerDirective
     */
    @Input()
        public get DynamicMarkerRanges(): Map<number, string>  { return this._dynamicMarkerRanges; }
        public set DynamicMarkerRanges(val: Map<number, string>) { this._dynamicMarkerRanges = val; }

    /**
     * Gets or sets the grid size to be used for clustering.
     *
     * @type {number}
     * @memberof ClusterLayerDirective
     */
    @Input()
        public get GridSize(): number  { return this._gridSize; }
        public set GridSize(val: number) { this._gridSize = val; }

    /**
     * Gets or sets the IconInfo to be used to create a custom cluster marker. Supports font-based, SVG, graphics and more.
     * See {@link IMarkerIconInfo}.
     *
     * @type {IMarkerIconInfo}
     * @memberof ClusterLayerDirective
     */
    @Input()
        public get IconInfo(): IMarkerIconInfo  { return this._iconInfo; }
        public set IconInfo(val: IMarkerIconInfo) { this._iconInfo = val; }

    /**
     * Gets or sets An offset applied to the positioning of the layer.
     *
     * @type {IPoint}
     * @memberof ClusterLayerDirective
     */
    @Input()
        public get LayerOffset(): IPoint  { return this._layerOffset; }
        public set LayerOffset(val: IPoint) { this._layerOffset = val; }

    /**
     * Gets or sets the minimum pins required to form a cluster
     *
     * @readonly
     * @type {number}
     * @memberof ClusterLayerDirective
     */
    @Input()
        public get MinimumClusterSize(): number  { return this._minimumClusterSize; }
        public set MinimumClusterSize(val: number) { this._minimumClusterSize = val; }

    /**
     * Gets or sets the options for spider clustering behavior. See {@link ISpiderClusterOptions}
     *
     * @type {ISpiderClusterOptions}
     * @memberof ClusterLayerDirective
     */
    @Input()
        public get SpiderClusterOptions(): ISpiderClusterOptions { return this._spiderClusterOptions; }
        public set SpiderClusterOptions(val: ISpiderClusterOptions) { this._spiderClusterOptions = val; }

    /**
     * Gets or sets the cluster styles
     *
     * @readonly
     * @type {Array<IClusterIconInfo>)}
     * @memberof ClusterLayerDirective
     */
    @Input()
        public get Styles(): Array<IClusterIconInfo> { return this._styles; }
        public set Styles(val: Array<IClusterIconInfo>) { this._styles = val; }

    /**
     * Gets or sets whether to use dynamic markers. Dynamic markers change in size and color depending on the number of
     * pins in the cluster. If set to true, this will take precendence over any custom marker creation.
     *
     * @type {boolean}
     * @memberof ClusterLayerDirective
     */
    @Input()
        public get UseDynamicSizeMarkers(): boolean { return this._useDynamicSizeMarker; }
        public set UseDynamicSizeMarkers(val: boolean) {
            this._useDynamicSizeMarker = val;
            if (val) {
                this._iconCreationCallback = (m: Array<Marker>, info: IMarkerIconInfo) => {
                    return ClusterLayerDirective.CreateDynamicSizeMarker(
                        m.length, info, this._dynamicMarkerBaseSize, this._dynamicMarkerRanges);
                }
            }
        }

    /**
     * Gets or sets the z-index of the layer. If not used, layers get stacked in the order created.
     *
     * @type {number}
     * @memberof ClusterLayerDirective
     */
    @Input()
        public get ZIndex(): number { return this._zIndex; }
        public set ZIndex(val: number) { this._zIndex = val; }

    /**
     * Gets or sets whether the cluster should zoom in on click
     *
     * @readonly
     * @type {boolean}
     * @memberof ClusterLayerDirective
     */
    @Input()
        public get ZoomOnClick(): boolean { return this._zoomOnClick; }
        public set ZoomOnClick(val: boolean) { this._zoomOnClick = val; }

    /**
     * Creates the dynamic size marker to be used for cluster markers if UseDynamicSizeMarkers is set to true.
     *
     * @public
     * @static
     * @param {integer} size - The number of markers in the cluster.
     * @param {IMarkerIconInfo} info  - The icon info to be used. This will be hydrated with
     * the actualy dimensions of the created markers and is used by the underlying model/services
     * to correctly offset the marker for correct positioning.
     * @param {number} baseMarkerSize - The base size for dynmic markers.
     * @param {Map<number, string>} ranges - The ranges to use to calculate breakpoints and colors for dynamic markers.
     * The map contains key/value pairs, with the keys being
     * the breakpoint sizes and the values the colors to be used for the dynamic marker in that range.
     * @returns {string} - An string containing the SVG for the marker.
     *
     * @memberof ClusterLayerDirective
     */
    public static CreateDynamicSizeMarker(size: number, info: IMarkerIconInfo,
                                             baseMarkerSize: number, ranges: Map<number, string>): string {
        const mr: number = baseMarkerSize;
        const outline: number = mr * 0.35;
        const total: number = size;
        const r: number = Math.log(total) / Math.log(10) * 5 + mr;
        const d: number = r * 2;
        let fillColor: string;
        ranges.forEach((v, k) => {
            if (total <= k && !fillColor) { fillColor = v; }
        });
        if (!fillColor) { fillColor = 'rgba(20, 180, 20, 0.5)' };

        // Create an SVG string of two circles, one on top of the other, with the specified radius and color.
        const svg: Array<any> = [`<svg xmlns='http://www.w3.org/2000/svg' width='${d}' height='${d}'>`,
            `<circle cx='${r}' cy='${r}' r='${r}' fill='${fillColor}'/>`,
            `<circle cx='${r}' cy='${r}' r='${r - outline}' fill='${fillColor}'/>`,
            `</svg>`];
        info.size = { width: d, height: d };
        info.markerOffsetRatio = { x: 0.5, y: 0.5 };
        info.textOffset = { x: 0, y: r - 8 };
        return svg.join('');
    }

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of ClusterLayerDirective.
     *
     * @param {ClusterService} _layerService - Concreted implementation of a cluster layer service for the underlying maps
     * implementations. Generally provided via injections.
     * @param {ViewContainerRef} _containerRef - A reference to the view container of the layer. Generally provided via injection.
     *
     * @memberof ClusterLayerDirective
     */
    constructor(_layerService: ClusterService, _containerRef: ViewContainerRef) {
        super(_layerService, _containerRef);
    }

    ///
    /// Public methods
    ///

    /**
     * Reacts to changes in data-bound properties of the component and actuates property changes in the underling layer model.
     *
     * @param {{ [propName: string]: SimpleChange }} changes - collection of changes.
     *
     * @memberof ClusterLayerDirective
     */
    public ngOnChanges(changes: { [propName: string]: SimpleChange }): void {
        if (!this._addedToManager) { return; }
        if (changes['ClusterClickAction']) {
            throw (
                new Error('You cannot change the ClusterClickAction after the layer has been added to the layerservice.')
            )
        }

        const options: IClusterOptions = { id: this._id };
        if (changes['ClusteringEnbabled']) { options.clusteringEnabled = this._clusteringEnabled; }
        if (changes['GridSize']) { options.gridSize = this._gridSize; }
        if (changes['LayerOffset']) { options.layerOffset = this._layerOffset; }
        if (changes['SpiderClusterOptions']) { options.spiderClusterOptions = this._spiderClusterOptions; }
        if (changes['ZIndex']) { options.zIndex = this._zIndex; }
        if (changes['Visible']) { options.visible = this._visible; }

        this._layerService.GetNativeLayer(this).then((l: Layer) => {
            l.SetOptions(options);
        });
    }

}
