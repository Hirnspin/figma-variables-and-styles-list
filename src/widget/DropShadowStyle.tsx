const { widget } = figma;
const {
    AutoLayout,
    Text,
    Ellipse,
} = widget;

import { Styles } from "@lib/StyleDefinitions";
import { IWidgetSettings } from "./WidgetSettings";
import { colorToRgbaString } from "@lib/colorHelpers";

interface IShadowStyleProps {
    style: EffectStyle
    settings: IWidgetSettings
}

const renderDropShadowStyleAsync = async (props: IShadowStyleProps): Promise<FigmaDeclarativeNode> => {
    const { style, settings: { useDarkMode, showDescriptionColumn } } = props;
    const dropShadowEffect: WidgetJSX.DropShadowEffect[] = style.effects
        .filter((value) => value.type === "DROP_SHADOW")
        .map(x => x as DropShadowEffect)
        .map(x => {
            return Object.assign(x,
                {
                    blur: x.radius,
                    type: "drop-shadow",
                    blendMode: x.blendMode.replace('_', '-').toLowerCase()
                } as WidgetJSX.DropShadowEffect)
        });
    const cssValue: string[] = dropShadowEffect
        //.map(x => x as any)
        //.map(x => `${x.boundVariables && x.boundVariables.offsetX ? x.boundVariables.offsetX : x.offset.x} ${x.boundVariables && x.boundVariables.offsetY ? x.boundVariables.offsetY : x.offset.y} ${x.boundVariables && x.boundVariables.radius ? x.boundVariables.radius : x.radius} ${x.boundVariables && x.boundVariables.spread ? x.boundVariables.spread : x.spread} ${x.boundVariables && x.boundVariables.color ? x.boundVariables.color : x.color}`);
        .map(x => `${x.offset.x}px ${x.offset.y}px ${x.blur}px ${x.spread}px ${colorToRgbaString(x.color)}`);

    const publishStatus = await style.getPublishStatusAsync();

    return (
        <AutoLayout
            direction="vertical"
            cornerRadius={8}
            fill="#ffffff"
            width={"fill-parent"}
            height="hug-contents"
            name={style.name}
            overflow="visible"
            effect={{ type: "drop-shadow", blur: 16, color: useDarkMode ? "#FFFFFF40" : "#00000040", offset: { x: 0, y: 2 }, spread: 0 }}
        >
            <AutoLayout
                direction="vertical"
                cornerRadius={8}
                width="fill-parent"
                height="hug-contents"
            >
                <AutoLayout
                    name="Shadow container"
                    padding={32}
                    height={104} width="fill-parent"
                    cornerRadius={{ topRight: 8, topLeft: 8 }}>
                    <AutoLayout cornerRadius={8}
                        name="Shadow"
                        fill="#ffffff"
                        effect={dropShadowEffect}
                        width="fill-parent" height="fill-parent">
                    </AutoLayout>
                </AutoLayout>
                <AutoLayout
                    width="fill-parent"
                    spacing={4}
                    padding={16}
                    direction="vertical"
                >
                    <Text fontWeight="bold" width="fill-parent" fontFamily={Styles.textFontFamily}>
                        {style.name}
                    </Text>
                    <Text>
                        {`${cssValue.join(',\n')};`}
                    </Text>
                    <AutoLayout direction="horizontal" spacing={4} verticalAlignItems="center" horizontalAlignItems="center" padding={4} cornerRadius={16} fill="#efefef">
                        <Ellipse height={8} width={8} fill={publishStatus === "CURRENT" ? "#79d297" : publishStatus === "CHANGED" ? "#7cc4f8" : "#fca397"} />
                        <Text fontFamily={Styles.textFontFamily} fontSize={10} fill="#aaaaaa">
                            {publishStatus === "CURRENT" ? "Published" : publishStatus === "CHANGED" ? "Pending changes" : "Local"}
                        </Text>
                    </AutoLayout>
                </AutoLayout>
            </AutoLayout>
            {showDescriptionColumn && (style.documentationLinks.length > 0 || style.description) ?
                <AutoLayout
                    direction="vertical"
                    cornerRadius={{ bottomLeft: 8, bottomRight: 8 }}
                    fill="#eeeeee"
                    spacing={2}
                    width="fill-parent"
                    height="hug-contents"
                    padding={16}
                >
                    <Text width="fill-parent" height="hug-contents" fontFamily={Styles.textFontFamily} fill="#555555" fontWeight={200} fontSize={12}>{style.description}</Text>
                    {style.documentationLinks.map(link =>
                        <Text width="fill-parent" height="hug-contents" fontFamily={Styles.textFontFamily} fill="#555555" fontWeight={200} fontSize={12} href={link.uri}>{link.uri}</Text>
                    )}
                </AutoLayout> : <></>}
        </AutoLayout>
    )
}

export { renderDropShadowStyleAsync };
