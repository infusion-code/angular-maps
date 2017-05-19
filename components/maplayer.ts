import { Directive, EventEmitter, OnInit, OnDestroy, OnChanges, AfterContentInit, SimpleChange, ContentChildren, Input, ElementRef } from "@angular/core";
import { LayerService } from "../services/layerservice";
import { MapMarker } from "./mapmarker";

let layerId:number = 0;

///
/// MapLayer creates a layer on a {@link Map}.
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
///     <map-layer [Visible]="visible">
///         <map-marker [latitude]="lat" [longitude]="lng" [label]="'M'"></map-marker>
///     </map-layer>
///   </x-map>
/// `
/// })
/// ```
///
@Directive({
    selector: 'map-layer',
})
export class MapLayer implements OnInit, OnDestroy, OnChanges, AfterContentInit {
    protected _visible: boolean = true;
    protected _addedToManager: boolean = false;
    protected _id: number;

    @ContentChildren(MapMarker) protected _markers: Array<MapMarker>;

    @Input()
    public get Visible(): boolean { return this._visible; }
    public set Visible(val: boolean) { this._visible = val; }

    public get Id(): number { return this._id; }

    constructor(protected _layerService: LayerService) {
        this._id = layerId++
    }

    public ngOnInit():void {
        this._layerService.AddLayer(this);
        this._addedToManager = true;
    }

    public ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if(!this._addedToManager) return;
        if (changes['Visible']) {
            this._layerService.GetNativeLayer(this).then(l => {
                l.SetVisible(!l.GetVisible());
            });
        }
    }

    public ngAfterContentInit():void {
       this._markers.forEach((m:MapMarker) => {
            m.InCustomLayer = true;
            m.LayerId = this._id;
            m.RegisterWithService();
        });
    }

    public ngOnDestroy(): void {
        this._layerService.DeleteLayer(this);
    }


}