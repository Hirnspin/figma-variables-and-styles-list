const { widget } = figma;
const {
  AutoLayout,
  Text
} = widget;

import { IWidgetSettings } from "./WidgetSettings";

interface IGridStyleRowProps {
  styles: GridStyle[]
  settings: IWidgetSettings
}

const renderGridStyleNodesAsync = async (props: IGridStyleRowProps): Promise<FigmaDeclarativeNode[]> => {
  const { styles, settings } = props;

  return (
    <AutoLayout
      direction="horizontal"
      width="hug-contents"
      height="hug-contents"
      spacing={0}
      verticalAlignItems="end"
      name="grid-style-nodes"
    >
      {styles.map(style => <Text key={style.id}>{style.name}</Text>)}
    </AutoLayout>
  )
}

export { renderGridStyleNodesAsync };
