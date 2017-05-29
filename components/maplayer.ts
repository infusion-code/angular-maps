import { Directive, EventEmitter, OnInit, OnDestroy, OnChanges, AfterContentInit, SimpleChange, ContentChildren, Input, ElementRef, ViewContainerRef } from "@angular/core";
import { LayerService } from "../services/layerservice";
import { MapMarker } from "./mapmarker";

/**
 * internal counter to use as ids for multiple layers. 
 */
let layerId:number = 0;

/**
 * MapLayer creates a layer on a {@link Map}.
 *
 * ### Example
 * ```typescript
 * import {Component} from '@angular/core';
 * import {Map, MapMarker} from '...';
 *
 * @Component({
 *  selector: 'my-map-cmp',
 *  styles: [`
 *   .map-container {
 *     height: 300px;
 *   }
 * `],
 * template: `
 *   <x-map [latitude]="lat" [longitude]="lng" [zoom]="zoom">
 *     <map-layer [Visible]="visible">
 *         <map-marker [latitude]="lat" [longitude]="lng" [label]="'M'"></map-marker>
 *     </map-layer>
 *   </x-map>
 * `
 * })
 * ```
 * 
 * @export
 * @class MapLayer
 * @implements {OnInit}
 * @implements {OnDestroy}
 * @implements {OnChanges}
 */
@Directive({
    selector: 'map-layer'
})
export class MapLayer implements OnInit, OnDestroy, OnChanges {

    ///
    /// Field declarations
    ///
    protected _visible: boolean = true;
    protected _addedToManager: boolean = false;
    protected _id: number = layerId++;

    @ContentChildren(MapMarker) protected _markers: Array<MapMarker>;

    ///
    /// Property declarations
    ///

    /**
     * Gets or sets the layer visibility. 
     * 
     * @type {boolean}
     * @memberof MapLayer
     */
    @Input()
        public get Visible(): boolean { return this._visible; }
        public set Visible(val: boolean) { this._visible = val; }

    
    /**
     * Gets the layer id. 
     * 
     * @readonly
     * @type {number}
     * @memberof MapLayer
     */
    public get Id(): number { return this._id; }

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of MapLayer.
     * @param {LayerService} _layerService - Concreted implementation of a layer service for the underlying maps implementations. Generally provided via injections. 
     * @param {ViewContainerRef} _containerRef - Reference to the container hosting the map canvas. Generally provided via injection. 
     * 
     * @memberof MapLayer
     */
    constructor(protected _layerService: LayerService, protected _containerRef: ViewContainerRef) {
        this._id = layerId++
    }

    ///
    /// Public methods 
    ///

    /**
     * Called on Component initialization. Part of ng Component life cycle.
     * @returns {void}
     * 
     * @memberof MapLayer
     */
    public ngOnInit(): void {
        this._containerRef.element.nativeElement.attributes["layerId"] = this._id.toString();
        this._layerService.AddLayer(this);
        this._addedToManager = true;        
    }

    /**
     * Called when changes to the databoud properties occur. Part of the ng Component life cycle. 
     * 
     * @param {{ [propName: string]: SimpleChange }} changes - Changes that have occured.  
     * @returns {void}
     * 
     * @memberof MapLayer
     */
    public ngOnChanges(changes: { [propName: string]: SimpleChange }): void {
        if (!this._addedToManager) return;
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
     * @memberof MapLayer
     */
    public ngOnDestroy(): void {
        this._layerService.DeleteLayer(this);
    }
}