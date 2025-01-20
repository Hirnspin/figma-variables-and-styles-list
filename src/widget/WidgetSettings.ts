import { ColorType } from "@lib/Color";

export type None = 'NONE';
export type All = 'ALL';
/// TODO: Add support for Grid & Effect styles
export type StyleSelectOptionType = None | All | "TEXT" | "PAINT" // | StyleType;
export type VariableCollectionSelectOptionType = None | All | string;
export type SettingsColorType = keyof typeof ColorType;

export interface IWidgetSettings {
  queryFilter: string;
  width: number;
  title: string;
  onlyPublished: boolean;
  useDarkMode: boolean;
  useRemUnit: boolean;
  baseUnit: number;
  showTypeColumn: boolean;
  showDescriptionColumn: boolean;
  selectedVariableCollection: VariableCollectionSelectOptionType;
  selectedStyleType: StyleSelectOptionType;
  collections: Map<string, string>;
  showNestedAliasTokens: boolean;
  showCodeSyntax: boolean;
  showWebCodeSyntax: boolean;
  showAndroidCodeSyntax: boolean;
  showIosCodeSyntax: boolean;
  showOnlyFirstMode: boolean;
  displayColorValuesAsPaintPots: boolean;
  colorType: SettingsColorType
  paintPotColumns: number
  showCollectionTitle: boolean
}

export const DEFAULT_BASE_UNIT: number = 16;
export const DEFAULT_WIDTH: number = 1280;
export const DEFAULT_PAINT_POT_COLUMNS: number = 3;
export const DEFAULT_COLOR_TYPE: SettingsColorType = "HEX";

export class WidgetSettings implements IWidgetSettings {
  queryFilter: string;
  width: number;
  title: string;
  onlyPublished: boolean;
  useDarkMode: boolean;
  useRemUnit: boolean;
  baseUnit: number;
  showTypeColumn: boolean;
  showDescriptionColumn: boolean;
  selectedVariableCollection: string;
  selectedStyleType: StyleSelectOptionType;
  collections: Map<string, string>;
  showNestedAliasTokens: boolean;
  showCodeSyntax: boolean;
  showWebCodeSyntax: boolean;
  showAndroidCodeSyntax: boolean;
  showIosCodeSyntax: boolean;
  showOnlyFirstMode: boolean;
  displayColorValuesAsPaintPots: boolean;
  colorType: SettingsColorType;
  paintPotColumns: number;
  showCollectionTitle: boolean;

  constructor() {
    this.baseUnit = DEFAULT_BASE_UNIT;
    this.width = DEFAULT_WIDTH;
    this.onlyPublished = false;
    this.queryFilter = "";
    this.showDescriptionColumn = true;
    this.showTypeColumn = true;
    this.title = "";
    this.useDarkMode = false;
    this.useRemUnit = true;
    this.selectedVariableCollection = "NONE";
    this.selectedStyleType = "NONE";
    this.collections = new Map();
    this.showNestedAliasTokens = true;
    this.showCodeSyntax = true;
    this.showWebCodeSyntax = true;
    this.showAndroidCodeSyntax = true;
    this.showIosCodeSyntax = true;
    this.showOnlyFirstMode = false;
    this.displayColorValuesAsPaintPots = true;
    this.colorType = DEFAULT_COLOR_TYPE;
    this.paintPotColumns = DEFAULT_PAINT_POT_COLUMNS;
    this.showCollectionTitle = true;
  }
}
