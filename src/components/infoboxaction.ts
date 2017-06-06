import { Directive, Input, Output, EventEmitter } from '@angular/core';

/**
 * InfoBoxAction renders an action in an info window {@link InfoBox}
 *
 * ### Example
 * ```typescript
 * import {Component} from '@angular/core';
 * import {Map, MapMarker, InfoBox, InfoBoxAction} from '...';
 *
 * @Component({
 *  selector: 'my-map-cmp',
 *  styles: [`
 *    .map-container { height: 300px; }
 *  `],
 *  template: `
 *    <x-map [Latitude]="lat" [Longitude]="lng" [Zoom]="zoom">
 *      <map-marker [Latitude]="lat" [Longitude]="lng" [Label]="'M'">
 *        <info-box>
 *          <info-box-action [Label]="actionlabel" (ActionClicked)="actionClicked(this)"></info-box-action>
 *        </info-box>
 *      </map-marker>
 *    </x-map>
 *  `
 * })
 * ```
 *
 * @export
 * @class InfoBoxAction
 */
@Directive({
    selector: '[mapInfoBoxAction]'
})
export class InfoBoxActionDirective {

    /**
     * The label to display on the action
     *
     * @type {string}
     * @memberof InfoBoxAction
     */
    @Input()
    Label: string;

    /**
     * Emits an event when the action has been clicked
     *
     * @type {EventEmitter<void>}
     * @memberof InfoBoxAction
     */
    @Output()
    ActionClicked: EventEmitter<void> = new EventEmitter<void>();

}
