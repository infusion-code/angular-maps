import { BingMarker } from './bing-marker';
import { SpiderClusterMarker } from './../spider-cluster-marker';

export class BingSpiderClusterMarker extends BingMarker implements SpiderClusterMarker {

    /** The parent pushpin in which the spider pushpin is derived from. */
    public ParentMarker: BingMarker;

    /** The stick that connects the spider pushpin to the cluster. */
    public Stick: Microsoft.Maps.Polyline;

}
