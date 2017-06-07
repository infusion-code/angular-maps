import { Injectable } from '@angular/core';
import { InfoBox } from "../components/infobox";
import { IInfoWindowOptions } from "../interfaces/iinfowindowoptions";
import { ILatLong } from "../interfaces/ilatlong";

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
     * @param {InfoBox} info - {@link InfoBox} component object representing the infobox. 
     * 
     * @memberof InfoBoxService
     */
    abstract AddInfoWindow(info: InfoBox): void;

    /**
     * Closes an infobox that is open.
     * 
     * @abstract
     * @param {InfoBox} info - {@link InfoBox} component object representing the infobox. 
     * @returns {Promise<void>} - A promise that is fullfilled when the infobox has been closed.
     * 
     * @memberof InfoBoxService
     */
    abstract Close(info: InfoBox): Promise<void>;

    /**
     * Deletes an infobox. 
     * 
     * @abstract
     * @param {InfoBox} info - {@link InfoBox} component object representing the infobox. 
     * @returns {Promise<void>} - A promise that is fullfilled when the infobox has been deleted.
     * 
     * @memberof InfoBoxService
     */
    abstract DeleteInfoWindow(info: InfoBox): Promise<void>;

    /**
     * Opens an infobox that is closed.
     * 
     * @abstract
     * @param {InfoBox} info - {@link InfoBox} component object representing the infobox. 
     * @returns {Promise<void>} - A promise that is fullfilled when the infobox has been opened.
     * 
     * @memberof InfoBoxService
     */
    abstract Open(info: InfoBox, loc?: ILatLong): Promise<void>;

    /**
     * Sets the infobox options.
     * 
     * @abstract
     * @param {InfoBox} info - {@link InfoBox} component object representing the infobox. 
     * @param {IInfoWindowOptions} options - {@link IInfoWindowOptions} object containing the options to set. Options provided are
     * merged with the existing options of the underlying infobox. 
     * @returns {Promise<void>} - A promise that is fullfilled when the infobox options have been updated.
     * 
     * @memberof InfoBoxService
     */
    abstract SetOptions(info: InfoBox, options: IInfoWindowOptions): Promise<void>;

    /**
     * Set the position of the infobox based on the properties set on the InfoBox component. 
     * 
     * @abstract
     * @param {InfoBox} info - {@link InfoBox} component object representing the infobox. 
     * @returns {Promise<void>} - A promise that is fullfilled when the infobox position has been updated.
     * 
     * @memberof InfoBoxService
     */
    abstract SetPosition(info: InfoBox): Promise<void>;

}