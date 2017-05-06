import { Directive, Input, Output, EventEmitter } from "@angular/core";

///
/// InfoBoxAction renders an action in an info window {@link InfoBox}
///
/// ### Example
/// ```typescript
/// import {Component} from '@angular/core';
/// import {Map, MapMarker, InfoBox, InfoBoxAction} from '...';
///
/// @Component({
///  selector: 'my-map-cmp',
///  styles: [`
///    .map-container { height: 300px; }
///  `],
///  template: `
///    <x-map [latitude]="lat" [longitude]="lng" [zoom]="zoom">
///      <map-marker [latitude]="lat" [longitude]="lng" [label]="'M'">
///        <info-box>
///          <info-box-action [label]="actionlabel" (actionClicked)="actionClicked(this)"></info-box-action>
///        </info-box>
///      </map-marker>
///    </x-map>
///  `
/// })
/// ```
///
@Directive({
    selector: 'info-box-action'
})
export class InfoBoxAction {
    ///
    /// The label to display on the action
    ///
    @Input()
    label: string;

    ///
    /// Emits an event when the action has been clicked
    ///
    @Output()
    actionClicked: EventEmitter<void> = new EventEmitter<void>();

}