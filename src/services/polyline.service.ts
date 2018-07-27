import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
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
 */
@Injectable()
export abstract class PolylineService {

  /**
   * Adds a polyline to a map. Depending on the polyline context, the polyline will either by added to the map or a
   * correcsponding layer.
   *
   * @abstract
   * @param polyline - The {@link MapPolylineDirective} to be added.
   *
   * @memberof PolylineService
   */
  public abstract AddPolyline(polyline: MapPolylineDirective): void;

  /**
    * Registers an event delegate for a marker.
    *
    * @abstract
    * @param eventName - The name of the event to register (e.g. 'click')
    * @param polyline - The {@link MapPolylineDirective} for which to register the event.
    * @returns - Observable emiting an instance of T each time the event occurs.
    *
    * @memberof PolylineService
    */
  public abstract CreateEventObservable<T>(eventName: string, polyline: MapPolylineDirective): Observable<T>;

  /**
    * Deletes a polyline.
    *
    * @abstract
    * @param polyline - {@link MapPolylineDirective} to be deleted.
    * @returns - A promise fullfilled once the polyline has been deleted.
    *
    * @memberof PolylineService
    */
  public abstract DeletePolyline(polyline: MapPolylineDirective): Promise<void>;

  /**
   * Obtains geo coordinates for the marker on the click location
   *
   * @abstract
   * @param e - The mouse event.
   * @returns - {@link ILatLong} containing the geo coordinates of the clicked marker.
   *
   * @memberof MarkerService
   */
  public abstract GetCoordinatesFromClick(e: MouseEvent | any): ILatLong;

  /**
   * Obtains the polyline model for the polyline allowing access to native implementation functionatiliy.
   *
   * @abstract
   * @param polyline - The {@link MapPolylineDirective} for which to obtain the polyline model.
   * @returns - A promise that when fullfilled contains the {@link Polyline} implementation (or an
   * array of polylines) for complex paths of the underlying platform.
   *
   * @memberof PolylineService
   */
  public abstract GetNativePolyline(polyline: MapPolylineDirective): Promise<Polyline|Array<Polyline>>;

  /**
   * Set the polyline options.
   *
   * @abstract
   * @param polyline - {@link MapPolylineDirective} to be updated.
   * @param options - {@link IPolylineOptions} object containing the options. Options will be merged with the
   * options already on the underlying object.
   * @returns - A promise fullfilled once the polyline options have been set.
   *
   * @memberof PolylineService
   */
  public abstract SetOptions(polyline: MapPolylineDirective, options: IPolylineOptions): Promise<void>;

  /**
   * Updates the Polyline path
   *
   * @abstract
   * @param polyline - {@link MapPolylineDirective} to be updated.
   * @returns - A promise fullfilled once the polyline has been updated.
   *
   * @memberof PolylineService
   */
  public abstract UpdatePolyline(polyline: MapPolylineDirective): Promise<void>;

}
