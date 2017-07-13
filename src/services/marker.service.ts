import { Injectable, NgZone } from '@angular/core';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';
import { IPoint } from '../interfaces/ipoint';
import { ILatLong } from '../interfaces/ilatlong';
import { Marker } from '../models/marker';
import { MapMarkerDirective } from '../components/map-marker';

/**
 * The abstract class represents the contract defintions for a marker service to be implemented by an acutaly underlying
 * map architecture.
 *
 * @export
 * @abstract
 * @class MarkerService
 */
@Injectable()
export abstract class MarkerService {

    /**
     * Adds a marker. Depending on the marker context, the marker will either by added to the map or a correcsponding layer.
     *
     * @abstract
     * @param {MapMarkerDirective} marker - The {@link MapMarkerDirective} to be added.
     *
     * @memberof MarkerService
     */
    public abstract AddMarker(marker: MapMarkerDirective): void;

    /**
     * Registers an event delegate for a marker.
     *
     * @abstract
     * @template T - Type of the event to emit.
     * @param {string} eventName - The name of the event to register (e.g. 'click')
     * @param {MapMarkerDirective} marker - The {@link MapMarker} for which to register the event.
     * @returns {Observable<T>} - Observable emiting an instance of T each time the event occurs.
     *
     * @memberof MarkerService
     */
    public abstract CreateEventObservable<T>(eventName: string, marker: MapMarkerDirective): Observable<T>;

    /**
     * Deletes a marker.
     *
     * @abstract
     * @param {MapMarkerDirective} marker - {@link MapMarkerDirective} to be deleted.
     * @returns {Promise<void>} - A promise fullfilled once the marker has been deleted.
     *
     * @memberof MarkerService
     */
    public abstract DeleteMarker(marker: MapMarkerDirective): Promise<void>;

    /**
     * Obtains geo coordinates for the marker on the click location
     *
     * @abstract
     * @param {(MouseEvent| any)} e - The mouse event.
     * @returns {ILatLong} - {@link ILatLong} containing the geo coordinates of the clicked marker.
     *
     * @memberof MarkerService
     */
    public abstract GetCoordinatesFromClick(e: MouseEvent| any): ILatLong;

    /**
     * Obtains the marker model for the marker allowing access to native implementation functionatiliy.
     *
     * @abstract
     * @param {MapMarkerDirective} marker - The {@link MapMarkerDirective} for which to obtain the marker model.
     * @returns {Promise<Marker>} - A promise that when fullfilled contains the {@link Marker} implementation of the underlying platform.
     *
     * @memberof MarkerService
     */
    public abstract GetNativeMarker(marker: MapMarkerDirective): Promise<Marker>;

    /**
     * Obtains the marker pixel location for the marker on the click location
     *
     * @abstract
     * @param {(MouseEvent| any)} e - The mouse event.
     * @returns {IPoint} - {@link ILatLong} containing the pixels of the marker on the map canvas.
     *
     * @memberof MarkerService
     */
    public abstract GetPixelsFromClick(e: MouseEvent| any): IPoint;

    /**
     * Converts a geo location to a pixel location relative to the map canvas.
     *
     * @abstract
     * @param {(MapMarkerDirective | ILatLong)} target - Either a {@link MapMarkerDirective} or a {@link ILatLong}
     * for the basis of translation.
     * @returns {Promise<IPoint>} - A promise that when fullfilled contains a {@link IPoint}
     * with the pixel coordinates of the MapMarkerDirective or ILatLong relative to the map canvas.
     *
     * @memberof MarkerService
     */
    public abstract LocationToPoint(target: MapMarkerDirective | ILatLong): Promise<IPoint>;

    /**
     * Updates the anchor position for the marker.
     *
     * @abstract
     * @param {MapMarkerDirective} - The {@link MapMarkerDirective} object for which to upate the anchor.
     * Anchor information is present in the underlying {@link Marker} model object.
     * @returns {Promise<void>} - A promise that is fullfilled when the anchor position has been updated.
     *
     * @memberof MarkerService
     */
    public abstract UpdateAnchor(maker: MapMarkerDirective): Promise<void>;

    /**
     * Updates whether the marker is draggable.
     *
     * @abstract
     * @param {MapMarkerDirective} - The {@link MapMarkerDirective} object for which to upate dragability.
     * Dragability information is present in the underlying {@link Marker} model object.
     * @returns {Promise<void>} - A promise that is fullfilled when the marker has been updated.
     *
     * @memberof MarkerService
     */
    public abstract UpdateDraggable(marker: MapMarkerDirective): Promise<void>;

    /**
     * Updates the Icon on the marker.
     *
     * @abstract
     * @param {MapMarkerDirective} - The {@link MapMarkerDirective} object for which to upate the icon.
     * Icon information is present in the underlying {@link Marker} model object.
     * @returns {Promise<void>} - A promise that is fullfilled when the icon information has been updated.
     *
     * @memberof MarkerService
     */
    public abstract UpdateIcon(marker: MapMarkerDirective): Promise<void>;

    /**
     * Updates the label on the marker.
     *
     * @abstract
     * @param {MapMarkerDirective} - The {@link MapMarkerDirective} object for which to upate the label.
     * Label information is present in the underlying {@link Marker} model object.
     * @returns {Promise<void>} - A promise that is fullfilled when the label has been updated.
     *
     * @memberof MarkerService
     */
    public abstract UpdateLabel(marker: MapMarkerDirective): Promise<void>;

    /**
     * Updates the geo coordinates for the marker.
     *
     * @abstract
     * @param {MapMarkerDirective} - The {@link MapMarkerDirective} object for which to upate the coordinates.
     * Coordinate information is present in the underlying {@link Marker} model object.
     * @returns {Promise<void>} - A promise that is fullfilled when the position has been updated.
     *
     * @memberof MarkerService
     */
    public abstract UpdateMarkerPosition(marker: MapMarkerDirective): Promise<void>;

    /**
     * Updates the title on the marker.
     *
     * @abstract
     * @param {MapMarkerDirective} - The {@link MapMarkerDirective} object for which to upate the title.
     * Title information is present in the underlying {@link Marker} model object.
     * @returns {Promise<void>} - A promise that is fullfilled when the title has been updated.
     *
     * @memberof MarkerService
     */
    public abstract UpdateTitle(marker: MapMarkerDirective): Promise<void>;

}
