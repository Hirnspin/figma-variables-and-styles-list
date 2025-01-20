export type CodegenPreferencesPropertyKeys =
  | "tabSize"
  | "separateCollections"
  | "collectionNamePrefix"
  | "useCollectionNameAbbreviations"
  | "handleNumbersAsDimensions"
  | "showCssComments"
  | "colorValueType"
  | "generateTextValues"
  | "customVariablePrefix"
  | "useCodeSyntaxName";

export type ColorValueTypeValue = "rgb" | "hex" | "hsl";
export type TabSizeValue = "2" | "4" | "8";
export type BooleanValue = "true" | "false";

export type CodegenPreferencesPropertyRecords = Record<
  "tabSize",
  TabSizeValue
> &
  Record<"separateCollections", BooleanValue> &
  Record<"collectionNamePrefix", BooleanValue> &
  Record<"useCollectionNameAbbreviations", BooleanValue> &
  Record<"handleNumbersAsDimensions", BooleanValue> &
  Record<"showCssComments", BooleanValue> &
  Record<"colorValueType", ColorValueTypeValue> &
  Record<"generateTextValues", BooleanValue> &
  Record<"useCodeSyntaxName", BooleanValue>;

export type CodegenCustomSettings = CodegenPreferencesPropertyRecords;
