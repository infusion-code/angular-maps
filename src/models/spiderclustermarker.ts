import { Marker } from "./marker";

export abstract class SpiderClusterMarker extends Marker {

    /** The parent pushpin in which the spider pushpin is derived from. */
    public ParentMarker: Marker;

    /** The stick that connects the spider pushpin to the cluster. */
    public Stick: any;

}