import { IClusterOptions } from "../interfaces/iclusteroptions";
import { ISpiderClusterOptions } from "../interfaces/ispiderclusteroptions";
import { Layer } from "./layer";
import { Marker } from "./marker";
import { BingSpiderClusterMarker } from "./bingspiderclustermarker";
import { BingMarker } from "./bingmarker";
import { InfoWindow } from "./infowindow";
import { BingConversions } from "../services/bingconversions";
import { BingMapService } from "../services/bingmapservice";
import { MapService} from "../services/mapservice";

/**
 * Concrete implementation of a clustering layer for the Bing Map Provider.
 * 
 * @export
 * @class BingClusterLayer
 * @implements {Layer}
 */
export class BingClusterLayer implements Layer {

    ///
    /// Field declarations
    ///
    private _markers: Array<Marker> = new Array<Marker>(); 
    private _useSpiderCluster:boolean = false;
    private _mapclicks: number = 0;
    private _spiderLayer: Microsoft.Maps.Layer;
    private _events: Array<Microsoft.Maps.IHandlerId> = new Array<Microsoft.Maps.IHandlerId>();
    private _currentZoom: number = 0;
    private _spiderOptions: ISpiderClusterOptions = {
        circleSpiralSwitchover: 9,
        collapseClusterOnMapChange: false,
        collapseClusterOnNthClick: 1,
        invokeClickOnHover: true,
        minCircleLength: 60,
        minSpiralAngleSeperation: 25,
        spiralDistanceFactor: 5,
        stickStyle: {
            strokeColor: 'black',
            strokeThickness: 2
        },
        stickHoverStyle: { strokeColor: 'red' },
        markerSelected: null,
        markerUnSelected: null
    };
    private _currentCluster: Microsoft.Maps.ClusterPushpin = null

    ///
    /// Property definitions
    ///

    /**
     * Get the native primitive underneath the abstraction layer.
     *
     * @returns Microsoft.Maps.ClusterLayer.
     * 
     * @memberof BingClusterLayer
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
     * @memberof BingClusterLayer
     */
    constructor(private _layer: Microsoft.Maps.ClusterLayer, private _maps: MapService){ }


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
     * @memberof BingClusterLayer
     */
    public AddListener(eventType: string, fn: Function): void {
        Microsoft.Maps.Events.addHandler(this._layer, eventType, (e) => {
            fn(e);
        });
    }

    /**
     * Adds an entity to the layer.
     *
     * @param entity Marker|InfoWindow|any. Entity to add to the layer.
     * 
     * @memberof BingClusterLayer
     */
    public AddEntity(entity: Marker|InfoWindow|any): void {
        if(entity.NativePrimitve && entity.Location){
            let p: Array<Microsoft.Maps.Pushpin> = this._layer.getPushpins();
            p.push(entity.NativePrimitve)
            this._layer.setPushpins(p);
            this._markers.push(entity);
        }
    }

    /**
     * Initializes spider behavior for the clusering layer (when a cluster maker is clicked, it explodes into a spider of the 
     * individual underlying pins. 
     *
     * @param options ISpiderClusterOptions. Optional. Options governing the behavior of the spider.
     * 
     * @memberof BingClusterLayer
     */
    public InitializeSpiderClusterSupport(options?: ISpiderClusterOptions): void {
        if(this._useSpiderCluster) return;
        let m: Microsoft.Maps.Map = (<BingMapService>this._maps).MapInstance;
        this._useSpiderCluster = true;
        this._spiderLayer = new Microsoft.Maps.Layer();
        this._currentZoom = m.getZoom();
        m.layers.insert(this._spiderLayer);
        this.SetSpiderOptions(options);

        this._events.push(Microsoft.Maps.Events.addHandler(m, 'click', (e) => { 
            if(this._mapclicks == -1) return;
            else if(++this._mapclicks >= this._spiderOptions.collapseClusterOnNthClick) this.HideSpiderCluster();
            else {
                // do nothing as this._mapclicks has already been incremented above 
            } 
        }));
        this._events.push(Microsoft.Maps.Events.addHandler(m, 'viewchangestart', (e) => { 
            let hasZoomChanged: boolean = (<Microsoft.Maps.Map>e.target).getZoom() != this._currentZoom;
            if(this._spiderOptions.collapseClusterOnMapChange || hasZoomChanged) this.HideSpiderCluster(); 
        }));
        this._events.push(Microsoft.Maps.Events.addHandler(this._layer, 'click', (e) => { this.LayerClickEvent(e); }));
        this._events.push(Microsoft.Maps.Events.addHandler(this._spiderLayer, 'click', (e) => { this.LayerClickEvent(e); }));
        this._events.push(Microsoft.Maps.Events.addHandler(this._spiderLayer, 'mouseover', (e) => {
            let pin: Microsoft.Maps.Pushpin =  <Microsoft.Maps.Pushpin>e.primitive;
            if (pin instanceof Microsoft.Maps.Pushpin && pin.metadata && pin.metadata.isClusterMarker) {
                let m:BingSpiderClusterMarker = <BingSpiderClusterMarker>this.GetMarkerFromBingMarker(pin);
                m.Stick.setOptions(this._spiderOptions.stickHoverStyle);
                if(this._spiderOptions.invokeClickOnHover){
                    let p: BingMarker = m.ParentMarker;
                    let ppin: Microsoft.Maps.Pushpin = p.NativePrimitve;
                    if (Microsoft.Maps.Events.hasHandler(ppin, "click")) Microsoft.Maps.Events.invoke(ppin, "click", e);
                }
            }
        }));
        this._events.push(Microsoft.Maps.Events.addHandler(this._spiderLayer, 'mouseout', (e) => {
            let pin: Microsoft.Maps.Pushpin =  <Microsoft.Maps.Pushpin>e.primitive;
            if (pin instanceof Microsoft.Maps.Pushpin && pin.metadata && pin.metadata.isClusterMarker) {
                let m:BingSpiderClusterMarker = <BingSpiderClusterMarker>this.GetMarkerFromBingMarker(pin);
                m.Stick.setOptions(this._spiderOptions.stickStyle);
            }
        }));

    }

    /**
     * Deletes the clustering layer.
     * 
     * @memberof BingClusterLayer
     */
    public Delete(): void{
        if( this._useSpiderCluster){
            this._spiderLayer.clear();
            (<BingMapService>this._maps).MapPromise.then(m => {
                m.layers.remove(this._spiderLayer);
                this._spiderLayer = null;
            });
            this._events.forEach(e => Microsoft.Maps.Events.removeHandler(e));
            this._events.splice(0);
            this._useSpiderCluster = false;
        }
        this._markers.splice(0);
        this._maps.DeleteLayer(this);
    }
    
    /**
     * Returns the abstract marker used to wrap the Bing Pushpin.
     *
     * @returns Marker. The abstract marker object representing the pushpin.
     * 
     * @memberof BingClusterLayer
     */
    public GetMarkerFromBingMarker(pin: Microsoft.Maps.Pushpin): Marker {
        let i: number = this._markers.findIndex(e => e.NativePrimitve === pin);
        if (i > -1) return this._markers[i];
        return null;
    }

    /**
     * Returns the options governing the behavior of the layer.
     *
     * @returns IClusterOptions. The layer options.
     * 
     * @memberof BingClusterLayer
     */
    public GetOptions(): IClusterOptions{
        let o:Microsoft.Maps.IClusterLayerOptions = this._layer.getOptions();
        let options: IClusterOptions = {
            id: 0,
            gridSize: o.gridSize,
            layerOffset: o.layerOffset,
            clusteringEnabled: o.clusteringEnabled,
            callback: o.callback,
            clusteredPinCallback: o.clusteredPinCallback,
            visible: o.visible,
            zIndex: o.zIndex
        };
        return options;
    }

    /**
     * Returns the visibility state of the layer.
     *
     * @returns Boolean. True is the layer is visible, false otherwise.
     * 
     * @memberof BingClusterLayer
     */
    public GetVisible(): boolean  {
        return this._layer.getOptions().visible;
    }

    /**
     * Removes an entity from the cluster layer. 
     *
     * @param entity Marker|InfoWindow|any Entity to be removed from the layer.
     * 
     * @memberof BingClusterLayer
     */
    public RemoveEntity(entity: Marker|InfoWindow|any): void {
        if(entity.NativePrimitve && entity.Location){
            let p: Array<Microsoft.Maps.Pushpin> = this._layer.getPushpins();
            let i: number = p.findIndex(x => x===entity.NativePrimitve);
            let j: number = this._markers.findIndex( m => m === entity);
            if(i > -1) p.splice(i, 1);
            if(j > -1) this._markers.splice(j, 1);
            this._layer.setPushpins(p);
        }
    }

    /**
     * Sets the entities for the cluster layer. 
     *
     * @param entities Array<Marker>|Array<InfoWindow>|Array<any> containing the entities to add to the cluster. This replaces any existing entities.
     * 
     * @memberof BingClusterLayer
     */
    public SetEntities(entities: Array<Marker>|Array<InfoWindow>|Array<any>): void {
        let p: Array<Microsoft.Maps.Pushpin> = new Array<Microsoft.Maps.Pushpin>();
        this._markers.splice(0);
        (<Array<any>>entities).forEach((e:any) => { 
            if(e.NativePrimitve && e.Location) {
                this._markers.push(e);
                p.push(<Microsoft.Maps.Pushpin>e.NativePrimitve);} 
        }); 
        this._layer.setPushpins(p);
    }
    
    /**
     * Sets the options for the cluster layer. 
     *
     * @param options IClusterOptions containing the options enumeration controlling the layer behavior. The supplied options
     * are merged with the default/existing options.
     * 
     * @memberof BingClusterLayer
     */
    public SetOptions(options: IClusterOptions): void{
        let o:Microsoft.Maps.IClusterLayerOptions = BingConversions.TranslateClusterOptions(options);
        this._layer.setOptions(o);
        if(options.spiderClusterOptions) this.SetSpiderOptions(options.spiderClusterOptions);
    }

    /**
     * Toggles the cluster layer visibility. 
     *
     * @param visible Boolean true to make the layer visible, false to hide the layer.
     * 
     * @memberof BingClusterLayer
     */
    public SetVisible(visible: boolean): void {
        let o:Microsoft.Maps.IClusterLayerOptions = this._layer.getOptions();
        o.visible = visible;
        this._layer.setOptions(o);
    }

    ///
    /// Private methods
    ///

    /**
     * Creates a copy of a pushpins basic options.
     *
     * @param pin Pushpin to copy options from.
     * @returns A copy of a pushpins basic options.
     * 
     * @memberof BingClusterLayer
     */
    private GetBasicPushpinOptions(pin: Microsoft.Maps.Pushpin): Microsoft.Maps.IPushpinOptions {
        return <Microsoft.Maps.IPushpinOptions>{
            anchor: pin.getAnchor(),
            color: pin.getColor(),
            cursor: pin.getCursor(),
            icon: pin.getIcon(),
            roundClickableArea: pin.getRoundClickableArea(),
            subTitle: pin.getSubTitle(),
            text: pin.getText(),
            textOffset: pin.getTextOffset(),
            title: pin.getTitle()
        };
    }

    /**
     * Hides the spider cluster and resotres the original pin. 
     * 
     * @memberof BingClusterLayer
     */
    private HideSpiderCluster(): void {
        if (this._currentCluster) {
            this._spiderLayer.clear();
            this._currentCluster = null;
            this._mapclicks = -1;
            if (this._spiderOptions.markerUnSelected) this._spiderOptions.markerUnSelected();
        }
    }

    /**
     * Click event handler for when a shape in the cluster layer is clicked. 
     *
     * @param e The mouse event argurment from the click event.
     * 
     * @memberof BingClusterLayer
     */
    private LayerClickEvent(e: Microsoft.Maps.IMouseEventArgs): void {
        if (e.primitive instanceof Microsoft.Maps.ClusterPushpin) {
            let cp: Microsoft.Maps.ClusterPushpin = <Microsoft.Maps.ClusterPushpin>e.primitive;
            let showNewCluster:boolean = cp !== this._currentCluster;
            this.HideSpiderCluster();
            if(showNewCluster){
                this.ShowSpiderCluster(<Microsoft.Maps.ClusterPushpin>e.primitive);
            }
        } 
        else {
            let pin:Microsoft.Maps.Pushpin = <Microsoft.Maps.Pushpin>e.primitive;
            if (pin.metadata && pin.metadata.isClusterMarker) {
                let m: BingSpiderClusterMarker = <BingSpiderClusterMarker>this.GetMarkerFromBingMarker(pin);
                let p: BingMarker = m.ParentMarker;
                let ppin: Microsoft.Maps.Pushpin = p.NativePrimitve;
                if (this._spiderOptions.markerSelected) this._spiderOptions.markerSelected(p, new BingMarker(this._currentCluster));
                if (Microsoft.Maps.Events.hasHandler(ppin, "click")) Microsoft.Maps.Events.invoke(ppin, "click", e);
                this._mapclicks = 0;
            } 
            else {
                if (this._spiderOptions.markerSelected) this._spiderOptions.markerSelected(this.GetMarkerFromBingMarker(pin), null);
                if (Microsoft.Maps.Events.hasHandler(pin, "click")) Microsoft.Maps.Events.invoke(pin, "click", e);
            }
        }
    }

    /**
     * Sets the options for spider behavior.
     * 
     * @param options ISpiderClusterOptions containing the options enumeration controlling the spider cluster behavior. The supplied options
     * are merged with the default/existing options.
     * 
     * @memberof BingClusterLayer
     */
    private SetSpiderOptions(options: ISpiderClusterOptions): void {
       if (options) {
            if (typeof options.circleSpiralSwitchover === 'number') this._spiderOptions.circleSpiralSwitchover = options.circleSpiralSwitchover;
            if (typeof options.collapseClusterOnMapChange === 'boolean') this._spiderOptions.collapseClusterOnMapChange = options.collapseClusterOnMapChange;
            if (typeof options.collapseClusterOnNthClick === 'number') this._spiderOptions.collapseClusterOnNthClick = options.collapseClusterOnNthClick;
            if (typeof options.invokeClickOnHover === 'boolean') this._spiderOptions.invokeClickOnHover = options.invokeClickOnHover;
            if (typeof options.minSpiralAngleSeperation === 'number')  this._spiderOptions.minSpiralAngleSeperation = options.minSpiralAngleSeperation;
            if (typeof options.spiralDistanceFactor === 'number') this._spiderOptions.spiralDistanceFactor = options.spiralDistanceFactor;        
            if (typeof options.minCircleLength === 'number') this._spiderOptions.minCircleLength = options.minCircleLength;
            if (options.stickHoverStyle) this._spiderOptions.stickHoverStyle = options.stickHoverStyle;
            if (options.stickStyle) this._spiderOptions.stickStyle = options.stickStyle;
            if (options.markerSelected) this._spiderOptions.markerSelected = options.markerSelected;
            if (options.markerUnSelected) this._spiderOptions.markerUnSelected = options.markerUnSelected;
            if (typeof options.visible === 'boolean') this._spiderOptions.visible = options.visible;
            this.SetOptions(<IClusterOptions>options);
        }  
    }

    /**
     * Expands a cluster into it's open spider layout.
     *
     * @param cluster The cluster to show in it's open spider layout..
     * 
     * @memberof BingClusterLayer
     */
    private ShowSpiderCluster(cluster: Microsoft.Maps.ClusterPushpin): void {
        this.HideSpiderCluster();
        this._currentCluster = cluster;

        if (cluster && cluster.containedPushpins) {
            //Create spider data.
            let m: Microsoft.Maps.Map = (<BingMapService>this._maps).MapInstance;
            let pins: Array<Microsoft.Maps.Pushpin> = cluster.containedPushpins;
            let center: Microsoft.Maps.Location = cluster.getLocation();
            let centerPoint:Microsoft.Maps.Point = <Microsoft.Maps.Point>m.tryLocationToPixel(center, Microsoft.Maps.PixelReference.control);
            let stick: Microsoft.Maps.Polyline;
            let angle: number = 0;
            let makeSpiral: boolean = pins.length > this._spiderOptions.circleSpiralSwitchover;
            let legPixelLength: number;
            let stepAngle: number;
            let stepLength: number;

            if (makeSpiral) {
                legPixelLength = this._spiderOptions.minCircleLength / Math.PI;
                stepLength = 2 * Math.PI * this._spiderOptions.spiralDistanceFactor;
            } else {
                stepAngle = 2 * Math.PI / pins.length;
                legPixelLength = (this._spiderOptions.spiralDistanceFactor / stepAngle / Math.PI / 2) * pins.length;
                if (legPixelLength < this._spiderOptions.minCircleLength)  legPixelLength = this._spiderOptions.minCircleLength;
            }

            for (var i = 0, len = pins.length; i < len; i++) {
                //Calculate spider pin location.
                if (!makeSpiral) angle = stepAngle * i;
                else {
                    angle += this._spiderOptions.minSpiralAngleSeperation / legPixelLength + i * 0.0005;
                    legPixelLength += stepLength / angle;
                }
                let point: Microsoft.Maps.Point = new Microsoft.Maps.Point(centerPoint.x + legPixelLength * Math.cos(angle), centerPoint.y + legPixelLength * Math.sin(angle));
                let loc: Microsoft.Maps.Location = <Microsoft.Maps.Location>m.tryPixelToLocation(point, Microsoft.Maps.PixelReference.control);

                //Create stick to pin.
                stick = new Microsoft.Maps.Polyline([center, loc], this._spiderOptions.stickStyle);
                this._spiderLayer.add(stick);

                //Create pin in spiral that contains same metadata as parent pin.
                let pin: Microsoft.Maps.Pushpin = new Microsoft.Maps.Pushpin(loc);
                pin.metadata = pins[i].metadata || {};
                pin.metadata.isClusterMarker = true;
                pin.setOptions(this.GetBasicPushpinOptions(pins[i]));
                this._spiderLayer.add(pin);
                
                let spiderMarker: BingSpiderClusterMarker = new BingSpiderClusterMarker(pin);
                spiderMarker.Stick = stick;
                spiderMarker.ParentMarker = <BingMarker>this.GetMarkerFromBingMarker(pins[i]);
                this._markers.push(spiderMarker);
            }
            this._mapclicks = 0;
        }
    }

}