import { eachSeries, nextTick } from 'async';
import { ILayerOptions } from '../../interfaces/ilayer-options';
import { Layer } from '../layer';
import { Marker } from '../marker';
import { Polygon } from '../polygon';
import { Polyline } from '../polyline';
import { InfoWindow } from '../info-window';
import { BingMapService } from '../../services/bing/bing-map.service';
import { MapService} from '../../services/map.service';

/**
 * Concrete implementation of a map layer for the Bing Map Provider.
 *
 * @export
 */
export class BingLayer implements Layer {

    private _pendingEntities: Array<Marker|InfoWindow|Polygon|Polyline> = new Array<Marker|InfoWindow|Polygon|Polyline>();

    ///
    /// Property definitions
    ///

    /**
     * Get the native primitive underneath the abstraction layer.
     *
     * @returns Microsoft.Maps.Layer.
     *
     * @memberof BingLayer
     */
    public get NativePrimitve(): any {
        return this._layer;
    }

    ///
    /// Constructor
    ///

    /**
     * Creates a new instance of the BingClusterLayer class.
     *
     * @param _layer Microsoft.Maps.ClusterLayer. Native Bing Cluster Layer supporting the cluster layer.
     * @param _maps MapService. MapService implementation to leverage for the layer.
     *
     * @memberof BingLayer
     */
    constructor(private _layer: Microsoft.Maps.Layer, private _maps: MapService) { }


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
     * @memberof BingLayer
     */
    public AddListener(eventType: string, fn: Function): void {
        Microsoft.Maps.Events.addHandler(this._layer, eventType, (e) => {
            fn(e);
        });
    }

    /**
     * Adds an entity to the layer.
     *
     * @param entity Marker|InfoWindow|Polygon|Polyline. Entity to add to the layer.
     *
     * @memberof BingLayer
     */
    public AddEntity(entity: Marker|InfoWindow|Polygon|Polyline): void {
        if (entity && entity.NativePrimitve) {
            if (this.GetVisible()) {
                this._layer.add(entity.NativePrimitve);
            }
            else {
                this._pendingEntities.push(entity);
            }
        }
    }

    /**
     * Adds a number of entities to the layer. Entities in this context should be model abstractions of concered map functionality (such
     * as marker, infowindow, polyline, polygon, etc..)
     *
     * @param entities Array<Marker|InfoWindow|Polygon|Polyline>. Entities to add to the layer.
     *
     * @memberof BingLayer
     */
    public AddEntities(entities: Array<Marker|InfoWindow|Polygon|Polyline>): void {
        //
        // use eachSeries as opposed to _layer.add([]) to provide a non-blocking experience for larger data sets.
        //
        if (entities != null && Array.isArray(entities) && entities.length !== 0 ) {
            eachSeries([...entities], (e, next) => {
                if (this.GetVisible()) {
                    this._layer.add(e.NativePrimitve);
                }
                else {
                    this._pendingEntities.push(e);
                }
                nextTick(() => next());
            });
        }
    }

    /**
     * Deletes the layer.
     *
     * @memberof BingLayer
     */
    public Delete(): void {
        this._maps.DeleteLayer(this);
    }

    /**
     * Returns the options governing the behavior of the layer.
     *
     * @returns IClusterOptions. The layer options.
     *
     * @memberof BingLayer
     */
    public GetOptions(): ILayerOptions {
        const o: ILayerOptions = {
            id: Number(this._layer.getId())
        };
        return o;
    }

    /**
     * Returns the visibility state of the layer.
     *
     * @returns Boolean. True is the layer is visible, false otherwise.
     *
     * @memberof BingLayer
     */
    public GetVisible(): boolean  {
        return this._layer.getVisible();
    }

    /**
     * Removes an entity from the cluster layer.
     *
     * @param entity Marker|InfoWindow|Polygon|Polyline to be removed from the layer.
     *
     * @memberof BingLayer
     */
    public RemoveEntity(entity: Marker|InfoWindow|Polygon|Polyline): void {
        if (entity.NativePrimitve) {
            this._layer.remove(entity.NativePrimitve);
        }
    }

    /**
     * Sets the entities for the cluster layer.
     *
     * @param entities Array<Marker>|Array<InfoWindow>|Array<Polygon>|Array<Polyline> containing the entities to add to the cluster.
     * This replaces any existing entities.
     *
     * @memberof BingLayer
     */
    public SetEntities(entities: Array<Marker>|Array<InfoWindow>|Array<Polygon>|Array<Polyline>): void {
        //
        // we are using removal and add as opposed to set as for large number of objects it yields a non-blocking, smoother performance...
        //
        this._layer.setPrimitives([]);
        this.AddEntities(entities);

    }

    /**
     * Sets the options for the cluster layer.
     *
     * @param options IClusterOptions containing the options enumeration controlling the layer behavior. The supplied options
     * are merged with the default/existing options.
     *
     * @memberof BingLayer
     */
    public SetOptions(options: ILayerOptions) {
        this._layer.metadata.id = options.id.toString();
    }

    /**
     * Toggles the cluster layer visibility.
     *
     * @param visible Boolean true to make the layer visible, false to hide the layer.
     *
     * @memberof BingLayer
     */
    public SetVisible(visible: boolean): void {
        this._layer.setVisible(visible);
        if (visible && this._pendingEntities.length > 0) {
            this.AddEntities(this._pendingEntities.splice(0));
        }
    }

}
