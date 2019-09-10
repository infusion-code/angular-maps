
export interface ICustomMapStyleGoogle {
    [index: number]: IMapElementStyleGoogle
  }
  
  export interface IMapElementStyleGoogle {
    elementType?: 'all'|'geometry'|'geometry.fill'|'geometry.stroke'|'labels'|'labels.icon'|
        'labels.text'|'labels.text.fill'|'labels.text.stroke';
    featureType?: 'administrative'|'administrative.country'|'administrative.land_parcel'|
        'administrative.locality'|'administrative.neighborhood'|'administrative.province'|'all'|
        'landscape'|'landscape.man_made'|'landscape.natural'|'landscape.natural.landcover'|
        'landscape.natural.terrain'|'poi'|'poi.attraction'|'poi.business'|'poi.government'|
        'poi.medical'|'poi.park'|'poi.place_of_worship'|'poi.school'|'poi.sports_complex'|'road'|
        'road.arterial'|'road.highway'|'road.highway.controlled_access'|'road.local'|'transit'|
        'transit.line'|'transit.station'|'transit.station.airport'|'transit.station.bus'|
        'transit.station.rail'|'water';
    stylers: IMapTypeStylerGoogle[];
  }
  
  /**
   *  If more than one key is specified in a single MapTypeStyler, all but one will be ignored.
   */
  export interface IMapTypeStylerGoogle {
    color?: string;
    gamma?: number;
    hue?: string;
    invert_lightness?: boolean;
    lightness?: number;
    saturation?: number;
    visibility?: string;
    weight?: number;
  }
  