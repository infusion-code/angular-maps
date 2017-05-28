import { Directive, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChange, ContentChildren, Input, ElementRef, ViewContainerRef } from "@angular/core";
import { Marker } from "../models/marker";
import { Layer } from "../models/layer";
import { ClusterPlacementMode } from "../models/clusterplacementmode";
import { ClusterClickAction } from "../models/clusterclickaction"; 
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
    selector: 'cluster-layer'
})
export class ClusterLayer extends MapLayer implements OnInit, OnDestroy, OnChanges {
    private _clusteringEnabled: boolean = true;
    private _clusterPlacementMode: ClusterPlacementMode = ClusterPlacementMode.MeanValue;
    private _clusterClickAction: ClusterClickAction = ClusterClickAction.ZoomIntoCluster;
    private _zIndex: number;
    private _gridSize: number;
    private _layerOffset: IPoint;
    private _iconInfo: IMarkerIconInfo;
    private _useDynamicSizeMarker: boolean = false;
    private _dynamicMarkerBaseSize: number = 18;
    private _dynamicMarkerRanges: Map<number, string> = new Map<number,string>([
        [10, 'rgba(255, 40, 40, 0.5)'],
        [100, 'rgba(20, 180, 20, 0.5)'],
        [Number.MAX_SAFE_INTEGER ,'rgba(255, 210, 40, 0.5)']
    ]);
    private _iconCreationCallback: (m:Array<Marker>, i:IMarkerIconInfo) => string;

    @Input()
        public get ClusterClickAction():ClusterClickAction  { return this._clusterClickAction; }
        public set ClusterClickAction(val: ClusterClickAction) { this._clusterClickAction = val; }

    @Input()
        public get ClusteringEnabled():boolean  { return this._clusteringEnabled; }
        public set ClusteringEnabled(val: boolean) { this._clusteringEnabled = val; }

    @Input()
        public get ClusterPlacementMode():ClusterPlacementMode  { return this._clusterPlacementMode; }
        public set ClusterPlacementMode(val: ClusterPlacementMode) { this._clusterPlacementMode = val; }

    @Input()
        public get CustomMarkerCallback(): (m:Array<Marker>, i:IMarkerIconInfo) => string  { return this._iconCreationCallback; }
        public set CustomMarkerCallback(val: (m:Array<Marker>, i:IMarkerIconInfo) => string) { 
            if(this._useDynamicSizeMarker) throw ("You cannot set a custom marker callback when UseDynamicSizeMarkers is set to true. Set UseDynamicSizeMakers to false.");
            this._iconCreationCallback = val; 
        }

    @Input()
        public get DynamicMarkerBaseSize():number  { return this._dynamicMarkerBaseSize; }
        public set DynamicMarkerBaseSize(val: number) { this._dynamicMarkerBaseSize = val; }

    @Input()
        public get DynamicMarkerRanges():Map<number, string>  { return this._dynamicMarkerRanges; }
        public set DynamicMarkerRanges(val: Map<number, string>) { this._dynamicMarkerRanges = val; }

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
        public get UseDynamicSizeMarkers():boolean { return this._useDynamicSizeMarker; }
        public set UseDynamicSizeMarkers(val: boolean) { 
            this._useDynamicSizeMarker = val; 
            if(val) {
                this._iconCreationCallback = (m: Array<Marker>, info: IMarkerIconInfo) => {
                    return ClusterLayer.CreateDynamicSizeMarker(m, info, this._dynamicMarkerBaseSize, this._dynamicMarkerRanges);
                }   
            } 
        }

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

    protected static CreateDynamicSizeMarker(m: Array<Marker>, info: IMarkerIconInfo, baseMarkerSize: number, ranges: Map<number, string>):string{
        let mr: number = baseMarkerSize;
        let outline: number = mr*0.35;
        let total: number = m.length;
        let r:number = Math.log(total) / Math.log(10) * 5 + mr;
        let d:number = r*2;
        let fillColor:string;
        ranges.forEach((v,k) => { 
            if(total <= k && !fillColor) fillColor = v; 
        });
        if(!fillColor) fillColor = 'rgba(20, 180, 20, 0.5)';

        //Create an SVG string of two circles, one on top of the other, with the specified radius and color.
        let svg: Array<any> = [`<svg xmlns="http://www.w3.org/2000/svg" width="${d}" height="${d}">`,
            `<circle cx="${r}" cy="${r}" r="${r}" fill="${fillColor}"/>`,
            `<circle cx="${r}" cy="${r}" r="${r - outline}" fill="${fillColor}"/>`,
            `</svg>`];
        info.size = { width: d, height: d };
        info.markerOffsetRatio = { x: 0.5, y: 0.5 };
        info.textOffset = { x: 0, y: r - 8 };
        return svg.join('');       
    }

}