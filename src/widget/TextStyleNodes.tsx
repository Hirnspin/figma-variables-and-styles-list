const { widget } = figma;
const {
  AutoLayout,
  Text
} = widget;

import DescriptionItem from "./DescriptionItem";
import { Styles } from "@lib/StyleDefinitions";
import { IWidgetSettings } from "./WidgetSettings";

interface ITextStyleRowProps {
  styles: TextStyle[]
  settings: IWidgetSettings
}

const renderTextStyleNodesAsync = async (props: ITextStyleRowProps): Promise<FigmaDeclarativeNode[]> => {
  const { styles, settings: { useDarkMode, useRemUnit = false, baseUnit = 1, showDescriptionColumn } } = props;
  const getReadableUnit = (unit: 'PIXELS' | 'PERCENT') => {
    switch (unit) {
      case "PERCENT":
        return "%"
      case "PIXELS":
        return "px"
    }
  };

  return (
    <AutoLayout
      direction="vertical"
      width="hug-contents"
      height="hug-contents"
      spacing={8}
      verticalAlignItems="end"
      name="text-style-nodes"
      hidden={styles.length <= 0}
    >
      {styles.map(style =>
        <AutoLayout
          key={style.id}
          direction="horizontal"
          width="hug-contents"
          height="hug-contents"
          spacing={0}
          verticalAlignItems="end"
          name={style.name}
        >
          <DescriptionItem label="Name" value={style.name} useDarkMode={useDarkMode} />
          {showDescriptionColumn ?
            <DescriptionItem label="Description & usage" value={style.description} useDarkMode={useDarkMode} valueTextSize={16} height="hug-contents" /> : <></>}
          <DescriptionItem
            label="Size"
            value={`${style.fontSize}px`}
            additionalText={useRemUnit ? `${style.fontSize / baseUnit}rem` : undefined} useDarkMode={useDarkMode} />
          <DescriptionItem
            label="Line height"
            value={style.lineHeight.unit === "AUTO" ? "Auto" : `${style.lineHeight.value}${getReadableUnit(style.lineHeight.unit)}`}
            additionalText={useRemUnit && style.lineHeight.unit === "PIXELS" ? `${style.lineHeight.value / baseUnit}rem` : undefined}
            useDarkMode={useDarkMode} />
          <DescriptionItem label="Weight" value={style.fontName.style} useDarkMode={useDarkMode} />
          <AutoLayout padding={{ left: 40 }} width="hug-contents">
            <Text fontSize={style.fontSize} font={{ family: style.fontName.family, style: style.fontName.style }} fill={Styles.hintColor}>Text {style.name}</Text>
          </AutoLayout>
        </AutoLayout>)}
    </AutoLayout>
  )
}

export { renderTextStyleNodesAsync };
