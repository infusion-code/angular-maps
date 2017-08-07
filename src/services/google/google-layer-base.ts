import { IMarkerOptions } from './../../interfaces/imarker-options';
import { IMarkerIconInfo } from './../../interfaces/imarker-icon-info';
import { Marker } from './../../models/marker';
import { Layer } from './../../models/layer';
import { MarkerTypeId } from './../../models/marker-type-id';
import { MapService } from './../map.service';
import { MapLayerDirective } from './../../components/map-layer';
import { LayerService } from './../layer.service';
import { GoogleMapService } from './google-map.service';
import { GoogleConversions } from './google-conversions';

/**
 * This abstract partially implements the contract for the {@link LayerService}
 * and {@link ClusterService} for the Google Maps archtiecture. It serves
 * as the base class for basic layer ({@link GoogleLayerService}) and cluster layer ({@link GoogleClusterLayer}).
 *
 * @export
 * @abstract
 * @class GoogleLayerBase
 */
export abstract class GoogleLayerBase {

    ///
    /// Field declarations
    ///
    protected abstract _layers: Map<MapLayerDirective, Promise<Layer>>;

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of GoogleLayerBase.
     * @param {MapService} _mapService - Concrete {@link MapService} implementation for Google Maps.
     * An instance of {@link GoogleMapService}.
     *
     * @memberof GoogleLayerBase
     */
    constructor(protected _mapService: MapService) { }

    ///
    /// Public methods
    ///

    /**
     * Adds a layer to the map.
     *
     * @abstract
     * @param {MapLayerDirective} layer - MapLayerDirective component object.
     * Generally, MapLayerDirective will be injected with an instance of the
     * LayerService and then self register on initialization.
     *
     * @memberof GoogleLayerBase
     */
    public abstract AddLayer(layer: MapLayerDirective): void;

    /**
     * Returns the Layer model represented by this layer.
     *
     * @abstract
     * @param {MapLayerDirective} layer - MapLayerDirective component object for which to retrieve the layer model.
     * @returns {Promise<Layer>} - A promise that when resolved contains the Layer model.
     *
     * @memberof GoogleLayerBase
     */
    public abstract GetNativeLayer(layer: MapLayerDirective): Promise<Layer>;

    /**
     * Deletes the layer
     *
     * @abstract
     * @param {MapLayerDirective} layer - MapLayerDirective component object for which to retrieve the layer.
     * @returns {Promise<void>} - A promise that is fullfilled when the layer has been removed.
     *
     * @memberof GoogleLayerBase
     */
    public abstract DeleteLayer(layer: MapLayerDirective): Promise<void>;

    /**
     * Creates a marker in the layer.
     *
     * @param {number} layer - The Id of the layer in which to create the marker.
     * @param {IMarkerOptions} options - {@link IMarkerOptions} object containing the marker properties.
     * @returns {Promise<Marker>} - A promise that when fullfilled contains the {@link Marker} model for the created marker.
     *
     * @memberof GoogleLayerBase
     */
    public CreateMarker(layer: number, options: IMarkerOptions): Promise<Marker> {
        return new Promise<Marker>((r, x) => {
            // TODO: needs implementation.
        });
    };

    ///
    /// Protected methods
    ///

    /**
     * Gets the layer based on its id.
     *
     * @protected
     * @param {number} id - Layer Id.
     * @returns {Promise<Layer>}  - A promise that when fullfilled contains the {@link Layer} model for the layer.
     *
     * @memberof GoogleLayerBase
     */
    protected GetLayerById(id: number): Promise<Layer> {
        let p: Promise<Layer>;
        this._layers.forEach((l: Promise<Layer>, k: MapLayerDirective) => { if (k.Id === id) { p = l; } });
        return p;
    }

}
