const { widget } = figma;
const {
  AutoLayout,
  Text,
  Span,
} = widget;

import { getColorByMode } from "@lib/colorHelpers";
import CodeSyntax from "./CodeSyntax";
import { Styles } from "@lib/StyleDefinitions";
import IVariableRow from "./IVariableRow";
import VariableValues from "./VariableValues";
import { IWidgetSettings } from "./WidgetSettings";

const getUrlMatches = (text: string): Array<Array<string> | string> => {
  const urlRegex = /(https?:\/\/[^\s]+)|(www.[^\s]+)/g;

  if (urlRegex.test(text)) {
    let lastIndex = 0;
    return text.match(urlRegex)!.map((s) => {
      const textBlock = text.substring(lastIndex, text.indexOf(s));
      lastIndex = text.indexOf(s) + s.length;
      return [textBlock, s];
    });
  } else {
    return [text];
  }
};

interface IVariableRowsProps {
  collection: VariableCollection;
  variables: ReadonlyArray<IVariableRow>;
  collectionsColorMap: ReadonlyMap<string, string>,
  settings: IWidgetSettings
}

function VariableRows(props: IVariableRowsProps) {
  const { settings, settings: { useDarkMode, showDescriptionColumn, showTypeColumn }, variables, collection, collectionsColorMap } = props;

  return variables
    .map((variable) =>
      <AutoLayout
        key={variable.id}
        direction="horizontal"
        width="fill-parent"
        spacing={0}
      >
        <AutoLayout
          direction="horizontal"
          spacing="auto"
          padding={16}
          width={384}
          height="fill-parent"
          stroke={getColorByMode("stroke", useDarkMode)}
        >
          <Text
            fontSize={16}
            fontFamily={Styles.variablesFontFamily}
            horizontalAlignText="left"
            fill={getColorByMode("text-fill", useDarkMode)}
            lineHeight={20}
            width="fill-parent"
          >
            {variable.name.includes("/") ?
              <Span>
                <Span fill={getColorByMode("text3-fill", useDarkMode)}>
                  {variable.name.substring(
                    0,
                    variable.name.lastIndexOf("/") + 1,
                  )}
                </Span>
                {variable.name.substring(
                  variable.name.lastIndexOf("/") + 1,
                )}
              </Span>
              :
              <Span>{variable.name}</Span>
            }
          </Text>
        </AutoLayout>
        <AutoLayout
          direction="horizontal"
          spacing="auto"
          padding={16}
          width={384 * collection.modes.length + 1}
          verticalAlignItems="start"
          height="fill-parent"
          stroke={getColorByMode("stroke", useDarkMode)}
        >
          <VariableValues variableRow={variable} settings={settings} collectionsColorMap={collectionsColorMap} />
        </AutoLayout>
        <AutoLayout
          direction="vertical"
          spacing={8}
          padding={16}
          width="fill-parent"
          height="fill-parent"
          stroke={getColorByMode("stroke", useDarkMode)}
        >
          <CodeSyntax settings={settings} codeSyntax={variable.codeSyntax} />
        </AutoLayout>
        {showTypeColumn ?
          <AutoLayout
            direction="horizontal"
            spacing="auto"
            padding={16}
            width={128}
            height="fill-parent"
            stroke={getColorByMode("stroke", useDarkMode)}
          >
            <Text
              fontSize={16}
              fontFamily={Styles.variablesFontFamily}
              horizontalAlignText="left"
              fill={getColorByMode("text-fill", useDarkMode)}
              lineHeight={20}
              width="fill-parent"
            >
              {variable.readableType}
            </Text>
          </AutoLayout> : <></>}
        {showDescriptionColumn ?
          <AutoLayout
            direction="horizontal"
            spacing="auto"
            padding={16}
            width={384}
            height="fill-parent"
            stroke={getColorByMode("stroke", useDarkMode)}
          >
            <Text
              fontSize={16}
              fontFamily={Styles.textFontFamily}
              horizontalAlignText="left"
              fill={getColorByMode("text-fill", useDarkMode)}
              lineHeight={20}
              width="fill-parent"
              height="hug-contents"
            >
              {getUrlMatches(variable.description).map((s, i) => {
                return Array.isArray(s) ? (
                  <Span key={i}>
                    <Span>{`${s[0]}`}</Span>
                    <Span
                      fill="#33a7ff"
                      textDecoration="underline"
                      href={s[1]}
                    >{`${s[1]}`}</Span>
                  </Span>
                ) : (
                  <Span key={i}>{`${s} `}</Span>
                );
              })}
            </Text>
          </AutoLayout> : <></>}
      </AutoLayout>
    );
}

export default VariableRows;
