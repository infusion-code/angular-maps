import { Directive, Input, Output, OnDestroy, OnChanges,
    EventEmitter, ContentChild, AfterContentInit, SimpleChanges
} from '@angular/core';
import { IPoint } from '../interfaces/ipoint';
import { ILatLong } from '../interfaces/ilatlong';
import { InfoBoxComponent } from './infobox';

///
/// MapMarker renders a map marker inside a {@link Map}.
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
///      <map-marker [latitude]="lat" [longitude]="lng" [label]="'M'"></map-marker>
///   </x-map>
/// `
/// })
/// ```
///
@Directive({
    selector: '[mapPolygon]'
})
export class PolygonDirective implements OnDestroy, OnChanges, AfterContentInit {
    ngAfterContentInit(): void {
        throw new Error('Method not implemented.');
    }

    ngOnChanges(changes: SimpleChanges): void {
        throw new Error('Method not implemented.');
    }
    ngOnDestroy(): void {
        throw new Error('Method not implemented.');
    }

}
