import { ILatLong } from './../interfaces/Ilatlong';
import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { IPolylineOptions } from '../interfaces/ipolylineoptions';
import { Polyline } from '../models/polyline';
import { MapPolylineComponent } from '../components/mappolyline';

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
   * @param {MapPolylineComponent} polyline - The {@link MapPolylineComponent} to be added.
   *
   * @memberof PolylineService
   */
  public abstract AddPolyline(polyline: MapPolylineComponent): void;

  /**
    * Registers an event delegate for a marker.
    *
    * @abstract
    * @template T - Type of the event to emit.
    * @param {string} eventName - The name of the event to register (e.g. 'click')
    * @param {MapPolylineComponent} polyline - The {@link MapPolylineComponent} for which to register the event.
    * @returns {Observable<T>} - Observable emiting an instance of T each time the event occurs.
    *
    * @memberof PolylineService
    */
  public abstract CreateEventObservable<T>(eventName: string, polyline: MapPolylineComponent): Observable<T>;

  /**
    * Deletes a polyline.
    *
    * @abstract
    * @param {MapPolylineComponent} polyline - {@link MapPolylineComponent} to be deleted.
    * @returns {Promise<void>} - A promise fullfilled once the polyline has been deleted.
    *
    * @memberof PolylineService
    */
  public abstract DeletePolyline(polyline: MapPolylineComponent): Promise<void>;

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
   * @param {MapPolylineComponent} polyline - The {@link MapPolylineComponent} for which to obtain the polyline model.
   * @returns {Promise<Polyline>} - A promise that when fullfilled contains the {@link Polyline} implementation of the underlying platform.
   *
   * @memberof PolylineService
   */
  public abstract GetNativeMarker(polyline: MapPolylineComponent): Promise<Polyline>;

  /**
   * Set the polyline options.
   *
   * @abstract
   * @param {MapPolylineComponent} polyline - {@link MapPolylineComponent} to be updated.
   * @param {IPolylineOptions} options - {@link IPolylineOptions} object containing the options. Options will be merged with the
   * options already on the underlying object.
   * @returns {Promise<void>} - A promise fullfilled once the polyline options have been set.
   *
   * @memberof PolylineService
   */
  public abstract SetOptions(polyline: MapPolylineComponent, options: IPolylineOptions): Promise<void>;

  /**
   * Updates the Polyline path
   *
   * @abstract
   * @param {MapPolylineComponent} polyline - {@link MapPolylineComponent} to be updated.
   * @returns {Promise<void>} - A promise fullfilled once the polyline has been updated.
   *
   * @memberof PolylineService
   */
  public abstract UpdatePolyline(polyline: MapPolylineComponent): Promise<void>;

}
