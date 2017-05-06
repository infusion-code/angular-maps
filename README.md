# Overview
Angular Maps (X-Map) is a set of components and services to provide map functionality in angular 2+ apps. X-Maps architecture is provider independent and can be used with Bing, Google, ESRI or any other service enabled mapping provider. X-Map contains a default implementation for Bing Maps.

[![npm version](https://badge.fury.io/js/angular-maps.svg)](https://www.npmjs.com/package/angular-maps)

![angular-maps](https://img.shields.io/npm/dm/angular-maps.svg)  

# Install
Install via npm:

```
    npm install --save angular-maps
```

# Use
To use angular-maps with the default Bing Map implementation, follow these three steps:

1 Import Module
2 Configure Services
3 Add a map, markers, infoboxes and actions to a component

## 1. Import Module

Import MapModule, MapAPILoader, BingMapAPILoaderConfig, BingMapAPILoader, WindowRef, DocumentRef, MapServiceFactory and BingMapServiceFactory (yeah, I know...) in your main app module (or a particular feature module, if you don't want it globally). 

```
    import { MapModule, MapAPILoader, BingMapAPILoaderConfig, BingMapAPILoader, WindowRef, DocumentRef, MapServiceFactory, BingMapServiceFactory } from "angular-maps";
```

Import the MapModule. Note that the module is designed for lazy loading, so call with .forRoot()...

```
    @NgModule({
        bootstrap: [ AppComponent ],
        declarations: [
            ...
        ],
        imports: [
            ...
            MapModule.forRoot()
            ...
        ],
        providers: [
            ...
        ]
    })
```
## 2. Configure Services

Theoretically, this is options. However, generally you will need to supply some configuration to your map service, such as the service key or some such. You do that by injection specifc 
service configurations in the root module. The two service you will need to configure 
is the loader (which is actually responsible to load the resources from the map provider such as scripts etc) and the Service Factory, which provides bootstrapping for the concrete implementation
(Bing, Google, etc) you want to be using. Currently only a bing provider exists. 

```
    @NgModule({
        bootstrap: [ AppComponent ],
        declarations: [
            ...
        ],
        imports: [
            ...
            MapModule.forRoot()
            ...
        ],
        providers: [
            ...
            {
                provide: MapAPILoader, deps: [], useFactory: () => {
                    let bc: BingMapAPILoaderConfig = new BingMapAPILoaderConfig();
                    bc.apiKey ="..."; // your bing map key
                    return new BingMapAPILoader(bc, new WindowRef(), new DocumentRef());
                }
            },
            {
                provide: MapServiceFactory, deps: [MapAPILoader, NgZone], useFactory: (apiLoader: MapAPILoader, zone: NgZone) => {
                    return new BingMapServiceFactory(apiLoader, zone);
                }
            }
            ...
        ]
    })
```

## 3. Add a map, markers, infoboxes and actions to a component

To use maps, create a simple component (or implement the below in an existin component) as follows:

```
    import { Component } from '@angular/core';
    import { IBox, IMapOptions, MarkerTypeId } from "angular-maps";
    
    @Component({
        selector: 'some-component',
        template: `
            <div style="height: 500px">
                <x-map #xmap [Options]="_options">
                    <map-marker
                        [latitude]="30" 
                        [longitude]="90" 
                        [title]="'My Marker'" 
                        [iconUrl]="'https://cdn0.iconfinder.com/data/icons/industrial-icons/164/2-128.png'" 
                        [iconInfo]="{
                            markerType: _markerTypeId.FontMarker,
                            fontName: 'FontAwesome',
                            fontSize: 48,
                            color: 'green',
                            markerOffsetRatio: { x: 0.5, y: 1 },
                            text: '\uF276'
                        }"> 
                        <info-box [disableAutoPan]="true" [title]="'My InfoBox'" [description]="'Hi, this is the content of the <strong>info window</strong>. It is your responsibility to implement functionality such as close, etc...'">
                            <info-box-action [label]="'Click Me'" (actionClicked)="_click()"></info-box-action>
                        </info-box>   
                    </map-marker>
                </x-map>
            </div>
        `,
        styles: []
    })
    export class SomeComponent {
       private _markerTypeId = MarkerTypeId 
            // a little trick so we can use enums in the template...

       private _options: IMapOptions = {
            disableBirdseye: false,
            disableStreetside: false,
            navigationBarMode: 1
       };
            // for all available options for the various components, see IInfoWindowOptions, IInfoWindowAction, IMarkerOptions, IMapOptions, IMarkerIconInfo

       private _click(){
           console.log("hello world...");
       }
   }
```

Some notes:

- You can data bind map-markers to arrays of information via *ngFor. Very handy!
- You can use full rich text in the body of the info-box directive, this lets you fully control the appearance of the info-box. However, when you do that, info-box-actions won't work and you have to implement your own action mechanism.
- In my experience, when you have a large number of markers and you need a customized experience, it is easiest to implement a shard infobox. I'll have an example in the Wiki soonish. 

Happy Mapping!

# If you want to help

As with all these, I am looking for help in evolving this module. The top things on the agenda:

- Adding Polygon capabilities (abstract and concrete for Bing) is the highest priority.
- Clustering support needs to be improved.
- Currently the markers are directly placed on the map. Moving them into (optionaly multiple) layers would be good for larger app scenarios.
- Looking for someone to implement a Goolge Maps wrapper implementing thing proxy services against [Angular Google Maps](https://github.com/SebastianM/angular-google-maps)
- Looking for someone to create a set of ESRI concrete implementations. 

# Implementing your own Provider

The angular-maps module allows for the implementation of various different providers. Even though currently only Bing is implemented, implementing your own provider against Google, Esri or others is straight forward 
as long as the underlying capabilities are there. In order to do that you need to:

1. Create concrete implementations of the Marker and InfoBox abstracts (see BingMarker and BingInfoWindow for guidance)
2. Create concrete implementations of the MapAPILoader, MapService, MarkerService and InfoBoxService abstracts (again, see the Bing implementation in this project for guidance)
3. Create a concrete implementation of the MapServiceFactory to bootstrap the various services. 
4. Inject your service implementations in the provider (see configure services above).

Happy coding! 

# Some Credits

I want to give credit to [@youjustgo](https://www.npmjs.com/~youjustgo) who started [ng2-bingmaps](https://www.npmjs.com/package/ng2-bingmaps). Even though this effort is no abandoned, I was able to pick up some great stuff and 
leverage it for this module. Thanks also to [@adessoag](https://github.com/adessoag) and the [Angular Google Maps Team](https://github.com/SebastianM/angular-google-maps). I structurally modelled much of the interfaces and abstracts for this project 
after their work to make it easy to inject their services for a provider independent map implementation. 

# Advanced

Check out the [Wiki](../../wiki) for detailed documentation on components, models and providers. 