export namespace Styles {
  export const variablesFontFamily: string = "Source Code Pro";
  export const textFontFamily: string = "Inter";
  export const propertyMenuIconColor: string =
    "var(--color-icon-menu-secondary, rgba(255, 255, 255, .8))";
  export const inputText: string = "#000000";
  export const inputBackground: string = "#FFFFFF";
  export const inputStrokeWidth: number = 2;
  export const inputStroke: string = "#666666";
  export const inputFrameStyles: Omit<AutoLayoutProps, "width"> = {
    cornerRadius: 8,
    horizontalAlignItems: "start",
    verticalAlignItems: "center",
    fill: Styles.inputBackground,
    stroke: Styles.inputStroke,
    strokeAlign: "inside",
    strokeWidth: Styles.inputStrokeWidth,
  };
  export const widgetTitleInputFrameStyles: AutoLayoutProps = {
    cornerRadius: 0,
    horizontalAlignItems: "start",
    verticalAlignItems: "center",
    //fill: "#FFFFFF00",
    minWidth: 256,
    width: "fill-parent",
    strokeWidth: 0,
  };
  export const codeObjectName: string = "#dcdcaa";
  export const codeType: string = "#4ec9a4";
  export const codeVariable: string = "#9cdcfe";
  export const codeBrace: string = "#da70c5";
  export const codeValue: string = "#c96f46";
  export const codeStatement: string = "#c57a97";

  export const hintColor: string = "#9747ff";
}
