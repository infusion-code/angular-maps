import { Injectable, Optional } from '@angular/core';
import { MapAPILoader, WindowRef, DocumentRef } from '../mapapiloader';

/**
 * Protocol enumeration
 *
 * @export
 * @enum {number}
 */
export enum ScriptProtocol {
    HTTP,
    HTTPS,
    AUTO
}

/**
 * Bing Maps V8 specific loader configuration to be used with the {@link GoogleMapAPILoader}
 *
 * @export
 * @class GoogleMapAPILoaderConfig
 */
@Injectable()
export class GoogleMapAPILoaderConfig {
    /**
       * The Google Maps API Key (see:
       * https://developers.google.com/maps/documentation/javascript/get-api-key)
       */
    apiKey?: string;

    /**
     * The Google Maps client ID (for premium plans).
     * When you have a Google Maps APIs Premium Plan license, you must authenticate
     * your application with either an API key or a client ID.
     * The Google Maps API will fail to load if both a client ID and an API key are included.
     */
    clientId?: string;

    /**
     * The Google Maps channel name (for premium plans).
     * A channel parameter is an optional parameter that allows you to track usage under your client
     * ID by assigning a distinct channel to each of your applications.
     */
    channel?: string;

    /**
     * Google Maps API version.
     */
    apiVersion?: string;

    /**
     * Host and Path used for the `<script>` tag.
     */
    hostAndPath?: string;

    /**
     * Protocol used for the `<script>` tag.
     */
    protocol?: ScriptProtocol;

    /**
     * Defines which Google Maps libraries should get loaded.
     */
    libraries?: string[];

    /**
     * The default bias for the map behavior is US.
     * If you wish to alter your application to serve different map tiles or bias the
     * application, you can overwrite the default behavior (US) by defining a `region`.
     * See https://developers.google.com/maps/documentation/javascript/basics#Region
     */
    region?: string;

    /**
     * The Google Maps API uses the browser's preferred language when displaying
     * textual information. If you wish to overwrite this behavior and force the API
     * to use a given language, you can use this setting.
     * See https://developers.google.com/maps/documentation/javascript/basics#Language
     */
    language?: string;

    /**
     * The Google Maps API requires a separate library for clustering. Set the property
     * to true in order to load this library.
     * See https://developers.google.com/maps/documentation/javascript/marker-clustering
     */
    enableClustering?: boolean;

    /**
     * Host and Path used for the cluster library `<script>` tag.
     */
    clusterHostAndPath?: string;
}

/**
 * Default loader configuration.
 */
const DEFAULT_CONFIGURATION = new GoogleMapAPILoaderConfig();

/**
 * Bing Maps V8 implementation for the {@link MapAPILoader} service.
 *
 * @export
 * @class GoogleMapAPILoader
 * @extends {MapAPILoader}
 */
@Injectable()
export class GoogleMapAPILoader extends MapAPILoader {

    ///
    /// Field defintitions.
    ///
    private _scriptLoadingPromise: Promise<void>;

    ///
    /// Property declarations.
    ///

    /**
     * Gets the loader configuration.
     *
     * @readonly
     * @type {GoogleMapAPILoaderConfig}
     * @memberof GoogleMapAPILoader
     */
    public get Config(): GoogleMapAPILoaderConfig { return this._config; }

    /**
     * Creates an instance of GoogleMapAPILoader.
     * @param {GoogleMapAPILoaderConfig} _config  - The loader configuration.
     * @param {WindowRef} _windowRef - An instance of {@link WindowRef}. Necessary because Bing Map V8 interacts with the window object.
     * @param {DocumentRef} _documentRef - An instance of {@link DocumentRef}.
     *                                     Necessary because Bing Map V8 interacts with the document object.
     * @memberof GoogleMapAPILoader
     */
    constructor( @Optional() private _config: GoogleMapAPILoaderConfig, private _windowRef: WindowRef, private _documentRef: DocumentRef) {
        super();
        if (this._config === null || this._config === undefined) {
            this._config = DEFAULT_CONFIGURATION;
        }
    }

    ///
    /// Public methods and MapAPILoader implementation.
    ///

    /**
     * Loads the necessary resources for Bing Maps V8.
     *
     * @returns {Promise<void>}
     *
     * @memberof GoogleMapAPILoader
     */
    public Load(): Promise<void> {
        if (this._scriptLoadingPromise) {
            return this._scriptLoadingPromise;
        }

        const script = this._documentRef.GetNativeDocument().createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.defer = true;
        const callbackName = `Create`;
        script.src = this.GetMapsScriptSrc(callbackName);

        this._scriptLoadingPromise = new Promise<void>((resolve: Function, reject: Function) => {
            (<any>this._windowRef.GetNativeWindow())[callbackName] = () => {
                if (this._config.enableClustering) {
                    // if clustering is enabled then delay the loading until after the cluster library is loaded
                    const clusterScript = this._documentRef.GetNativeDocument().createElement('script');
                    clusterScript.type = 'text/javascript';
                    clusterScript.src = this.GetClusterScriptSrc();
                    clusterScript.onload = clusterScript.onreadystatechange = () => {
                        resolve();
                    };
                    this._documentRef.GetNativeDocument().head.appendChild(clusterScript);
                } else {
                    resolve();
                }
            };
            script.onerror = (error: Event) => { reject(error); };
        });
        this._documentRef.GetNativeDocument().head.appendChild(script);

        return this._scriptLoadingPromise;
    }

    ///
    /// Private methods
    ///

    /**
     * Gets the Google Maps scripts url for injections into the header.
     *
     * @private
     * @param {string} callbackName - Name of the function to be called when the Google Maps scripts are loaded.
     * @returns {string} - The url to be used to load the Google Map scripts.
     *
     * @memberof GoogleMapAPILoader
     */
    private GetMapsScriptSrc(callbackName: string) {
        const hostAndPath: string = this._config.hostAndPath || 'maps.googleapis.com/maps/api/js';
        const queryParams: { [key: string]: string | Array<string> } = {
            v: this._config.apiVersion,
            callback: callbackName,
            key: this._config.apiKey,
            client: this._config.clientId,
            channel: this._config.channel,
            libraries: this._config.libraries,
            region: this._config.region,
            language: this._config.language
        };
        return this.GetScriptSrc(hostAndPath, queryParams);
    }

    /**
     * Gets the Google Maps Cluster library url for injections into the header.
     *
     * @private
     * @returns {string} - The url to be used to load the Google Map Cluster library.
     *
     * @memberof GoogleMapAPILoader
     */
    private GetClusterScriptSrc() {
        const hostAndPath: string = this._config.clusterHostAndPath ||
            'developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js';
        return this.GetScriptSrc(hostAndPath, {});
    }

    /**
     * Gets a scripts url for injections into the header.
     *
     * @private
     * @param {string} hostAndPath - Host and path name of the script to load.
     * @param {{ [key: string]: string | Array<string> }} queryParams - Url query parameters.
     * @returns {string} - The url with correct protocol, path, and query parameters.
     *
     * @memberof GoogleMapAPILoader
     */
    private GetScriptSrc(hostAndPath: string, queryParams: { [key: string]: string | Array<string> }): string {
        const protocolType: ScriptProtocol =
            <ScriptProtocol>((this._config && this._config.protocol) || ScriptProtocol.HTTPS);
        let protocol: string;

        switch (protocolType) {
            case ScriptProtocol.AUTO:
                protocol = '';
                break;
            case ScriptProtocol.HTTP:
                protocol = 'http:';
                break;
            case ScriptProtocol.HTTPS:
                protocol = 'https:';
                break;
        }

        const params: string =
            Object.keys(queryParams)
                .filter((k: string) => queryParams[k] != null)
                .filter((k: string) => {
                    // remove empty arrays
                    return !Array.isArray(queryParams[k]) ||
                        (Array.isArray(queryParams[k]) && queryParams[k].length > 0);
                })
                .map((k: string) => {
                    // join arrays as comma seperated strings
                    const i = queryParams[k];
                    if (Array.isArray(i)) {
                        return { key: k, value: i.join(',') };
                    }
                    return { key: k, value: queryParams[k] };
                })
                .map((entry: { key: string, value: string }) => { return `${entry.key}=${entry.value}`; })
                .join('&');
        return `${protocol}//${hostAndPath}?${params}`;
    }
}
