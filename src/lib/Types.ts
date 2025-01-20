export type ResolvedVariableValue = {
  value: VariableValue;
  resolvedType: VariableResolvedDataType;
};

type PublishedStyle = {
  publishStatus: PublishStatus;
};

export type PublishedTextStyle = PublishedStyle &
  Omit<
    TextStyle,
    | "getPluginData"
    | "getPluginDataKeys"
    | "getPublishStatusAsync"
    | "getSharedPluginData"
    | "getSharedPluginDataKeys"
    | "remove"
    | "setPluginData"
    | "setSharedPluginData"
    | "getStyleConsumersAsync"
  >;

export type PublishedEffectStyle = PublishedStyle &
  Omit<
    EffectStyle,
    | "getPluginData"
    | "getPluginDataKeys"
    | "getPublishStatusAsync"
    | "getSharedPluginData"
    | "getSharedPluginDataKeys"
    | "getStyleConsumersAsync"
    | "remove"
    | "setPluginData"
    | "setSharedPluginData"
  >;

export type PublishedGridStyle = PublishedStyle &
  Omit<
    GridStyle,
    | "getPluginData"
    | "getPluginDataKeys"
    | "getPublishStatusAsync"
    | "getSharedPluginData"
    | "getSharedPluginDataKeys"
    | "remove"
    | "setPluginData"
    | "setSharedPluginData"
    | "getStyleConsumersAsync"
  >;

export type PublishedPaintStyle = PublishedStyle &
  Omit<
    PaintStyle,
    | "getPluginData"
    | "getPluginDataKeys"
    | "getPublishStatusAsync"
    | "getSharedPluginData"
    | "getSharedPluginDataKeys"
    | "getStyleConsumersAsync"
    | "remove"
    | "setPluginData"
    | "setSharedPluginData"
  >;
