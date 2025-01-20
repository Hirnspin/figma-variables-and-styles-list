const { widget } = figma;
const {
    AutoLayout,
    Text,
} = widget;
import { getColorByMode } from "@lib/colorHelpers";
import { IWidgetSettings } from './WidgetSettings';

export interface ICodeSyntaxProps {
    codeSyntax: {
        [platform in CodeSyntaxPlatform]?: string;
    };
    settings: IWidgetSettings;
}

function CodeSyntaxWeb(props: ICodeSyntaxProps) {
    const { codeSyntax, settings: { useDarkMode, showIosCodeSyntax, showAndroidCodeSyntax, showWebCodeSyntax } } = props;

    if (codeSyntax) {
        return Object.entries(codeSyntax)
            .filter(([, value]) => (typeof value) !== "undefined")
            .filter(([_platform, _codeSyntax]) => (_platform === "WEB" && showWebCodeSyntax) || (_platform === "ANDROID" && showAndroidCodeSyntax) || (_platform === "iOS" && showIosCodeSyntax))
            .map(([_platform, _codeSyntax], index) => {
                return (
                    <AutoLayout
                        key={index}
                        direction="vertical"
                        verticalAlignItems="center"
                        width="fill-parent"
                        spacing={-1}
                    >
                        <AutoLayout direction="horizontal" padding={{ top: 8, left: 8, right: 8 }} spacing={8}
                            fill={getColorByMode("code-fill", useDarkMode)} verticalAlignItems="center" cornerRadius={{ topLeft: 8, topRight: 8 }}>
                            <Text fill={getColorByMode("text-fill", useDarkMode)} fontSize={12} fontFamily="Source Code Pro"
                                horizontalAlignText="left">{_platform}</Text>
                        </AutoLayout>
                        <AutoLayout
                            direction="vertical"
                            spacing="auto"
                            padding={8}
                            width="fill-parent"
                            fill={getColorByMode("code-fill", useDarkMode)}
                            cornerRadius={{ topRight: 8, bottomLeft: 8, bottomRight: 8 }}
                        >
                            <Text
                                fontSize={16}
                                fontFamily="Source Code Pro"
                                horizontalAlignText="left"
                                fill={getColorByMode("code-text-fill", useDarkMode)}
                                lineHeight={20}
                                width="fill-parent"
                            >
                                {_codeSyntax}
                            </Text>
                        </AutoLayout>
                    </AutoLayout>
                )
            });
    }
}

export default CodeSyntaxWeb;