import { Injectable } from '@angular/core';
import { InfoBoxComponent } from './../components/infobox';
import { IInfoWindowOptions } from './../interfaces/iinfowindowoptions';
import { ILatLong } from './../interfaces/ilatlong';

/**
 * This class defines the contract for an InfoBoxService. Each Map Architecture provider is expected the furnish a concrete implementation.
 *
 * @export
 * @abstract
 * @class InfoBoxService
 */
@Injectable()
export abstract class InfoBoxService {

    /**
     * Adds an info window to the map or layer.
     *
     * @abstract
     * @param {InfoBoxComponent} info - {@link InfoBoxComponent} component object representing the infobox.
     *
     * @memberof InfoBoxService
     */
    abstract AddInfoWindow(info: InfoBoxComponent): void;

    /**
     * Closes an infobox that is open.
     *
     * @abstract
     * @param {InfoBoxComponent} info - {@link InfoBoxComponent} component object representing the infobox.
     * @returns {Promise<void>} - A promise that is fullfilled when the infobox has been closed.
     *
     * @memberof InfoBoxService
     */
    abstract Close(info: InfoBoxComponent): Promise<void>;

    /**
     * Deletes an infobox.
     *
     * @abstract
     * @param {InfoBoxComponent} info - {@link InfoBoxComponent} component object representing the infobox.
     * @returns {Promise<void>} - A promise that is fullfilled when the infobox has been deleted.
     *
     * @memberof InfoBoxService
     */
    abstract DeleteInfoWindow(info: InfoBoxComponent): Promise<void>;

    /**
     * Opens an infobox that is closed.
     *
     * @abstract
     * @param {InfoBoxComponent} info - {@link InfoBoxComponent} component object representing the infobox.
     * @returns {Promise<void>} - A promise that is fullfilled when the infobox has been opened.
     *
     * @memberof InfoBoxService
     */
    abstract Open(info: InfoBoxComponent, loc?: ILatLong): Promise<void>;

    /**
     * Sets the infobox options.
     *
     * @abstract
     * @param {InfoBoxComponent} info - {@link InfoBoxComponent} component object representing the infobox.
     * @param {IInfoWindowOptions} options - {@link IInfoWindowOptions} object containing the options to set. Options provided are
     * merged with the existing options of the underlying infobox.
     * @returns {Promise<void>} - A promise that is fullfilled when the infobox options have been updated.
     *
     * @memberof InfoBoxService
     */
    abstract SetOptions(info: InfoBoxComponent, options: IInfoWindowOptions): Promise<void>;

    /**
     * Set the position of the infobox based on the properties set on the InfoBox component.
     *
     * @abstract
     * @param {InfoBoxComponent} info - {@link InfoBoxComponent} component object representing the infobox.
     * @param {ILatLong} latlng - The position to set
     * @returns {Promise<void>} - A promise that is fullfilled when the infobox position has been updated.
     *
     * @memberof InfoBoxService
     */
    abstract SetPosition(info: InfoBoxComponent, latlng?: ILatLong): Promise<void>;

}