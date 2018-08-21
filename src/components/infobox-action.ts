import { Directive, Input, Output, EventEmitter } from '@angular/core';

/**
 * InfoBoxAction renders an action in an info window {@link InfoBox}
 *
 * ### Example
 * ```typescript
 * import {Component} from '@angular/core';
 * import {MapComponent, MapMarkerDirective, InfoBoxComponent, InfoBoxActionDirective} from '...';
 *
 * @Component({
 *  selector: 'my-map-cmp',
 *  styles: [`
 *    .map-container { height: 300px; }
 *  `],
 *  template: `
 *    <x-map [Latitude]="lat" [Longitude]="lng" [Zoom]="zoom">
 *      <x-map-marker [Latitude]="lat" [Longitude]="lng" [Label]="'M'">
 *        <x-info-box>
 *          <x-info-box-action [Label]="actionlabel" (ActionClicked)="actionClicked(this)"></x-info-box-action>
 *        </x-info-box>
 *      </x-map-marker>
 *    </x-map>
 *  `
 * })
 * ```
 *
 * @export
 */
@Directive({
    selector: 'x-info-box-action'
})
export class InfoBoxActionDirective {

    /**
     * The label to display on the action
     *
     * @memberof InfoBoxActionDirective
     */
    @Input()
    Label: string;

    /**
     * Emits an event when the action has been clicked
     *
     * @memberof InfoBoxActionDirective
     */
    @Output()
    ActionClicked: EventEmitter<void> = new EventEmitter<void>();

}
