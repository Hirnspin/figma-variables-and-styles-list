import CodeSyntax from "./CodeSyntax"
import { Styles } from "@lib/StyleDefinitions";
import { colordFigmaColor, getColorByMode } from "@lib/colorHelpers";
import { IWidgetSettings } from "./WidgetSettings";
import Color, { ColorType } from "@lib/Color";
import { colord, extend } from "colord";
import a11yPlugin from "colord/plugins/a11y";
import mixPlugin from "colord/plugins/mix";
import { normal } from 'color-blend'

extend([mixPlugin, a11yPlugin]);

const { widget } = figma;
const {
  AutoLayout,
  Text,
  Ellipse,
  Rectangle,
} = widget;

interface PaintPotProps {
  key: string | number
  singleColorValue?: RGBA | WidgetJSX.Color
  multiColorValue?: WidgetJSX.Paint[]
  name: string
  documentationLinks?: ReadonlyArray<DocumentationLink>
  description?: string
  publishStatus?: PublishStatus
  codeSyntax?: { [platform in CodeSyntaxPlatform]?: string }
  settings: IWidgetSettings
}

function PaintPot(props: PaintPotProps) {
  const { multiColorValue, singleColorValue, description, name, documentationLinks, codeSyntax, publishStatus, settings, key } = props;
  let colorValue = '';
  let colorValues: string[] = [];
  let colorTextValueFill = '#000000';

  if (multiColorValue) {
    let singleColorValue = colord('#FFFFFF00');

    multiColorValue.filter((p) => p.type === 'solid').map(c => c as WidgetJSX.SolidPaint)
      .forEach(c => {
        if (ColorType[settings.colorType] === ColorType.HEX) colorValues.push(colordFigmaColor(c.color).toHex());
        if (ColorType[settings.colorType] === ColorType.HSLA) colorValues.push(colordFigmaColor(c.color).toHslString());
        if (ColorType[settings.colorType] === ColorType.RBGA) colorValues.push(colordFigmaColor(c.color).toRgbString());
        singleColorValue = colord(normal(singleColorValue.rgba, colordFigmaColor(c.color, c.opacity).rgba))
      });

    if (singleColorValue) {
      if (ColorType[settings.colorType] === ColorType.HEX) colorValue = singleColorValue.toHex();
      if (ColorType[settings.colorType] === ColorType.HSLA) colorValue = singleColorValue.toHslString();
      if (ColorType[settings.colorType] === ColorType.RBGA) colorValue = singleColorValue.toRgbString();
      colorTextValueFill = singleColorValue.grayscale().isLight() ? "#000000" : "#FFFFFF";
    }

    if (colorValues.length > 1) {
      colorValue = `${colorValues.join(' + ')}\= ${colorValue}`;
    }
  }

  if (singleColorValue) {
    const _color = colordFigmaColor(singleColorValue);

    if (ColorType[settings.colorType] === ColorType.HEX) colorValue = _color.toHex();
    if (ColorType[settings.colorType] === ColorType.HSLA) colorValue = _color.toHslString();
    if (ColorType[settings.colorType] === ColorType.RBGA) colorValue = _color.toRgbString();

    const singleSolidFill = Color.joinSolidPaints(
      [
        { color: { r: 255, g: 255, b: 255, a: 1 }, type: "solid", opacity: 1 },
        { color: singleColorValue, type: "solid", opacity: singleColorValue.a } as WidgetJSX.SolidPaint
      ]
    );

    if (singleSolidFill) {
      colorTextValueFill = _color.grayscale().isLight() ? "#000000" : "#FFFFFF";
    }
  }

  return (
    <AutoLayout
      key={key}
      direction="vertical"
      cornerRadius={8}
      fill={getColorByMode("color-pot-fill", settings.useDarkMode)}
      width="fill-parent"
      height="hug-contents"
      name={name}
      overflow="visible"
      effect={settings.useDarkMode ? undefined : { type: "drop-shadow", blur: 16, color: settings.useDarkMode ? "#FFFFFF40" : "#00000040", offset: { x: 0, y: 2 }, spread: 0 }}
    >
      <AutoLayout
        direction="vertical"
        cornerRadius={8}
        width="fill-parent"
        height="hug-contents"
      >
        <AutoLayout
          name="color-preview"
          height={88}
          spacing={-88}
          width="fill-parent"
          direction="vertical"
          verticalAlignItems="end"
          horizontalAlignItems="center"
          cornerRadius={{ topRight: 8, topLeft: 8 }}>
          {multiColorValue ? multiColorValue.map((paint, paintIndex) =>
            <AutoLayout key={paintIndex} name="paint-wrapper" height={88} width="fill-parent" padding={{ top: paintIndex * 4, horizontal: paintIndex * 4 }}>
              <Rectangle fill={paint} width="fill-parent" height="fill-parent" name={`${paint.type}-paint`} cornerRadius={{ topRight: 8, topLeft: 8 }} />
            </AutoLayout>
          ) : <></>}
          {singleColorValue ? <Rectangle fill={singleColorValue} width="fill-parent" height={88} name="single-paint" /> : <></>}
          <AutoLayout height={88} width="fill-parent" verticalAlignItems="center" horizontalAlignItems="center"
            direction="vertical" name="color-value-wrapper" padding={8}>
            <Text fontFamily={Styles.variablesFontFamily} height="fill-parent" width="fill-parent" name="color-value"
              verticalAlignText="center" horizontalAlignText="center" fontWeight="bold" fill={colorTextValueFill}>
              {colorValue}
            </Text>
          </AutoLayout>
        </AutoLayout>
        <AutoLayout
          width="fill-parent"
          spacing={8}
          padding={16}
          direction="vertical"
        >
          <Text fontWeight="bold" width="fill-parent" fontFamily={Styles.textFontFamily} fontSize={20} textCase="title" fill={getColorByMode("color-pot-text-fill", settings.useDarkMode)}>
            {name.substring(name.lastIndexOf('/') + 1)}
          </Text>
          {codeSyntax ? <CodeSyntax settings={settings} codeSyntax={codeSyntax} /> : <></>}
          <AutoLayout direction="horizontal" spacing={4} verticalAlignItems="center" horizontalAlignItems="center" padding={4} cornerRadius={16} fill="#efefef">
            <Ellipse height={8} width={8} fill={publishStatus === "CURRENT" ? "#79d297" : publishStatus === "CHANGED" ? "#7cc4f8" : "#fca397"} />
            <Text fontFamily={Styles.textFontFamily} fontSize={10} fill="#aaaaaa">
              {publishStatus === "CURRENT" ? "Published" : publishStatus === "CHANGED" ? "Pending changes" : "Local"}
            </Text>
          </AutoLayout>
        </AutoLayout>
      </AutoLayout>
      {
        settings.showDescriptionColumn && (description) ?
          <AutoLayout
            direction="vertical"
            cornerRadius={{ bottomLeft: 8, bottomRight: 8 }}
            fill={getColorByMode("code-fill", settings.useDarkMode)}
            spacing={2}
            width="fill-parent"
            height="hug-contents"
            padding={16}
          >
            <Text width="fill-parent" height="hug-contents" fontFamily={Styles.textFontFamily} fill={getColorByMode("text-fill", settings.useDarkMode)} fontWeight={200} fontSize={12}>
              {description}
            </Text>
            {documentationLinks ? documentationLinks.map((link, linkIndex) =>
              <Text key={linkIndex} width="fill-parent" height="hug-contents" fontFamily={Styles.textFontFamily} fill={getColorByMode("code-text-fill", settings.useDarkMode)} fontWeight={200} fontSize={12} href={link.uri}>{link.uri}</Text>
            ) : <></>}
          </AutoLayout> : <></>
      }
    </AutoLayout >
  )
}

export default PaintPot;
