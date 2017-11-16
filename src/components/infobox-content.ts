import { Directive, Output, EventEmitter } from '@angular/core';
import { INotificationEvent } from '../interfaces/inotification-event';

/**
 * InfoBoxContentComponent is an abstract base class to serve as base for components to be
 * used inside the x-info-box component to impement complex behaviors.
 *
 * @abstract
 * @export
 * @class InfoBoxContentComponent
 */
export abstract class InfoBoxContentComponent {

    /**
     * Emits notification events.
     *
     * @type {EventEmitter<INotificationEvent>}
     * @memberof InfoBoxContentComponent
     */
    @Output() public Notification: EventEmitter<INotificationEvent> = new EventEmitter<INotificationEvent>();

}
