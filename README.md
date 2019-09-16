[![npm version](https://badge.fury.io/js/angular-maps.svg)](https://www.npmjs.com/package/angular-maps) ![angular-maps](https://img.shields.io/npm/dm/angular-maps.svg) [![Code Climate](https://codeclimate.com/github/infusion-code/angular-maps/badges/gpa.svg)](https://codeclimate.com/github/infusion-code/angular-maps) [![All Contributors](https://img.shields.io/badge/all_contributors-3-orange.svg?style=flat-square)](#contributors)

```diff
- #IMPORTANT
- On or about 10/6/2019, this repository will be migrated into the Avanade channel. While existing clones,
- forks and branches will automatically redirect, we recommend that after the migration you repoint
- your urls to the Avanade channel. 
```

# Overview
Angular Maps (X-Map) is a set of components and services to provide map functionality in angular 2+ apps. X-Maps architecture is provider independent and can be used with Bing, Google, ESRI or any other service enabled mapping provider. X-Map contains default implementations for Bing Maps and Google Maps, including layers, markers, infoboxes, clusters, polygons and polylines for both platforms.

```diff
- we have now added support for angular 6 and changed the examples to stackblitz...
```

# Samples
 You can find various basic and advanced samples in the [Wiki Sample Page](../../wiki/Samples)

# Latest Updates

See the [Wiki Change Log](../../wiki/Change-Log) for key changes and addition in various releases. 

# Install
Install via npm:

```
    npm install --save angular-maps
```

# Use
To use angular-maps with the default Bing Map implementation, follow these three steps:

1. Import Module
2. Configure Services
3. Add a map, markers, infoboxes and actions to a component

## 1. Import Module

Add the Bing Type Declarations to your main app module (or a particular feature module, if you don't want it globally). This is currently necessary even if you do not want to use the Bing Maps providers as the types are in the signatures but not part of the distribution (the bingmaps Typescript types npm package is part of the dependencies and should have been installed when you installed angular maps). We are looking for ways around that... In the meanwhile, insert the following on the top of your app module file (depending on your project structure, you might have to manipulate the path):

```
    /// <reference path="node_modules/bingmaps/types/MicrosoftMaps/Microsoft.Maps.All.d.ts" />
```

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

Theoretically, this is optional. However, generally you will need to supply some configuration to your map service, such as the service key or some such. You do that by injection specifc 
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
                provide: MapAPILoader, deps: [], useFactory: MapServiceProviderFactory
            }
            ...
        ]
    })

    export function MapServiceProviderFactory(){
        let bc: BingMapAPILoaderConfig = new BingMapAPILoaderConfig();
        bc.apiKey ="..."; // your bing map key
        bc.branch = "experimental"; 
            // to use the experimental bing brach. There are some bug fixes for
            // clustering in that branch you will need if you want to use 
            // clustering.
        return new BingMapAPILoader(bc, new WindowRef(), new DocumentRef());
    }

```

> Note: The provider factory was moved into an exported method to accomodate Angular 4 requirements to no have lambda functions in the provider loading. 

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
                    <x-map-marker
                        [Latitude]="30" 
                        [Longitude]="90" 
                        [Title]="'My Marker'" 
                        [IconUrl]="'https://cdn0.iconfinder.com/data/icons/industrial-icons/164/2-128.png'" 
                        [IconInfo]="{
                            markerType: _markerTypeId.FontMarker,
                            fontName: 'FontAwesome',
                            fontSize: 48,
                            color: 'green',
                            markerOffsetRatio: { x: 0.5, y: 1 },
                            text: '\uF276'
                        }"> 
                        <info-box [DisableAutoPan]="true" [Title]="'My InfoBox'" [Description]="'Hi, this is the content of the <strong>info window</strong>. It is your responsibility to implement functionality such as close, etc...'">
                            <info-box-action [Label]="'Click Me'" (ActionClicked)="_click()"></info-box-action>
                        </info-box>   
                    </x-map-marker>
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

- ~~Adding Polygon capabilities (abstract and concrete for Bing) is the highest priority.~~
- ~~Clustering support needs to be improved.~~
- ~~Currently the markers are directly placed on the map. Moving them into (optionaly multiple) layers would be good for larger app scenarios. (done for Bing, still in progress for Google)~~
- ~~Looking for someone to implement a Google Maps wrapper implementing thin proxy services against [Angular Google Maps](https://github.com/SebastianM/angular-google-maps)~~
- Looking for someone to create a set of ESRI concrete implementations.
- ~~Performance improvements for very large data sets (more than 10000 markers, polylines and polygones, polylines and polygones with 100000 path points)~~.
- Add Circle Component and support
- Add KML layer capability.
- Add GeoJSON capability.
- Add Server side rendering support with sample tile server implementation.

# Implementing your own Provider

The angular-maps module allows for the implementation of various different providers. Even though currently only Bing is implemented, implementing your own provider against Google, Esri or others is straight forward 
as long as the underlying capabilities are there. In order to do that you need to:

1. Create concrete implementations of the Marker and InfoBox abstracts (see BingMarker and BingInfoWindow for guidance)
2. Create concrete implementations of the MapAPILoader, MapService, MarkerService and InfoBoxService abstracts (again, see the Bing implementation in this project for guidance)
3. Create a concrete implementation of the MapServiceFactory to bootstrap the various services. 
4. Inject your service implementations in the provider (see configure services above).

Happy coding! 

# Advanced

Check out the [Wiki](../../wiki) for detailed documentation on components, models and providers. 
