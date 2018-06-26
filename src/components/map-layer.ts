import { Directive, EventEmitter, OnInit, OnDestroy, OnChanges, AfterContentInit, SimpleChange,
    ContentChildren, Input, ElementRef, ViewContainerRef } from '@angular/core';
import { LayerService } from '../services/layer.service';
import { MapMarkerDirective } from './map-marker';

/**
 * internal counter to use as ids for multiple layers.
 */
let layerId = 0;

/**
 * MapLayerDirective creates a layer on a {@link MapComponent}.
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
 *     <x-map-layer [Visible]='visible'>
 *         <x-map-marker [Latitude]='lat' [Longitude]='lng' [Label]=''M''></x-map-marker>
 *     </x-map-layer>
 *   </x-map>
 * `
 * })
 * ```
 *
 * @export
 */
@Directive({
    selector: 'x-map-layer'
})
export class MapLayerDirective implements OnInit, OnDestroy, OnChanges {

    ///
    /// Field declarations
    ///
    protected _visible = true;
    protected _addedToManager = false;
    protected _id: number;

    @ContentChildren(MapMarkerDirective) protected _markers: Array<MapMarkerDirective>;

    ///
    /// Property declarations
    ///

    /**
     * Gets or sets the layer visibility.
     *
     * @memberof MapLayerDirective
     */
    @Input()
        public get Visible(): boolean { return this._visible; }
        public set Visible(val: boolean) { this._visible = val; }

    /**
     * Gets the layer id.
     *
     * @readonly
     * @memberof MapLayerDirective
     */
    public get Id(): number { return this._id; }

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of MapLayerDirective.
     * @param _layerService - Concreted implementation of a layer service for the underlying maps implementations.
     * Generally provided via injections.
     * @param _containerRef - Reference to the container hosting the map canvas. Generally provided via injection.
     *
     * @memberof MapLayerDirective
     */
    constructor(protected _layerService: LayerService, protected _containerRef: ViewContainerRef) {
        this._id = layerId++;
    }

    ///
    /// Public methods
    ///

    /**
     * Called on Component initialization. Part of ng Component life cycle.
     *
     * @memberof MapLayerDirective
     */
    public ngOnInit(): void {
        this._containerRef.element.nativeElement.attributes['layerId'] = this._id.toString();
        this._layerService.AddLayer(this);
        this._addedToManager = true;
    }

    /**
     * Called when changes to the databoud properties occur. Part of the ng Component life cycle.
     *
     * @param changes - Changes that have occured.
     *
     * @memberof MapLayerDirective
     */
    public ngOnChanges(changes: { [propName: string]: SimpleChange }): void {
        if (!this._addedToManager) { return; }
        if (changes['Visible']) {
            this._layerService.GetNativeLayer(this).then(l => {
                l.SetVisible(!l.GetVisible());
            });
        }
    }

    /**
     * Called on component destruction. Frees the resources used by the component. Part of the ng Component life cycle.
     *
     *
     * @memberof MapLayerDirective
     */
    public ngOnDestroy(): void {
        this._layerService.DeleteLayer(this);
    }
}
