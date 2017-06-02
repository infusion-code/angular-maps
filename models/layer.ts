import { ILayerOptions } from '../interfaces/ilayeroptions';
import { Marker } from './marker';
import { InfoWindow } from './infowindow';

/**
 * Defines the contract for a map layer implementation. Deriving providers should implements this abstract
 * to provide concrete layer functionality for the map.
 *
 * @export
 * @abstract
 * @class Layer
 */
export abstract class Layer {

    ///
    /// Property definitions
    ///

    /**
     * Get the native primitive underneath the abstraction layer.
     *
     * @returns An object representing the native implementation of the layer in the underlying provider (such as
     * Microsoft.Maps.Layer).
     *
     * @memberof Layer
     */
    public abstract get NativePrimitve(): any;

    ///
    /// Public methods, Layer interface implementation
    ///

    /**
     * Adds an event listener for the layer.
     *
     * @param eventType string. Type of event to add (click, mouseover, etc). You can use any event that the underlying native
     * layer supports.
     * @param fn function. Handler to call when the event occurs.
     *
     * @memberof Layer
     */
    public abstract AddListener(eventType: string, fn: Function): void;

    /**
     * Adds an entity to the layer. Entities in this context should be model abstractions of concered map functionality (such
     * as marker, infowindow, polyline, polygon, etc..) Implementations of this method should not expect native implementation of
     * thise concepts, instead, the appropriate abstract model classes should be implemented for each provider
     *
     * @param entity Marker|InfoWindow|any. Entity to add to the layer.
     *
     * @memberof Layer
     */
    public abstract AddEntity(entity: Marker|InfoWindow|any): void;

    /**
     * Deletes the layer.
     *
     * @memberof Layer
     */
    public abstract Delete(): void;

    /**
     * Returns the options governing the behavior of the layer.
     *
     * @returns IClusterOptions. The layer options.
     *
     * @memberof Layer
     */
    public abstract GetOptions(): ILayerOptions;

    /**
     * Returns the visibility state of the layer.
     *
     * @returns Boolean. True is the layer is visible, false otherwise.
     *
     * @memberof Layer
     */
    public abstract GetVisible(): boolean

     /**
     * Removes an entity from the cluster layer. Entities in this context should be model abstractions of concered map functionality (such
     * as marker, infowindow, polyline, polygon, etc..) Implementations of this method should not expect native implementation of
     * thise concepts, instead, the appropriate abstract model classes should be implemented for each provider
     *
     * @param entity Marker|InfoWindow|any Entity to be removed from the layer.
     *
     * @memberof Layer
     */
    public abstract RemoveEntity(entity: Marker|InfoWindow|any): void;

     /**
     * Sets the entities for the cluster layer. Entities in this context should be model abstractions of concered map functionality (such
     * as marker, infowindow, polyline, polygon, etc..) Implementations of this method should not expect native implementation of
     * thise concepts, instead, the appropriate abstract model classes should be implemented for each provider
     *
     * @param entities Array<Marker>|Array<InfoWindow>|Array<any> containing the entities to add to the cluster.
     * This replaces any existing entities.
     *
     * @memberof Layer
     */
    public abstract SetEntities(entities: Array<Marker>|Array<InfoWindow>|Array<any>): void;

    /**
     * Sets the options for the cluster layer.
     *
     * @param options IClusterOptions containing the options enumeration controlling the layer behavior. The supplied options
     * are merged with the default/existing options.
     *
     * @memberof Layer
     */
    public abstract SetOptions(options: ILayerOptions): void;

    /**
     * Toggles the cluster layer visibility.
     *
     * @param visible Boolean true to make the layer visible, false to hide the layer.
     *
     * @memberof BingClusterLayer
     */
    public abstract SetVisible(visible: boolean): void;

}
