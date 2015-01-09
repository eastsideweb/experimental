// Type definitions for jquery.uriAnchor v 1.1.3
// Project: https://github.com/mmikowski/urianchor

interface uriAnchor {
    configModule(arg_map): void;
    getVarType(data): string;
    makeAnchorMap(): any;
    makeAnchorString(anchor_map_in, option_map_in?  ): any;
    setAnchor(anchor_map, option_map, replace_flag): void;
}
interface JQueryStatic {
    uriAnchor: uriAnchor;
}