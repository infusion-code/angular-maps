import { IPoint } from "./ipoint";
import { ILayerOptions } from "./ilayeroptions";
import { IMarkerIconInfo } from "./imarkericoninfo";
import { ISpiderClusterOptions } from "./ispiderclusteroptions";
import { Marker } from "../models/marker";
import { ClusterPlacementMode } from "../models/clusterplacementmode";

/**
 * This interfaces defined options governing clustering layers.
 * 
 * @export
 * @interface IClusterOptions
 * @extends {ILayerOptions}
 */
export interface IClusterOptions extends ILayerOptions {

        /**
         * A callback function that is fired after the clustering for a map view has completed. This is useful if you want to generate a list of locations based on what is in the current view.
         * 
         * @type () => void
         * @memberof IClusterOptions
         */
        callback?: () => void;

        /**
         * Icon information for custom marker icons in the clusters
         * 
         * @type {IMarkerIconInfo}
         * @memberof IClusterOptions
         */
        clusterIconInfo?: IMarkerIconInfo;

        /**
        * A callback function that allows you to process a clustered pushpin before it is added to a layer. This is useful if you want to add events or set style options on the clustered pushpin.
        */
        clusteredPinCallback?: (marker: any) => void;

        /**
         * Indicates if the layer should cluster the locations or not. Default: true
         * 
         * @type {boolean}
         * @memberof IClusterOptions
         */
        clusteringEnabled?: boolean;

        /**
         * The width and height of the gird cells used for clustering in pixels. Default: 45
         * 
         * @type {number}
         * @memberof IClusterOptions
         */
        gridSize?: number;

        /**
         * Offsets the placement of clustered pushpins by a set number of pixels. This option is only available when the placement type is set to GridCenter.
         * This is useful if you have multiple cluster layers on the map and you want to offset the clustered pushpins between the layers so that they are visible,
         * otherwise the clusters from the different layers would overlap completely.
         * 
         * @type {IPoint}
         * @memberof IClusterOptions
         */
        layerOffset?: IPoint;

        /**
         * Determines the cluster placement mode
         * 
         * @type {ClusterPlacementMode}
         * @memberof IClusterOptions
         */
        placementMode?: ClusterPlacementMode; 

        /**
         * Options governing the spider cluster behavior if active. 
         * 
         * @type {ISpiderClusterOptions}
         * @memberof IClusterOptions
         */
        spiderClusterOptions?: ISpiderClusterOptions;

        /**
         * A boolean indicating if the layer is visible or not.
         * 
         * @type {boolean}
         * @memberof IClusterOptions
         */
        visible?: boolean;

        /**
         * The z-index of the layer. 
         * 
         * @type {number}
         * @memberof IClusterOptions
         */
        zIndex?: number;

}