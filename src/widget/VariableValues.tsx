const { widget } = figma;
const {
  AutoLayout,
  Text,
  Ellipse,
  Rectangle,
  Frame,
  SVG,
  Span,
} = widget;

import { getColorList, isColorBrighter, colorToHexString, getColorByMode, colorToHslaString, rgbaStringToHexa, colorToRgbaString } from "@lib/colorHelpers";
import { Styles } from "@lib/StyleDefinitions";
import Icons from "@lib/Icons";
import IVariableRow from "./IVariableRow";
import { IWidgetSettings } from "./WidgetSettings";
import { ColorType } from "@lib/Color";

interface IVariableValuesProps {
  variableRow: IVariableRow;
  settings: IWidgetSettings;
  collectionsColorMap: ReadonlyMap<string, string>;
}

function getColorStringByTypeSetting(color: RGB | RGBA | WidgetJSX.Color, settings: IWidgetSettings) {
  if (ColorType[settings.colorType] === ColorType.HSLA) return colorToHslaString(color);
  if (ColorType[settings.colorType] === ColorType.RBGA) return colorToRgbaString(color);

  return rgbaStringToHexa(color);
}

function VariableValues(props: IVariableValuesProps) {
  const { variableRow, settings, collectionsColorMap } = props;
  let variableValuesByMode = variableRow.variableValuesByMode;

  if (settings.showOnlyFirstMode) {
    variableValuesByMode = [variableRow.variableValuesByMode[0]];
  }

  if (variableValuesByMode.length <= 0) {
    return <Text>Loading...</Text>
  } else {
    return variableValuesByMode.map((variableValue, variableValueIndex) => {
      let value: string;

      //console.log("variableValue", variableValue);

      if (variableValue && variableValue.resolvedValue) {
        switch (variableValue.resolvedValue.resolvedType) {
          case "FLOAT":
            if (variableRow.scopes && variableRow.scopes!.indexOf("OPACITY") > -1) {
              value = `${variableValue.resolvedValue.value as number}%`
            } else if (settings.useRemUnit) {
              value = `${(variableValue.resolvedValue.value as number) / settings.baseUnit}` + "rem (" + (variableValue.resolvedValue.value as number) + "px)";
            } else {
              value = `${variableValue.resolvedValue.value as number}px`;
            }
            break;
          case "COLOR":
            value = getColorStringByTypeSetting(variableValue.resolvedValue.value as RGBA, settings);
            break;

          default:
            value = variableValue.resolvedValue.value.toLocaleString();
            break;
        }

        return (
          <AutoLayout
            direction="vertical"
            spacing="auto"
            verticalAlignItems="start"
            height="hug-contents"
            width="fill-parent"
            key={variableValueIndex}
            name={`variable-value-${variableValue.modeName}`}
          >
            {variableValuesByMode.length > 1 ?
              <AutoLayout direction="horizontal" padding={{ top: 8, left: 8, right: 8 }} spacing={8} width="hug-contents"
                fill={getColorByMode("code-fill", settings.useDarkMode)} verticalAlignItems="center" cornerRadius={{ topLeft: 8, topRight: 8 }}>
                <Text fill={getColorByMode("code-text-fill", settings.useDarkMode)} fontSize={12} fontFamily="Source Code Pro"
                  horizontalAlignText="left">Mode: <Span fontWeight={"bold"}>{variableValue.modeName}</Span></Text>
              </AutoLayout> : <></>}
            <AutoLayout direction="vertical" spacing={4} padding={8} fill={getColorByMode("code-fill", settings.useDarkMode)} cornerRadius={2}
              width="fill-parent">
              <AutoLayout direction="horizontal" spacing={4} width="fill-parent" verticalAlignItems="center">
                {variableValue.resolvedValue.resolvedType === "COLOR" ? (
                  <Rectangle
                    strokeWidth={isColorBrighter(colorToHexString(variableValue.resolvedValue.value as RGBA), getColorByMode("code-fill", settings.useDarkMode)) ? 0 : 1}
                    stroke={getColorByMode("stroke", settings.useDarkMode)}
                    height={16}
                    width={16}
                    fill={variableValue.resolvedValue.value as RGBA}
                    cornerRadius={2}
                  />
                ) :
                  <></>
                }
                {variableValue.resolvedValue.resolvedType === "BOOLEAN" ? (
                  <Frame width={32} height={16}>
                    <Rectangle
                      height={16}
                      width={32}
                      cornerRadius={16}
                      fill={
                        (variableValue.resolvedValue.value)
                          ? `#0c8ce9`
                          : `#808080`
                      }
                    />
                    <Ellipse
                      height={12}
                      width={12}
                      fill="#FFFFFF"
                      tooltip={`${variableValue.resolvedValue.value as boolean}`}
                      x={(variableValue.resolvedValue.value) ? 18 : 2}
                      y={2}
                    />
                  </Frame>
                ) : (
                  <></>
                )}
                <Text
                  fontSize={16}
                  fontFamily={Styles.variablesFontFamily}
                  horizontalAlignText="left"
                  fill={getColorByMode("text-fill", settings.useDarkMode)}
                  lineHeight={20}
                  width="fill-parent"
                >
                  {value}
                </Text>
              </AutoLayout>
              {settings.showNestedAliasTokens && variableValue.aliasTokenName ? (
                <AutoLayout direction="vertical" width="fill-parent" name="alias-token-wrapper">
                  <AutoLayout direction="horizontal" width="hug-contents" padding={{ top: 8, left: 8, right: 8 }} spacing={8} fill="#444" verticalAlignItems="center" cornerRadius={{ topLeft: 8, topRight: 8 }}>
                    <Text fill={variableValue.aliasTokenCollectionId ? collectionsColorMap.get(variableValue.aliasTokenCollectionId) || "#c270d6" : "#c270d6"} fontSize={12} fontFamily={Styles.variablesFontFamily}
                      horizontalAlignText="left" name="alias-token-collection-name">{variableValue.aliasTokenCollectionName}</Text>
                  </AutoLayout>
                  <AutoLayout direction="horizontal" padding={8} spacing={8} fill="#444" width="fill-parent" verticalAlignItems="center" cornerRadius={{ topRight: 8, bottomLeft: 8, bottomRight: 8 }}>
                    <SVG name="token-icon" src={Icons.figmaLocalVariables(variableValue.aliasTokenCollectionId ? collectionsColorMap.get(variableValue.aliasTokenCollectionId) || "#c270d6" : "#c270d6")} />
                    <Text
                      fontSize={16}
                      fontFamily={Styles.variablesFontFamily}
                      horizontalAlignText="left"
                      fill="#ffffff"
                      lineHeight={20}
                      width="fill-parent"
                      name="alias-token-name"
                    >
                      {variableValue.aliasTokenName}
                    </Text>
                  </AutoLayout>
                </AutoLayout>
              ) :
                <></>
              }
            </AutoLayout>
          </AutoLayout>
        )
      } else {
        return <></>
      }
    });
  }
}

export default VariableValues;
