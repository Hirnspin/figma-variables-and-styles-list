const { widget } = figma;
const {
  AutoLayout,
  Text,
  Frame,
} = widget;

import { Styles } from "@lib/StyleDefinitions";
import { IWidgetSettings } from "./WidgetSettings";
import { PaintStyleNodeValue } from "./PaintStyleNodeValue";
import PaintPot from "./PaintPot";
import { columnSplice } from "@lib/figmaHelpers";

interface IPaintStyleNodeFrameProps {
  styles: PaintStyle[]
  settings: IWidgetSettings
}

const renderPaintStyleNodesAsync = async (props: IPaintStyleNodeFrameProps): Promise<FigmaDeclarativeNode> => {
  const { styles, settings } = props;

  const styleNodeValues = await Promise.all(
    styles.map(async (style) => {
      const _node = await PaintStyleNodeValue.buildAsync({
        style: style
      })
      return _node;
    }
    ));

  const groupNames = styleNodeValues
    .map(y => { return y.groupName })
    .filter((value, index, self) => index === self.findIndex(groupName => (groupName === value)));

  return groupNames.map((groupName, groupIndex) => (
    <AutoLayout
      direction="vertical"
      horizontalAlignItems="start"
      spacing={40}
      height="hug-contents"
      width="fill-parent"
      verticalAlignItems="start"
      overflow="visible"
      name={`style-pot-group-${groupName.toLowerCase()}`}
      key={groupIndex}
    >
      <Text fontSize={22}
        horizontalAlignText="left"
        fill="#c270d6"
        fontWeight="medium"
        name="collection-name"
        fontFamily={Styles.textFontFamily}
        width="fill-parent" hidden={!settings.showCollectionTitle}>
        {groupName ? groupName : 'Color styles'}
      </Text>
      {columnSplice(styleNodeValues.filter(s => s.groupName === groupName), settings.paintPotColumns, null)
        .map((column, columnIndex) =>
          <AutoLayout direction="horizontal" name="color-variables" overflow="visible" spacing={40} width="fill-parent" wrap={true} key={columnIndex} >
            {column.map((styleNodeValue, styleNodeIndex) =>
              styleNodeValue !== null ?
                <PaintPot key={styleNodeIndex} name={styleNodeValue.name} description={styleNodeValue.style.description} publishStatus={styleNodeValue.publishStatus}
                  multiColorValue={styleNodeValue.widgetPaints} settings={settings} documentationLinks={styleNodeValue.style.documentationLinks} />
                : <Frame width="fill-parent" height="fill-parent" name="placeholder"></Frame>
            )}
          </AutoLayout>
        )}
    </AutoLayout>
  ))
}

export { renderPaintStyleNodesAsync };
