import { Styles } from "@lib/StyleDefinitions";
import { getColorByMode, collectionColorPalette } from "@lib/colorHelpers";
import {
    columnSplice,
    getReadableType,
} from "@lib/figmaHelpers";
import IVariableRow from "./IVariableRow";
import { IWidgetSettings } from "./WidgetSettings";
import { VariableRowValue } from "./VariableRowValue";
import CodeSyntax from "./CodeSyntax";
import VariableValues from "./VariableValues";
import PaintPot from "./PaintPot";

const { widget } = figma;
const {
    AutoLayout,
    Text,
    Span,
    Frame
} = widget;

type ColorPotVariableGroup = {
    title: string,
    name: string,
    collectionId: string
}

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

const getPaintPotRows = (variableRows: IVariableRow[], collection: VariableCollection, colorPotVariableGroup: ColorPotVariableGroup, settings: IWidgetSettings) => {
    const items = variableRows
        .filter(v => v.collectionId === collection.id && v.readableType === "Color")
        .filter(x => x.name.substring(0, x.name.lastIndexOf("/")) === colorPotVariableGroup.title);
    const rows = columnSplice(items, settings.paintPotColumns, null);

    return rows;
}

const renderVariableNodesAsync = async (collections: VariableCollection[], variables: Variable[], settings: IWidgetSettings): Promise<FigmaDeclarativeNode[]> => {
    const _collectionsColorMap: ReadonlyArray<[string, string]> = collections.map((collection, index) => {
        return [collection.id, collectionColorPalette[index]]
    });
    const collectionsColorMap: ReadonlyMap<string, string> = new Map<string, string>(_collectionsColorMap);
    const variableRows = await Promise.all(variables.map(async (variable) => {
        let variableValuesByMode: Array<VariableRowValue> = [];

        if (collections) {
            const _collection = collections!.find(c => c.id === variable.variableCollectionId);

            if (_collection) {
                variableValuesByMode =
                    await Promise.all(
                        _collection.modes.map(async (m) => (
                            await VariableRowValue.buildAsync({
                                modeName: m.name,
                                modeId: m.modeId,
                                variable: variable
                            })))
                    );
            }
        }
        const { name, description, resolvedType, id } = variable;
        const readableType = getReadableType(resolvedType);
        const isPublished = !variable.hiddenFromPublishing;

        const row: IVariableRow = {
            name,
            description,
            readableType,
            collectionId: variable.variableCollectionId,
            variableValuesByMode,
            id,
            codeSyntax: variable.codeSyntax,
            isPublished,
            scopes: variable.scopes
        };

        return row;
    }));

    let colorPotVariablesGroups: ColorPotVariableGroup[] = [];
    let showRows = true;

    if (settings.displayColorValuesAsPaintPots) {
        colorPotVariablesGroups = variableRows
            .filter(v => v.variableValuesByMode[0].resolvedValue && v.variableValuesByMode[0].resolvedValue.resolvedType === "COLOR")
            .map(y => { return { title: y.name.substring(0, y.name.lastIndexOf("/")), name: y.name.substring(y.name.lastIndexOf("/") + 1, y.name.length), collectionId: y.collectionId } })
            .filter((value, index, self) => index === self.findIndex(groupName => (groupName.title === value.title)))
            .sort((a, b) => a.title && b.title ? a.title.localeCompare(b.title) : 0);
        showRows = variableRows.some((v) => v.variableValuesByMode[0].resolvedValue && v.variableValuesByMode[0].resolvedValue.resolvedType !== "COLOR");
    }

    return collections.map((collection, collectionIndex) =>
        <AutoLayout
            key={collectionIndex}
            direction="vertical"
            horizontalAlignItems="start"
            spacing={40}
            verticalAlignItems="start"
            name={`${collection.name}-collection-wrapper`}
            width="fill-parent"
            overflow="visible"
        >
            <Text
                fontSize={22}
                horizontalAlignText="left"
                fill={collectionsColorMap.get(collection.id) || "#c270d6"}
                fontWeight="medium"
                name="collection-name"
                fontFamily={Styles.textFontFamily}
                width="fill-parent"
                hidden={!settings.showCollectionTitle}
            >
                {collection.name}
            </Text>
            {showRows ?
                <AutoLayout direction="vertical" overflow="visible" name="table-wrapper" width="fill-parent">
                    <AutoLayout direction="horizontal" width="fill-parent" name="table-head-wrapper">
                        <AutoLayout
                            direction="horizontal"
                            spacing="auto"
                            padding={16}
                            width="fill-parent"
                            name="column-head-name"
                            stroke={getColorByMode("stroke", settings.useDarkMode)}
                        >
                            <Text
                                fontSize={16}
                                fontFamily={Styles.textFontFamily}
                                fontWeight="bold"
                                horizontalAlignText="left"
                                fill={getColorByMode("text-fill", settings.useDarkMode)}
                                lineHeight={20}
                                width="fill-parent"
                            >
                                Name
                            </Text>
                        </AutoLayout>
                        <AutoLayout
                            direction="horizontal"
                            spacing="auto"
                            padding={16}
                            name="column-head-value"
                            width="fill-parent"
                            stroke={getColorByMode("stroke", settings.useDarkMode)}
                        >
                            <Text
                                fontSize={16}
                                fontFamily={Styles.textFontFamily}
                                fontWeight="bold"
                                horizontalAlignText="left"
                                fill={getColorByMode("text-fill", settings.useDarkMode)}
                                lineHeight={20}
                                width="fill-parent">
                                Value
                            </Text>
                        </AutoLayout>
                        {settings.showCodeSyntax ?
                            <AutoLayout
                                direction="horizontal"
                                spacing="auto"
                                padding={16}
                                width="fill-parent"
                                stroke={getColorByMode("stroke", settings.useDarkMode)}
                                name="column-head-code-syntax"
                            >
                                <Text
                                    fontSize={16}
                                    fontFamily={Styles.textFontFamily}
                                    fontWeight="bold"
                                    horizontalAlignText="left"
                                    fill={getColorByMode("text-fill", settings.useDarkMode)}
                                    lineHeight={20}
                                    width="fill-parent"
                                >
                                    Code syntax
                                </Text>
                            </AutoLayout> : <></>}
                        {settings.showTypeColumn ?
                            <AutoLayout
                                direction="horizontal"
                                spacing="auto"
                                padding={16}
                                width="fill-parent"
                                stroke={getColorByMode("stroke", settings.useDarkMode)}
                                name="column-head-type"
                            >
                                <Text
                                    fontSize={16}
                                    fontFamily={Styles.textFontFamily}
                                    fontWeight="bold"
                                    horizontalAlignText="left"
                                    fill={getColorByMode("text-fill", settings.useDarkMode)}
                                    lineHeight={20}
                                    width="fill-parent"
                                >
                                    Type
                                </Text>
                            </AutoLayout> : null}
                        {settings.showDescriptionColumn ?
                            <AutoLayout
                                direction="horizontal"
                                spacing="auto"
                                padding={16}
                                width="fill-parent"
                                stroke={getColorByMode("stroke", settings.useDarkMode)}
                                name="column-head-description"
                            >
                                <Text
                                    fontSize={16}
                                    fontFamily={Styles.textFontFamily}
                                    fontWeight="bold"
                                    horizontalAlignText="left"
                                    fill={getColorByMode("text-fill", settings.useDarkMode)}
                                    lineHeight={20}
                                    width="fill-parent"
                                >
                                    Description
                                </Text>
                            </AutoLayout> : null}
                    </AutoLayout>
                    {variableRows
                        .filter((v) => settings.displayColorValuesAsPaintPots ? v.variableValuesByMode[0].resolvedValue && v.variableValuesByMode[0].resolvedValue.resolvedType !== "COLOR" : true)
                        .map((variable, variableIndex) =>
                            <AutoLayout
                                key={variableIndex}
                                direction="horizontal"
                                width="fill-parent"
                                spacing={0}
                            >
                                <AutoLayout
                                    direction="horizontal"
                                    spacing="auto"
                                    padding={16}
                                    width="fill-parent"
                                    height="fill-parent"
                                    stroke={getColorByMode("stroke", settings.useDarkMode)}
                                >
                                    <Text
                                        fontSize={16}
                                        fontFamily={Styles.variablesFontFamily}
                                        horizontalAlignText="left"
                                        fill={getColorByMode("text-fill", settings.useDarkMode)}
                                        lineHeight={20}
                                        width="fill-parent"
                                    >
                                        {variable.name.includes("/") ? (
                                            <Span>
                                                <Span fill={getColorByMode("text3-fill", settings.useDarkMode)}>
                                                    {variable.name.substring(
                                                        0,
                                                        variable.name.lastIndexOf("/") + 1,
                                                    )}
                                                </Span>
                                                {variable.name.substring(
                                                    variable.name.lastIndexOf("/") + 1,
                                                )}
                                            </Span>
                                        ) : (
                                            <Span>{variable.name}</Span>
                                        )}
                                    </Text>
                                </AutoLayout>
                                <AutoLayout
                                    direction="vertical"
                                    spacing={8}
                                    padding={16}
                                    width="fill-parent"
                                    verticalAlignItems="start"
                                    height="fill-parent"
                                    stroke={getColorByMode("stroke", settings.useDarkMode)}
                                >
                                    <VariableValues variableRow={variable} settings={settings} collectionsColorMap={collectionsColorMap} />
                                </AutoLayout>
                                {settings.showCodeSyntax ?
                                    <AutoLayout
                                        direction="vertical"
                                        spacing={8}
                                        padding={16}
                                        width="fill-parent"
                                        height="fill-parent"
                                        stroke={getColorByMode("stroke", settings.useDarkMode)}
                                    >
                                        <CodeSyntax settings={settings} codeSyntax={variable.codeSyntax} />
                                    </AutoLayout> : <></>}
                                {settings.showTypeColumn ? (
                                    <AutoLayout
                                        direction="horizontal"
                                        spacing="auto"
                                        padding={16}
                                        width="fill-parent"
                                        height="fill-parent"
                                        stroke={getColorByMode("stroke", settings.useDarkMode)}
                                    >
                                        <Text
                                            fontSize={16}
                                            fontFamily={Styles.variablesFontFamily}
                                            horizontalAlignText="left"
                                            fill={getColorByMode("text-fill", settings.useDarkMode)}
                                            lineHeight={20}
                                            width="fill-parent"
                                        >
                                            {variable.readableType}
                                        </Text>
                                    </AutoLayout>) : null}
                                {settings.showDescriptionColumn ? (
                                    <AutoLayout
                                        direction="horizontal"
                                        spacing="auto"
                                        padding={16}
                                        width="fill-parent"
                                        height="fill-parent"
                                        stroke={getColorByMode("stroke", settings.useDarkMode)}
                                    >
                                        <Text
                                            fontSize={16}
                                            fontFamily={Styles.textFontFamily}
                                            horizontalAlignText="left"
                                            fill={getColorByMode("text-fill", settings.useDarkMode)}
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
                                    </AutoLayout>) : null}
                            </AutoLayout>
                        )
                    }
                </AutoLayout> : <></>}
            {colorPotVariablesGroups && colorPotVariablesGroups.filter(v => v.collectionId === collection.id).length > 0 ?
                <AutoLayout
                    direction="vertical"
                    horizontalAlignItems="start"
                    spacing={40}
                    height="hug-contents"
                    width="fill-parent"
                    verticalAlignItems="start"
                    overflow="visible"
                    name="table-body-wrapper"
                >
                    {colorPotVariablesGroups
                        .filter(v => v.collectionId === collection.id)
                        .map((gn, gni) =>
                            <AutoLayout key={gni} width="fill-parent" direction="vertical" overflow="visible" spacing={24}>
                                <Text fontSize={22}
                                    horizontalAlignText="left"
                                    fill={collectionsColorMap.get(collection.id) || "#c270d6"}
                                    fontWeight="medium"
                                    fontFamily={Styles.textFontFamily}
                                    width="fill-parent" textCase="title"
                                    name="title"
                                    hidden={!settings.showCollectionTitle || !(gn.title)}>
                                    {gn.title.replace(/\//g, " ")}
                                </Text>
                                {getPaintPotRows(variableRows, collection, gn, settings).map((column, columnIndex) =>
                                    <AutoLayout direction="horizontal" name="color-variables" overflow="visible" spacing={40} width="fill-parent" wrap={true} key={columnIndex} >
                                        {column.map((vr, vrIndex) =>
                                            vr !== null ?
                                                <PaintPot key={vrIndex} name={vr.name} description={vr.description} publishStatus={vr.variableValuesByMode[0].publishingStatus!}
                                                    singleColorValue={vr.variableValuesByMode[0].resolvedValue && vr.variableValuesByMode[0].resolvedValue.value as WidgetJSX.Color} settings={settings} codeSyntax={vr.codeSyntax} />
                                                : <Frame width="fill-parent" height="fill-parent" name="placeholder"></Frame>
                                        )}
                                    </AutoLayout>
                                )}
                            </AutoLayout>)}
                </AutoLayout> : <></>}
        </AutoLayout>
    )
}

export { renderVariableNodesAsync };