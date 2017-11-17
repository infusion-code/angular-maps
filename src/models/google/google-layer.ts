import { eachSeries, nextTick } from 'async';
import { GoogleMarker } from './google-marker';
import { ILayerOptions } from '../../interfaces/ilayer-options';
import { MapService } from '../../services/map.service';
import { Layer } from '../layer';
import { Marker } from '../marker';
import { InfoWindow } from '../info-window';
import { Polygon } from '../polygon';
import { Polyline } from '../polyline';
import { ClusterPlacementMode } from '../cluster-placement-mode';
import * as GoogleMapTypes from '../../services/google/google-map-types';

/**
 * Concrete implementation of a layer for the Google Map Provider.
 *
 * @export
 * @class GoogleMarkerClusterer
 * @implements {Layer}
 */
export class GoogleLayer implements Layer {

    ///
    /// Field declarations
    ///
    private _entities: Array<Marker|InfoWindow|Polygon|Polyline> = new Array<Marker|InfoWindow|Polygon|Polyline>();
    private _visible: boolean = true;

    ///
    /// Property definitions
    ///

    /**
     * Get the native primitive underneath the abstraction layer. Google does not have the concept of a custom layer,
     * so we are returning the Map as the native object because it hosts all the markers.
     *
     * @returns GoogleMapTypes.GoogleMap.
     *
     * @memberof GoogleLayer
     */
    public get NativePrimitve(): GoogleMapTypes.GoogleMap {
        return this._layer;
    }

    ///
    /// Constructor
    ///

    /**
     * Creates a new instance of the GoogleMarkerClusterer class.
     *
     * @param _layer GoogleMapTypes.MarkerClusterer. Native Google Maps Marker Clusterer supporting the cluster layer.
     * @param _maps MapService. MapService implementation to leverage for the layer.
     *
     * @memberof GoogleLayer
     */
    constructor(private _layer: GoogleMapTypes.GoogleMap, private _maps: MapService, private _id: number) { }


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
     * @memberof GoogleLayer
     */
    public AddListener(eventType: string, fn: Function): void {
        throw (new Error('Events are not supported on Google Layers. You can still add events to individual markers.'));
    }

    /**
     * Adds an entity to the layer. Use this method with caution as it will
     * trigger a recaluation of the clusters (and associated markers if approprite) for
     * each invocation. If you use this method to add many markers to the cluster, use
     *
     * @param entity Marker|InfoWindow|Polygon|Polyline. Entity to add to the layer.
     *
     * @memberof GoogleLAyer
     */
    public AddEntity(entity: Marker | InfoWindow | Polygon | Polyline): void {
        if (entity.NativePrimitve) {
            this._entities.push(entity);
            entity.NativePrimitve.setMap(this.NativePrimitve);
        }
    }

    /**
     * Adds a number of entities to the layer. Entities in this context should be model abstractions of concered map functionality (such
     * as marker, infowindow, polyline, polygon, etc..)
     *
     * @param entities Array<Marker|InfoWindow|Polygon|Polyline>. Entities to add to the layer.
     *
     * @memberof GoogleLAyer
     */
    public AddEntities(entities: Array<Marker|InfoWindow|Polygon|Polyline>): void {
        if (entities != null && Array.isArray(entities) && entities.length !== 0 ) {
            this._entities.push(...entities);
            eachSeries([...entities], (e, next) => {
                e.NativePrimitve.setMap(this.NativePrimitve);
                nextTick(() => next());
            });
        }
    };

    /**
     * Deletes the layer anbd the markers in it.
     *
     * @memberof GoogleLayer
     */
    public Delete(): void {
        eachSeries(this._entities.splice(0), (e, next) => {
            e.NativePrimitve.setMap(null);
            nextTick(() => next());
        });
    }

    /**
     * Returns the options governing the behavior of the layer.
     *
     * @returns ILayerOptions. The layer options.
     *
     * @memberof GoogleLayer
     */
    public GetOptions(): ILayerOptions {
        const options: ILayerOptions = {
            id: this._id
        };
        return options;
    }

    /**
     * Returns the visibility state of the layer.
     *
     * @returns Boolean. True is the layer is visible, false otherwise.
     *
     * @memberof GoogleLayer
     */
    public GetVisible(): boolean {
        return this._visible;
    }

    /**
     * Removes an entity from the layer.
     *
     * @param entity Marker|InfoWindow|Polygon|Polyline Entity to be removed from the layer.
     *
     * @memberof GoogleLayer
     */
    public RemoveEntity(entity: Marker | InfoWindow | Polygon | Polyline): void {
        if (entity.NativePrimitve) {
            const j: number = this._entities.indexOf(entity);
            if (j > -1) { this._entities.splice(j, 1); }
            entity.NativePrimitve.setMap(null);
        }
    }

    /**
     * Sets the entities for the cluster layer.
     *
     * @param entities Array<Marker>|Array<InfoWindow>|Array<Polygon>|Array<Polyline> containing
     * the entities to add to the cluster. This replaces any existing entities.
     *
     * @memberof GoogleLayer
     */
    public SetEntities(entities: Array<Marker> | Array<InfoWindow> | Array<Polygon> | Array<Polyline>): void {
        this.Delete();
        this.AddEntities(entities);
    }

    /**
     * Sets the options for the cluster layer.
     *
     * @param options ILayerOptions containing the options enumeration controlling the layer behavior. The supplied options
     * are merged with the default/existing options.
     *
     * @memberof GoogleLayer
     */
    public SetOptions(options: ILayerOptions): void {
        this._id = options.id;
    }

    /**
     * Toggles the cluster layer visibility.
     *
     * @param visible Boolean true to make the layer visible, false to hide the layer.
     *
     * @memberof GoogleMarkerClusterer
     */
    public SetVisible(visible: boolean): void {
        eachSeries([...this._entities], (e, next) => {
            e.NativePrimitve.setVisible(visible);
            nextTick(() => next());
        });
        this._visible = visible;
    }

}
