    /** Options used for customizing Polylines. */
    export interface ILineOptions  {

        /** The css cursor to show when the line has mouse events on it.*/
        cursor?: string;

        /** Boolean indicating whether the line is visible. */
        visible?: boolean;

        /** CSS string for the line's color. */
        strokeColor?: string;

        /** An array of numbers separated by spaces, or a string separated by spaces/commas specifying the repetitive stroke pattern. */
        strokeDashArray?: number[] | string;

        /** The thickness of the line stroke. */
        strokeThickness?: number;
    }