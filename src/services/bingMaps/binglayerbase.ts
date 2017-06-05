import { IMarkerOptions }   from "../../interfaces/imarkeroptions";
import { IMarkerIconInfo }  from "../../interfaces/imarkericoninfo";
import { Marker }           from '../../models/marker';
import { Layer }            from '../../models/layer';
import { MarkerTypeId }     from "../../models/markertypeid";
import { BingMarker }       from '../../models/bingmaps/bingmarker';
import { MapLayer }         from "../../components/maplayer";
import { MapService }       from "../mapservice";
import { LayerService }     from "../layerservice";
import { BingMapService }   from "./bingmapservice";
import { BingConversions }  from "./bingconversions";

/**
 * This abstract partially implements the contract for the {@link LayerService} and {@link ClusterService} for the Bing Maps V8 archtiecture. It serves
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
    protected abstract _layers: Map<MapLayer, Promise<Layer>>;

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
     * @param {MapLayer} layer - MapLayer component object. Generally, MapLayer will be injected with an instance of the 
     * LayerService and then self register on initialization. 
     * 
     * @memberof BingLayerBase
     */
    public abstract AddLayer(layer: MapLayer): void;

    /**
     * Returns the Layer model represented by this layer. 
     * 
     * @abstract
     * @param {MapLayer} layer - MapLayer component object for which to retrieve the layer model.
     * @returns {Promise<Layer>} - A promise that when resolved contains the Layer model. 
     * 
     * @memberof BingLayerBase
     */
    public abstract GetNativeLayer(layer: MapLayer): Promise<Layer>;

    /**
     * Deletes the layer
     * 
     * @abstract
     * @param {MapLayer} layer - MapLayer component object for which to retrieve the layer.
     * @returns {Promise<void>} - A promise that is fullfilled when the layer has been removed. 
     * 
     * @memberof BingLayerBase
     */
    public abstract DeleteLayer(layer: MapLayer): Promise<void>;

    /**
     * Creates a marker in the later. 
     * 
     * @param {number} layer - The Id of the layer in which to create the marker. 
     * @param {IMarkerOptions} options - {@link IMarkerOptions} object containing the marker properties.  
     * @returns {Promise<Marker>} - A promise that when fullfilled contains the {@link Marker} model for the created marker. 
     * 
     * @memberof BingLayerBase
     */
    public CreateMarker(layer: number, options: IMarkerOptions): Promise<Marker>{
        let p: Promise<Layer>  = this.GetLayerById(layer);
        if(p == null) throw(`Layer with id ${layer} not found in Layer Map`);
        return p.then((l: Layer) => {
            let loc: Microsoft.Maps.Location = BingConversions.TranslateLocation(options.position);
            let o: Microsoft.Maps.IPushpinOptions = BingConversions.TranslateMarkerOptions(options);
            if (o.icon == null) {
                let s: number = 48;
                let iconInfo: IMarkerIconInfo = {
                    markerType: MarkerTypeId.CanvasMarker,
                    rotation: 45,
                    drawingOffset: { x: 24, y: 0 },
                    points: [
                        { x: 10, y: 40 },
                        { x: 24, y: 30 },
                        { x: 38, y: 40 },
                        { x: 24, y: 0 }
                    ],
                    color: "#f00",
                    size: { width: s, height: s }
                };
                o.icon = Marker.CreateMarker(iconInfo);
                o.anchor = new Microsoft.Maps.Point(iconInfo.size.width * 0.75, iconInfo.size.height * 0.25);
                o.textOffset = new Microsoft.Maps.Point(0, iconInfo.size.height * 0.66);
            }
            let pushpin: Microsoft.Maps.Pushpin = new Microsoft.Maps.Pushpin(loc, o);
            let marker:BingMarker =  new BingMarker(pushpin);
            marker.IsFirst = options.isFirst;
            marker.IsLast = options.isLast;
            if(options.metadata) options.metadata.forEach((v,k) => marker.Metadata.set(k,v));
            l.AddEntity(marker);
            return marker;
        });

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
    protected GetLayerById(id: number): Promise<Layer>{
        let p:Promise<Layer>;
        this._layers.forEach((l:Promise<Layer>, k:MapLayer) => { if(k.Id === id) p = l; });
        return p;
    }

}