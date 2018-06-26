import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { IPolygonOptions } from '../interfaces/ipolygon-options';
import { ILatLong } from '../interfaces/ilatlong';
import { Polygon } from '../models/polygon';
import { MapPolygonDirective } from '../components/map-polygon';

/**
 * The abstract class represents the contract defintions for a polygon service to be implemented by an acutaly underlying
 * map architecture.
 *
 * @export
 * @abstract
 */
@Injectable()
export abstract class PolygonService {

  /**
   * Adds a polygon to a map. Depending on the polygon context, the polygon will either by added to the map or a
   * correcsponding layer.
   *
   * @abstract
   * @param polygon - The {@link MapPolygonDirective} to be added.
   *
   * @memberof PolygonService
   */
  public abstract AddPolygon(polygon: MapPolygonDirective): void;

  /**
    * Registers an event delegate for a marker.
    *
    * @abstract
    * @param eventName - The name of the event to register (e.g. 'click')
    * @param polygon - The {@link MapPolygonDirective} for which to register the event.
    * @returns - Observable emiting an instance of T each time the event occurs.
    *
    * @memberof PolygonService
    */
  public abstract CreateEventObservable<T>(eventName: string, polygon: MapPolygonDirective): Observable<T>;

  /**
    * Deletes a polygon.
    *
    * @abstract
    * @param polygon - {@link MapPolygonDirective} to be deleted.
    * @returns - A promise fullfilled once the polygon has been deleted.
    *
    * @memberof PolygonService
    */
  public abstract DeletePolygon(polygon: MapPolygonDirective): Promise<void>;

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
   * Obtains the polygon model for the polygon allowing access to native implementation functionatiliy.
   *
   * @abstract
   * @param polygon - The {@link MapPolygonDirective} for which to obtain the polygon model.
   * @returns - A promise that when fullfilled contains the {@link Polygon} implementation of the underlying platform.
   *
   * @memberof PolygonService
   */
  public abstract GetNativePolygon(polygon: MapPolygonDirective): Promise<Polygon>;

  /**
   * Set the polygon options.
   *
   * @abstract
   * @param polygon - {@link MapPolygonDirective} to be updated.
   * @param options - {@link IPolygonOptions} object containing the options. Options will be merged with the
   * options already on the underlying object.
   * @returns - A promise fullfilled once the polygon options have been set.
   *
   * @memberof PolygonService
   */
  public abstract SetOptions(polygon: MapPolygonDirective, options: IPolygonOptions): Promise<void>;

  /**
   * Updates the Polygon path
   *
   * @abstract
   * @param polygon - {@link MapPolygonDirective} to be updated.
   * @returns - A promise fullfilled once the polygon has been updated.
   *
   * @memberof PolygonService
   */
  public abstract UpdatePolygon(polygon: MapPolygonDirective): Promise<void>;

}
