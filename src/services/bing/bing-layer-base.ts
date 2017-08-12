import { IMarkerOptions } from './../../interfaces/imarker-options';
import { IMarkerIconInfo } from './../../interfaces/imarker-icon-info';
import { Marker } from './../../models/marker';
import { BingMarker } from './../../models/bing/bing-marker';
import { Layer } from './../../models/layer';
import { MarkerTypeId } from './../../models/marker-type-id';
import { MapService } from './../map.service';
import { MapLayerDirective } from './../../components/map-layer';
import { LayerService } from './../layer.service';
import { BingMapService } from './bing-map.service';
import { BingConversions } from './bing-conversions';

/**
 * This abstract partially implements the contract for the {@link LayerService}
 * and {@link ClusterService} for the Bing Maps V8 archtiecture. It serves
 * as the base class for basic layer ({@link BingLayerService}) and cluster layer ({@link BingClusterLayer}).
 *
 * @export
 * @abstract
 * @class BingLayerBase
 */
export abstract class BingLayerBase {

    ///
    /// Field declarations
    ///
    protected abstract _layers: Map<number, Promise<Layer>>;

    ///
    /// Constructor
    ///

    /**
     * Creates an instance of BingLayerBase.
     * @param {MapService} _mapService - Concrete {@link MapService} implementation for Bing Maps V8. An instance of {@link BingMapService}.
     *
     * @memberof BingLayerBase
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
     * @memberof BingLayerBase
     */
    public abstract AddLayer(layer: MapLayerDirective): void;

    /**
     * Returns the Layer model represented by this layer.
     *
     * @abstract
     * @param {MapLayerDirective} layer - MapLayerDirective component object for which to retrieve the layer model.
     * @returns {Promise<Layer>} - A promise that when resolved contains the Layer model.
     *
     * @memberof BingLayerBase
     */
    public abstract GetNativeLayer(layer: MapLayerDirective): Promise<Layer>;

    /**
     * Deletes the layer
     *
     * @abstract
     * @param {MapLayerDirective} layer - MapLayerDirective component object for which to retrieve the layer.
     * @returns {Promise<void>} - A promise that is fullfilled when the layer has been removed.
     *
     * @memberof BingLayerBase
     */
    public abstract DeleteLayer(layer: MapLayerDirective): Promise<void>;

    /**
     * Creates a marker in the layer.
     *
     * @param {number} layer - The Id of the layer in which to create the marker.
     * @param {IMarkerOptions} options - {@link IMarkerOptions} object containing the marker properties.
     * @returns {Promise<Marker>} - A promise that when fullfilled contains the {@link Marker} model for the created marker.
     *
     * @memberof BingLayerBase
     */
    public CreateMarker(layer: number, options: IMarkerOptions): Promise<Marker> {
        const payload = (icon: string, l: Layer): BingMarker => {
            const loc: Microsoft.Maps.Location = BingConversions.TranslateLocation(options.position);
            const o: Microsoft.Maps.IPushpinOptions = BingConversions.TranslateMarkerOptions(options);
            if (icon && icon !== '') { o.icon = icon; }
            const pushpin: Microsoft.Maps.Pushpin = new Microsoft.Maps.Pushpin(loc, o);
            const marker: BingMarker = new BingMarker(pushpin);
            marker.IsFirst = options.isFirst;
            marker.IsLast = options.isLast;
            if (options.metadata) { options.metadata.forEach((v, k) => marker.Metadata.set(k, v)); }
            l.AddEntity(marker);
            return marker;
        }
        const p: Promise<Layer> = this.GetLayerById(layer);
        if (p == null) { throw (new Error(`Layer with id ${layer} not found in Layer Map`)); }
        return p.then((l: Layer) => {
            if (options.iconInfo && options.iconInfo.markerType) {
                const s = Marker.CreateMarker(options.iconInfo);
                if (typeof(s) === 'string') { return(payload(s, l)); }
                else {
                    return s.then(x => {
                        return(payload(x.icon, l));
                    });
                }
            }
            else {
                return (payload(null, l));
            }
        });
    }

    /**
     * Creates an array of unbound markers. Use this method to create arrays of markers to be used in bulk
     * operations.
     *
     * @param {Array<IMarkerOptions>} options - Marker options defining the markers.
     * @param {IMarkerIconInfo} markerIcon - Optional information to generate custom markers. This will be applied to all markers.
     * @returns {Promise<Array<Marker>>} - A promise that when fullfilled contains the an arrays of the Marker models.
     *
     * @memberof BingLayerBase
     */
    public CreateMarkers(options: Array<IMarkerOptions>, markerIcon?: IMarkerIconInfo): Promise<Array<Marker>> {
        const payload = (icon: string, op: Array<IMarkerOptions>): Array<BingMarker> => {
            const markers: Array<BingMarker> = new Array<BingMarker>();
            op.forEach(mo => {
                const o: Microsoft.Maps.IPushpinOptions = BingConversions.TranslateMarkerOptions(mo);
                if (icon && icon !== '') { o.icon = icon; }
                const loc: Microsoft.Maps.Location = BingConversions.TranslateLocation(mo.position);
                const pushpin: Microsoft.Maps.Pushpin = new Microsoft.Maps.Pushpin(loc, o);
                const marker: BingMarker = new BingMarker(pushpin);
                marker.IsFirst = mo.isFirst;
                marker.IsLast = mo.isLast;
                if (mo.metadata) { mo.metadata.forEach((v, k) => marker.Metadata.set(k, v)); }
                markers.push(marker);
            });
            return markers;
        };
        const p: Promise<Array<Marker>> = new Promise<Array<Marker>>((resolve, reject) => {
            if (markerIcon && markerIcon.markerType) {
                const s = Marker.CreateMarker(markerIcon);
                if (typeof(s) === 'string') { resolve(payload(s, options)); }
                else {
                    return s.then(x => {
                        resolve(payload(x.icon, options));
                    });
                }
            }
            else {
                resolve(payload(null, options));
            }
        });
        return p;
    }

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
     * @memberof BingLayerBase
     */
    protected GetLayerById(id: number): Promise<Layer> {
        let p: Promise<Layer>;
        this._layers.forEach((l: Promise<Layer>, k: number) => { if (k === id) { p = l; } });
        return p;
    }

}
