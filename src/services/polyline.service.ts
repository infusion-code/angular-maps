import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { IPolylineOptions } from '../interfaces/ipolyline-options';
import { ILatLong } from '../interfaces/ilatlong';
import { Polyline } from '../models/polyline';
import { MapPolylineDirective } from '../components/map-polyline';

/**
 * The abstract class represents the contract defintions for a polyline service to be implemented by an acutaly underlying
 * map architecture.
 *
 * @export
 * @abstract
 * @class PolylineService
 */
@Injectable()
export abstract class PolylineService {

  /**
   * Adds a polyline to a map. Depending on the polyline context, the polyline will either by added to the map or a
   * correcsponding layer.
   *
   * @abstract
   * @param {MapPolylineDirective} polyline - The {@link MapPolylineDirective} to be added.
   *
   * @memberof PolylineService
   */
  public abstract AddPolyline(polyline: MapPolylineDirective): void;

  /**
    * Registers an event delegate for a marker.
    *
    * @abstract
    * @template T - Type of the event to emit.
    * @param {string} eventName - The name of the event to register (e.g. 'click')
    * @param {MapPolylineDirective} polyline - The {@link MapPolylineDirective} for which to register the event.
    * @returns {Observable<T>} - Observable emiting an instance of T each time the event occurs.
    *
    * @memberof PolylineService
    */
  public abstract CreateEventObservable<T>(eventName: string, polyline: MapPolylineDirective): Observable<T>;

  /**
    * Deletes a polyline.
    *
    * @abstract
    * @param {MapPolylineDirective} polyline - {@link MapPolylineDirective} to be deleted.
    * @returns {Promise<void>} - A promise fullfilled once the polyline has been deleted.
    *
    * @memberof PolylineService
    */
  public abstract DeletePolyline(polyline: MapPolylineDirective): Promise<void>;

  /**
   * Obtains geo coordinates for the marker on the click location
   *
   * @abstract
   * @param {(MouseEvent| any)} e - The mouse event.
   * @returns {ILatLong} - {@link ILatLong} containing the geo coordinates of the clicked marker.
   *
   * @memberof MarkerService
   */
  public abstract GetCoordinatesFromClick(e: MouseEvent | any): ILatLong;

  /**
   * Obtains the polyline model for the polyline allowing access to native implementation functionatiliy.
   *
   * @abstract
   * @param {MapPolylineDirective} polyline - The {@link MapPolylineDirective} for which to obtain the polyline model.
   * @returns {Promise<Polyline|Array<Polyline>>} - A promise that when fullfilled contains the {@link Polyline} implementation (or an
   * array of polylines) for complex paths of the underlying platform.
   *
   * @memberof PolylineService
   */
  public abstract GetNativePolyline(polyline: MapPolylineDirective): Promise<Polyline|Array<Polyline>>;

  /**
   * Set the polyline options.
   *
   * @abstract
   * @param {MapPolylineDirective} polyline - {@link MapPolylineDirective} to be updated.
   * @param {IPolylineOptions} options - {@link IPolylineOptions} object containing the options. Options will be merged with the
   * options already on the underlying object.
   * @returns {Promise<void>} - A promise fullfilled once the polyline options have been set.
   *
   * @memberof PolylineService
   */
  public abstract SetOptions(polyline: MapPolylineDirective, options: IPolylineOptions): Promise<void>;

  /**
   * Updates the Polyline path
   *
   * @abstract
   * @param {MapPolylineDirective} polyline - {@link MapPolylineDirective} to be updated.
   * @returns {Promise<void>} - A promise fullfilled once the polyline has been updated.
   *
   * @memberof PolylineService
   */
  public abstract UpdatePolyline(polyline: MapPolylineDirective): Promise<void>;

}
