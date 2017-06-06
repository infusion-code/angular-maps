import { Injectable } from '@angular/core';
import { InfoBoxComponent } from '../components/infobox';
import { IInfoWindowOptions } from '../interfaces/iinfowindowoptions';
import { ILatLong } from '../interfaces/ilatlong';

@Injectable()
export abstract class InfoBoxService {

    /**
     * Creates a new instance of an info window
     *
     * @abstract
     * @param {InfoBoxComponent} info
     *
     * @memberof InfoBoxService
     */
    abstract AddInfoWindow(info: InfoBoxComponent): void;

    /**
     * Closes the info window
     *
     * @abstract
     * @param {InfoBoxComponent} info
     * @returns {Promise<void>}
     *
     * @memberof InfoBoxService
     */
    abstract Close(info: InfoBoxComponent): Promise<void>;

    /**
     * Deletes the info window
     *
     * @abstract
     * @param {InfoBoxComponent} info
     * @returns {Promise<void>}
     *
     * @memberof InfoBoxService
     */
    abstract DeleteInfoWindow(info: InfoBoxComponent): Promise<void>;

    /**
     * Opens the info window
     *
     * @abstract
     * @param {InfoBoxComponent} info
     * @param {ILatLong} [loc]
     * @returns {Promise<void>}
     *
     * @memberof InfoBoxService
     */
    abstract Open(info: InfoBoxComponent, loc?: ILatLong): Promise<void>;

    /**
     * Sets the options on the info window
     *
     * @abstract
     * @param {InfoBoxComponent} info
     * @param {IInfoWindowOptions} options
     * @returns {Promise<void>}
     *
     * @memberof InfoBoxService
     */
    abstract SetOptions(info: InfoBoxComponent, options: IInfoWindowOptions): Promise<void>;

    /**
     * Sets the position of the info window
     *
     * @abstract
     * @param {InfoBoxComponent} info
     * @param {ILatLong} latlng
     * @returns {Promise<void>}
     *
     * @memberof InfoBoxService
     */
    abstract SetPosition(info: InfoBoxComponent, latlng: ILatLong): Promise<void>;

}
