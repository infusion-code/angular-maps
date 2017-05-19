import { Directive, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChange, ContentChildren, Input, ElementRef, ViewContainerRef } from "@angular/core";
import { Marker } from "../models/marker";
import { Layer } from "../models/layer";
import { IPoint } from "../interfaces/ipoint";
import { IClusterOptions } from "../interfaces/iclusteroptions";
import { IMarkerIconInfo} from "../interfaces/imarkericoninfo";
import { ClusterService } from "../services/clusterservice";
import { MapMarker } from "./mapmarker";
import { MapLayer } from "./maplayer";

///
/// Creates a cluster layer on a {@link Map}.
///
/// ### Example
/// ```typescript
/// import {Component} from '@angular/core';
/// import {Map, MapMarker} from '...';
///
/// @Component({
///  selector: 'my-map-cmp',
///  styles: [`
///   .map-container {
///     height: 300px;
///   }
/// `],
/// template: `
///   <x-map [latitude]="lat" [longitude]="lng" [zoom]="zoom">
///     <cluster-layer [Visible]="visible">
///         <map-marker [latitude]="lat" [longitude]="lng" [label]="'M'"></map-marker>
///     </cluster-layer>
///   </x-map>
/// `
/// })
/// ```
///
@Directive({
    selector: 'cluster-layer',
})
export class ClusterLayer extends MapLayer implements OnInit, OnDestroy, OnChanges {
    private _clusteringEnabled: boolean = true;
    private _zIndex: number;
    private _gridSize: number;
    private _layerOffset: IPoint;
    private _iconInfo: IMarkerIconInfo;
    private _iconCreationCallback: (m:Array<Marker>, i:IMarkerIconInfo) => string;

    @Input()
        public get ClusteringEnbabled():boolean  { return this._clusteringEnabled; }
        public set ClusteringEnbabled(val: boolean) { this._clusteringEnabled = val; }

    @Input()
        public get CustomMarkerCallback(): (m:Array<Marker>, i:IMarkerIconInfo) => string  { return this._iconCreationCallback; }
        public set CustomMarkerCallback(val: (m:Array<Marker>, i:IMarkerIconInfo) => string) { this._iconCreationCallback = val; }

    @Input()
        public get GridSize():number  { return this._gridSize; }
        public set GridSize(val: number) { this._gridSize = val; }

    @Input()
        public get IconInfo():IMarkerIconInfo  { return this._iconInfo; }
        public set IconInfo(val: IMarkerIconInfo) { this._iconInfo = val; }

    @Input()
        public get LayerOffset():IPoint  { return this._layerOffset; }
        public set LayerOffset(val: IPoint) { this._layerOffset = val; }

    @Input()
        public get ZIndex():number { return this._zIndex; }
        public set ZIndex(val: number) { this._zIndex = val; }



    constructor(_layerService: ClusterService, _containerRef: ViewContainerRef) {
        super(_layerService, _containerRef);
    }

    public ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if(!this._addedToManager) return;
        let options:IClusterOptions = { id: this._id };

        if (changes['ClusteringEnbabled']) options.clusteringEnabled = this._clusteringEnabled;
        if (changes['GridSize']) options.gridSize = this._gridSize;
        if (changes['LayerOffset']) options.layerOffset = this._layerOffset;
        if (changes['ZIndex']) options.zIndex = this._zIndex;
        if (changes['Visible']) options.visible = this._visible;

        this._layerService.GetNativeLayer(this).then((l:Layer) => {
            l.SetOptions(options);
        });

    }

}