const { widget } = figma;
const {
  AutoLayout,
  SVG,
  Text,
  Line,
  usePropertyMenu,
  useSyncedState,
  useEffect,
  waitForTask,
} = widget;
import Icons from "@lib/Icons";
import { Styles } from "@lib/StyleDefinitions";
import { getColorByMode } from "@lib/colorHelpers";
import { WidgetSettings, IWidgetSettings } from "./WidgetSettings";
import { renderVariableNodesAsync } from "./VariableNodes";
//import { renderEffectStyleNodesAsync } from "./EffectStyleNodes";
//import { renderGridStyleNodesAsync } from "./GridStyleNodes";
import { renderTextStyleNodesAsync } from "./TextStyleNodes";
import { renderPaintStyleNodesAsync } from "./PaintStyleNodes";

const LOAD_ALL_NOTIFICATION_TEXT = 'Depending on how many variables, styles and collections you have, it may take some time until everything is loaded.';

function Widget() {
  const [settings, setSettings] = useSyncedState<IWidgetSettings>("settings", new WidgetSettings());
  const [init, setInit] = useSyncedState("init", false);
  const [variableNodes, setVariableNodes] = useSyncedState<FigmaDeclarativeNode>("variableNodes", null);
  const [paintStyleNodes, setPaintStyleNodes] = useSyncedState<FigmaDeclarativeNode>("paintStyleNodes", null);
  const [textStyleNodes, setTextStyleNodes] = useSyncedState<FigmaDeclarativeNode>("textStyleNodes", null);
  /// TODO: Add support for Grid & Effect styles
  //const [gridStyleNodes, setGridStyleNodes] = useSyncedState<FigmaDeclarativeNode>("gridStyleNodes", null);
  //const [effectStyleNodes, setEffectStyleNodes] = useSyncedState<FigmaDeclarativeNode>("effectStyleNodes", null);

  function resetInit() {
    setInit(false);
    figma.closePlugin();
  }

  async function showSettingsUiAsync() {
    return new Promise(async () => {
      figma.showUI(__html__,
        { width: 448, height: 512, title: "Local Variables List Settings", themeColors: true });
      const collections = await figma.variables.getLocalVariableCollectionsAsync();
      const newSettings = Object.assign(settings, { collections: collections.map(c => [c.id, c.name]) });
      setSettings(newSettings);
      figma.ui.postMessage(newSettings);
    });
  }

  const getfilteredVariables = (variables: Variable[]) => {
    const re = new RegExp(settings.queryFilter);
    const filterFn = re.exec.bind(re);

    return variables
      .filter(v => settings.onlyPublished ? !v.hiddenFromPublishing : true)
      .filter((v) => settings.queryFilter ? filterFn(v.name) : true);
  };

  usePropertyMenu(
    [
      {
        propertyName: "UPDATE",
        itemType: "action",
        tooltip: "Click to update the list.",
        icon: Icons.refreshButton(),
      },
      {
        itemType: 'separator'
      },
      {
        propertyName: "SETTINGS",
        itemType: "action",
        tooltip: "Open settings.",
        icon: Icons.settings()
      },
      {
        itemType: 'separator'
      },
      {
        propertyName: "DARK_MODE",
        itemType: "toggle",
        isToggled: settings.useDarkMode,
        tooltip: settings.useDarkMode ? "Turn lights on." : "T  urn lights off.",
        icon: settings.useDarkMode
          ? Icons.useLightMode()
          : Icons.useDarkMode(),
      },
    ],
    async (e): Promise<void> => {
      switch (e.propertyName) {
        case "UPDATE":
          setInit(false);
          break;
        case "SETTINGS":
          await showSettingsUiAsync();
          break;
        case "DARK_MODE":
          setSettings(prevSettings => { return Object.assign(settings, { useDarkMode: !prevSettings.useDarkMode }) });
          setInit(false);
          break;
      }
    },
  );

  useEffect(() => {
    figma.ui.onmessage = (msg) => {
      if (msg.type === 'save') {
        setSettings(currentSettings => {
          if (JSON.stringify(currentSettings) !== JSON.stringify(msg.settings)) {
            setTimeout(resetInit, 500);
            return Object.assign(currentSettings, msg.settings);
          } else {
            setTimeout(figma.closePlugin, 500);
            return currentSettings;
          }
        });
      } else {
        figma.closePlugin();
      }
    };

    waitForTask(new Promise<void>(async (resolve) => {
      if (!init) {
        setInit(true);

        if (settings.selectedVariableCollection !== "NONE") {
          console.log('Get variables...');

          const variablesPromise = figma.variables.getLocalVariablesAsync();
          const collectionsPromise = figma.variables.getLocalVariableCollectionsAsync();

          Promise.all([collectionsPromise, variablesPromise]).then(async (result) => {
            let collections = result[0];
            let variables = getfilteredVariables(result[1]);

            if (settings.selectedVariableCollection !== "ALL") {
              collections = collections.filter(c => c.id === settings.selectedVariableCollection);
              variables = variables.filter(v => v.variableCollectionId === settings.selectedVariableCollection);
            } else {
              figma.notify(LOAD_ALL_NOTIFICATION_TEXT);
            }

            const _variableNodes = await renderVariableNodesAsync(collections, variables, settings);

            setVariableNodes(_variableNodes);
            figma.notify(`Loading ${result[1].length} variables...`);
          });
        } else {
          setVariableNodes(null);
        }

        if (settings.selectedStyleType === "NONE") {
          console.log('Nothing to render 🎈');
          /// TODO: Add support for Grid & Effect styles
          //setGridStyleNodes(null);
          //setEffectStyleNodes(null);
          setTextStyleNodes(null);
          setPaintStyleNodes(null);
        }

        /// TODO: Add support for Grid & Effect styles

        /*else if (settings.selectedStyleType === "GRID") {
          Promise.resolve(figma.getLocalGridStylesAsync()).then(async (result) => {
            if (result && result.length > 0) {
              const _gridStyleNodes = await renderGridStyleNodesAsync({ styles: result, settings: settings });
              setGridStyleNodes(_gridStyleNodes);
            }
          }).finally(() => {
            console.log('Grid styles loaded 🚀');
          });
        } else if (settings.selectedStyleType === "EFFECT") {
          Promise.resolve(figma.getLocalEffectStylesAsync()).then(async (result) => {
            if (result && result.length > 0) {
              const _effectStyleNodes = await renderEffectStyleNodesAsync({ styles: result, settings: settings });
              setEffectStyleNodes(_effectStyleNodes);
            }
          }).finally(() => {
            console.log('Effect styles loaded 🚀');
          });
        }*/

        else if (settings.selectedStyleType === "TEXT") {
          Promise.resolve(figma.getLocalTextStylesAsync()).then(async (result) => {
            if (result && result.length > 0) {
              const _textStyleNodes = await renderTextStyleNodesAsync({ styles: result, settings: settings });
              setTextStyleNodes(_textStyleNodes);
            }
          }).finally(() => {
            console.log('Text styles loaded 🚀');
          });
        } else if (settings.selectedStyleType === "PAINT") {
          const paintStyles = await figma.getLocalPaintStylesAsync();
          const _paintStyleNodes = await renderPaintStyleNodesAsync({ styles: paintStyles, settings: settings });

          setPaintStyleNodes(_paintStyleNodes);
        } else if (settings.selectedStyleType === "ALL") {
          figma.notify(LOAD_ALL_NOTIFICATION_TEXT);

          /// TODO: Add support for Grid & Effect styles

          //const gridStylesPromise = figma.getLocalGridStylesAsync();
          //const effectStylesPromise = figma.getLocalEffectStylesAsync();
          const textStylesPromise = figma.getLocalTextStylesAsync();
          const paintStylesPromise = figma.getLocalPaintStylesAsync();

          Promise.all([/* gridStylesPromise, effectStylesPromise,  */textStylesPromise, paintStylesPromise]).then(async (result) => {
            /* const gridStyles = result[0];
            if (gridStyles && gridStyles.length > 0) {
              const _gridStyleNodes = await renderGridStyleNodesAsync({ styles: gridStyles, settings });
              setGridStyleNodes(_gridStyleNodes);
            }

            const effectStyles = result[1];
            if (effectStyles && effectStyles.length > 0) {
              const _effectStyleNodes = await renderEffectStyleNodesAsync({ styles: effectStyles, settings });
              setEffectStyleNodes(_effectStyleNodes);
            } */

            const textStyles = result[0];
            if (textStyles) {
              const _textStyleNodes = await renderTextStyleNodesAsync({ styles: textStyles, settings });
              setTextStyleNodes(_textStyleNodes);
            }

            const paintStyles = result[1];
            if (paintStyles) {
              const _paintStyleNodes = await renderPaintStyleNodesAsync({ styles: paintStyles, settings });
              setPaintStyleNodes(_paintStyleNodes);
            }
          }).finally(() => {
            console.log('All styles loaded 🚀');
          });
        }
      }
      console.log('Done');
      resolve();
    }));
  });
  /*
      waitForTask(new Promise<void>(async (resolve) => {
        if ((!textStyles || textStyles.length <= 0) && !GET_FILTERED_TEXT_STYLES_CALL_IS_RUNNING) {
          GET_FILTERED_TEXT_STYLES_CALL_IS_RUNNING = true;
          const _textStyles = await getFilteredTextStylesAsync();
          setTextStyles(_textStyles);
          GET_FILTERED_TEXT_STYLES_CALL_IS_RUNNING = false;
          resolve();
        }
      }));
   
      waitForTask(new Promise<void>(async (resolve) => {
        if ((!effectStyles || effectStyles.length <= 0) && !GET_FILTERED_EFFECT_STYLES_CALL_IS_RUNNING) {
          GET_FILTERED_EFFECT_STYLES_CALL_IS_RUNNING = true;
          const _effectStyles = await getFilteredEffectStylesAsync();
          setEffectStyles(_effectStyles);
          GET_FILTERED_EFFECT_STYLES_CALL_IS_RUNNING = false;
          resolve();
        }
      }));
   
      waitForTask(new Promise<void>(async (resolve) => {
        if ((!gridStyles || gridStyles.length <= 0) && !GET_FILTERED_GRID_STYLES_CALL_IS_RUNNING) {
          GET_FILTERED_GRID_STYLES_CALL_IS_RUNNING = true;
          const _gridStyles = await getFilteredGridStylesAsync();
          setGridStyles(_gridStyles);
          GET_FILTERED_GRID_STYLES_CALL_IS_RUNNING = false;
          resolve();
        }
      }));
   
      waitForTask(new Promise<void>(async (resolve) => {
        if ((!paintStyles || paintStyles.length <= 0) && !GET_FILTERED_PAINT_STYLES_CALL_IS_RUNNING) {
          GET_FILTERED_PAINT_STYLES_CALL_IS_RUNNING = true;
          const _paintStyles = await getFilteredPaintStylesAsync();
          setPaintStyles(_paintStyles);
          GET_FILTERED_PAINT_STYLES_CALL_IS_RUNNING = false;
          resolve();
        }
      }));
    });
  */
  if (variableNodes || paintStyleNodes || textStyleNodes) {
    /// TODO: Add support for Grid & Effect styles
    // || effectStyleNodes || gridStyleNodes) {
    return (
      <AutoLayout
        cornerRadius={16}
        direction="vertical"
        fill={getColorByMode("background-fill", settings.useDarkMode)}
        stroke={getColorByMode("code-fill", settings.useDarkMode)}
        strokeWidth={4}
        height="hug-contents"
        width="hug-contents"
        minWidth={settings.width}
        horizontalAlignItems="start"
        padding={80}
        spacing={40}
        verticalAlignItems="center"
        name="main-wrapper"
      >
        {settings.title ? <Text fontSize={32} fill={getColorByMode("text-fill", settings.useDarkMode)}>{settings.title}</Text> : <></>}
        {variableNodes}
        {textStyleNodes}
        {paintStyleNodes}
        {/*
        /// TODO: Add support for Grid & Effect styles
        {effectStyleNodes}
        {gridStyleNodes}
        */}
      </AutoLayout>
    );
  } else {
    return (<AutoLayout direction="vertical" padding={{ bottom: 40, horizontal: 40, top: 24 }} cornerRadius={16} stroke={getColorByMode("code-fill", settings.useDarkMode)} width={512} name="empty-wrapper"
      strokeWidth={4} spacing={24} horizontalAlignItems="center" fill={getColorByMode("background-fill", settings.useDarkMode)}>
      <SVG src={Icons.arrowUp(Styles.hintColor)} width={40} height={40} opacity={.85} hoverStyle={{ opacity: 1 }}></SVG>
      <Text fill={getColorByMode("text-fill", settings.useDarkMode)} fontSize={24} width="fill-parent" horizontalAlignText="center">Please go first to settings and select at least a collection or a style type.</Text>
      <Line stroke={Styles.hintColor} strokeWidth={4} length="fill-parent" opacity={.85}></Line>
    </AutoLayout>);
  }
}

widget.register(Widget);

export default Widget;