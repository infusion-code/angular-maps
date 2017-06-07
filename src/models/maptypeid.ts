export enum MapTypeId {

    /** The aerial map type which uses top-down satellite & airplane imagery. */
    aerial,

    /** A darker version of the road maps. */
    canvasDark,

    /** A lighter version of the road maps which also has some of the details such as hill shading disabled. */
    canvasLight,

    /** A grayscale version of the road maps. */
    grayscale,

    /** Displays a blank canvas that uses the mercator map project. It basically removed the base maps layer. */
    mercator,

    /** Ordnance survey map type (en-gb only). */
    ordnanceSurvey,

    /** Road map type. */
    road,

    /** Provides streetside panoramas from the street level. */
    streetside

}
