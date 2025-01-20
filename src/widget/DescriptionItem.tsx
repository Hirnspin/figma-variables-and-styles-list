import { Styles } from "@lib/StyleDefinitions";
import { getColorByMode } from "@lib/colorHelpers";

const { widget } = figma;
const {
  AutoLayout,
  Text,
  Line,
} = widget;

interface IDescriptionItemProps {
  border?: "Bottom" | "Left" | "None"
  useDarkMode: boolean
  label: string
  value: string | number
  additionalText?: string | number
  height?: "fill-parent" | "hug-contents"
  valueTextSize?: number
}

function DescriptionItem(props: IDescriptionItemProps) {
  const { border = "Bottom", useDarkMode, label, value, additionalText, height = "fill-parent", valueTextSize = 22 } = props;
  const useBorder = border === "Bottom" || border === "Left";

  return (
    <AutoLayout width={256} height={height} direction={border === "Bottom" ? "vertical" : "horizontal"} spacing="auto" name="Description item">
      <AutoLayout width="fill-parent" padding={24} height="hug-contents" direction="vertical">
        <AutoLayout width="fill-parent" spacing={4} height="hug-contents" direction="vertical">
          <Text name="Label" fontFamily={Styles.textFontFamily} fontSize={14} fill={getColorByMode("text-fill", useDarkMode)} width="fill-parent">
            {label}
          </Text>
          <Text name="Value" fontFamily={Styles.textFontFamily} fontSize={valueTextSize} fill={getColorByMode("text-fill", useDarkMode)} width="fill-parent">
            {value}
          </Text>
        </AutoLayout>
        {additionalText ?
          <Text name="Additional text" fontFamily={Styles.textFontFamily} fontSize={14} fill={getColorByMode("text-fill", useDarkMode)} width="fill-parent">
            {additionalText}
          </Text> : <></>}
      </AutoLayout>
      {useBorder ? <Line length="fill-parent" stroke={getColorByMode("stroke", useDarkMode)} strokeWidth={1} rotation={border === "Bottom" ? 0 : 90} /> : <></>}
    </AutoLayout>
  )
}

export default DescriptionItem;
