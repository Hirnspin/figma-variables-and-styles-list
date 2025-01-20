const { widget } = figma;
const {
  AutoLayout
} = widget;

import { IWidgetSettings } from "./WidgetSettings";
import { renderDropShadowStyleAsync } from "./DropShadowStyle";

interface IEffectStyleRowProps {
  styles: EffectStyle[]
  settings: IWidgetSettings
}

const renderEffectStyleNodesAsync = async (props: IEffectStyleRowProps): Promise<FigmaDeclarativeNode[]> => {
  const { styles, settings } = props;
  let effectStyleNodes: FigmaDeclarativeNode[] = [];

  const fetchAllEffectStyleNodes = async (styles: EffectStyle[]): Promise<FigmaDeclarativeNode[]> => {
    return Promise.all(styles.map(async style => await renderDropShadowStyleAsync({ style, settings })));
  }

  fetchAllEffectStyleNodes(styles).then(nodes => effectStyleNodes = nodes);

  return <AutoLayout
    direction="horizontal"
    width="hug-contents"
    height="hug-contents"
    spacing={0}
    verticalAlignItems="end"
    name="effect-style-nodes"
  >{effectStyleNodes}</AutoLayout>;
}

export { renderEffectStyleNodesAsync };
