import React from "react";
import { DEFAULT_PAINT_POT_COLUMNS, DEFAULT_WIDTH, IWidgetSettings } from "../widget/WidgetSettings";
import { ColorType, getEnumKeys } from "@lib/Color";

interface IAppState extends IWidgetSettings { }

function App() {
  const [state, setState] = React.useState<IAppState | undefined>(undefined);

  const onSave = () => {
    const message = { pluginMessage: { type: 'save', settings: state } };
    parent.postMessage(message, '*');
  };

  const onCancel = () => {
    const message = { pluginMessage: { type: 'close' } };
    parent.postMessage(message, '*');
  };

  React.useEffect(() => {
    window.onmessage = (event) => {
      setState(event.data.pluginMessage);
    };
  }, []);

  onkeydown = (event) => {
    switch (event.key) {
      case "Escape":
        onCancel();
        break;
      case "Enter":
        onSave();
        break;
      default:
        break;
    }
  };

  const getSelectedVariableCollectionOptions = () => {
    const nodes = [];

    if (state) {
      for (let [key, value] of state.collections) {
        nodes.push(<option value={key}>{value}</option>);
      }
    }

    return nodes;
  };
  const updateState = (value: any) => {
    setState((currentState) => { return { ...currentState as IAppState, ...value } });
  }

  return <main>
    {typeof state === "undefined" ? <div className="main">loading</div> :
      <div className="main">
        <label className="label" htmlFor="selectedVariableCollection">Choose variable collection:</label>
        <div className="input">
          <select id="selectedVariableCollection" className="input__field" value={state.selectedVariableCollection} onChange={(e) => updateState({ selectedVariableCollection: e.target.value })}>
            <option value={"NONE"}>None</option>
            <option value={"ALL"}>All</option>
            {getSelectedVariableCollectionOptions()}
          </select>
        </div>
        <label className="label" htmlFor="selectedStyleType">Choose style types:</label>
        <label className="input">
          <select id="selectedStyleType" className="input__field" value={state.selectedStyleType} onChange={(e) => updateState({ selectedStyleType: e.target.value })}>
            <option value={"NONE"}>None</option>
            <option value={"ALL"}>All</option>
            <option value={"PAINT"}>Paint styles</option>
            <option value={"TEXT"}>Text styles</option>
            <option value={"EFFECT"}>Effect styles</option>
            <option value={"GRID"}>Grid styles</option>
          </select>
        </label>
        <label className="label" htmlFor="title">Title:</label>
        <div className="input">
          <input id="title" className="input__field" placeholder="Title" type="text" onChange={(e) => updateState({ title: e.target.value })} value={state.title} />
        </div>
        <label className="label" htmlFor="filter">Filter your names:</label>
        <div className="input">
          <input id="filter" className="input__field" placeholder="Regex or simple term..." onChange={(e) => updateState({ queryFilter: e.target.value })} value={state.queryFilter} />
        </div>
        <label className="label" htmlFor="width">Minimum widget minimum width:</label>
        <div className="input">
          <input id="width" className="input__field" placeholder={DEFAULT_WIDTH.toString()} type="number" onChange={(e) => updateState({ width: Number.parseInt(e.target.value) })} value={state.width} />
        </div>
        <label className="label" htmlFor="paintPotColumns">Paintpot columns:</label>
        <div className="input">
          <input id="paintPotColumns" className="input__field" placeholder={DEFAULT_PAINT_POT_COLUMNS.toString()} type="number" onChange={(e) => updateState({ paintPotColumns: Number.parseInt(e.target.value) })} value={state.paintPotColumns} step={1} min={1} max={12} />
        </div>
        <div className="checkbox">
          <input id="useRemUnit"
            defaultChecked={state.useRemUnit}
            onChange={(event) => updateState({ useRemUnit: event.target.checked })} type="checkbox" className="checkbox__box" />
          <label htmlFor="useRemUnit" className="checkbox__label">
            Show <code>rem</code> units for numbers
          </label>
        </div>
        <label className="label" htmlFor="baseUnit">Unit settings:</label>
        <div className="input">
          <input disabled={!state.useRemUnit} id="baseUnit" className="input__field" placeholder="16" type="number" onChange={(e) => updateState({ baseUnit: Number.parseInt(e.target.value) })} value={state.baseUnit} />
        </div>
        <small className="type">
          Scale factor for scaling pixels into rem units
        </small>
        <div className="checkbox">
          <input id="showCollectionTitle"
            defaultChecked={state.showCollectionTitle}
            onChange={(event) => updateState({ showCollectionTitle: event.target.checked })} type="checkbox" className="checkbox__box" />
          <label htmlFor="showCollectionTitle" className="checkbox__label">
            Show collection title
          </label>
        </div>
        <div className="checkbox">
          <input id="onlyPublished"
            defaultChecked={state.onlyPublished}
            onChange={(event) => updateState({ onlyPublished: event.target.checked })} type="checkbox" className="checkbox__box" />
          <label htmlFor="onlyPublished" className="checkbox__label">
            Show only published variables & styles
          </label>
        </div>
        <div className="checkbox">
          <input id="showDescriptionColumn"
            defaultChecked={state.showDescriptionColumn}
            onChange={(event) => updateState({ showDescriptionColumn: event.target.checked })} type="checkbox" className="checkbox__box" />
          <label htmlFor="showDescriptionColumn" className="checkbox__label">
            Show description
          </label>
        </div>
        <div className="checkbox">
          <input id="showTypeColumn"
            defaultChecked={state.showTypeColumn}
            onChange={(event) => updateState({ showTypeColumn: event.target.checked })} type="checkbox" className="checkbox__box" />
          <label htmlFor="showTypeColumn" className="checkbox__label">
            Show the type of the variable
          </label>
        </div>
        <div className="checkbox">
          <input id="showNestedAliasTokens"
            defaultChecked={state.showNestedAliasTokens}
            onChange={(event) => updateState({ showNestedAliasTokens: event.target.checked })} type="checkbox" className="checkbox__box" />
          <label htmlFor="showNestedAliasTokens" className="checkbox__label">
            Show nested alias tokens (only for variables).
          </label>
        </div>
        <div className="checkbox">
          <input id="showCodeSyntax"
            defaultChecked={state.showCodeSyntax}
            onChange={(event) => updateState({ showCodeSyntax: event.target.checked })} type="checkbox" className="checkbox__box" />
          <label htmlFor="showCodeSyntax" className="checkbox__label">
            Show code syntax column (only for variables).
          </label>
        </div>
        <div className="checkbox ms-2">
          <input id="showWebCodeSyntax"
            defaultChecked={state.showWebCodeSyntax}
            disabled={!state.showCodeSyntax}
            onChange={(event) => updateState({ showWebCodeSyntax: event.target.checked })} type="checkbox" className="checkbox__box" />
          <label htmlFor="showWebCodeSyntax" className="checkbox__label">
            Show web code syntax.
          </label>
        </div>
        <div className="checkbox ms-2">
          <input id="showAndroidCodeSyntax"
            defaultChecked={state.showAndroidCodeSyntax}
            disabled={!state.showCodeSyntax}
            onChange={(event) => updateState({ showAndroidCodeSyntax: event.target.checked })} type="checkbox" className="checkbox__box" />
          <label htmlFor="showAndroidCodeSyntax" className="checkbox__label">
            Show android code syntax.
          </label>
        </div>
        <div className="checkbox ms-2">
          <input id="showIosCodeSyntax"
            defaultChecked={state.showIosCodeSyntax}
            disabled={!state.showCodeSyntax}
            onChange={(event) => updateState({ showIosCodeSyntax: event.target.checked })} type="checkbox" className="checkbox__box" />
          <label htmlFor="showIosCodeSyntax" className="checkbox__label">
            Show iOS code syntax.
          </label>
        </div>
        <div className="checkbox">
          <input id="showOnlyFirstMode"
            defaultChecked={state.showOnlyFirstMode}
            onChange={(event) => updateState({ showOnlyFirstMode: event.target.checked })} type="checkbox" className="checkbox__box" />
          <label htmlFor="showOnlyFirstMode" className="checkbox__label">
            Show only first variable mode.
          </label>
        </div>
        <div className="checkbox">
          <input id="displayColorValuesAsPaintPots"
            defaultChecked={state.displayColorValuesAsPaintPots}
            onChange={(event) => updateState({ displayColorValuesAsPaintPots: event.target.checked })} type="checkbox" className="checkbox__box" />
          <label htmlFor="displayColorValuesAsPaintPots" className="checkbox__label">
            Display color variable values as paint pots 🎨.
          </label>
        </div>
        <label className="label" htmlFor="colorType">Color type:</label>
        <label className="input">
          <select id="colorType" defaultValue={state.colorType} value={state.colorType} className="input__field" onChange={(e) => { updateState({ colorType: e.target.value as keyof typeof ColorType }) }}>
            {getEnumKeys(ColorType).map((_colorType, _colorTypeIndex) => <option key={_colorTypeIndex} value={_colorType}>{ColorType[_colorType]}</option>)}
          </select>
        </label>
        <div className="checkbox">
          <input id="useDarkMode"
            defaultChecked={state.useDarkMode}
            onChange={(event) => updateState({ useDarkMode: event.target.checked })} type="checkbox" className="checkbox__box" />
          <label htmlFor="useDarkMode" className="checkbox__label">
            Use dark mode
          </label>
        </div>
      </div>}
    <div className="bottom-bar">
      <button id="cancel" className="button button--tertiary" onClick={onCancel}>Cancel</button>
      <button id="save" className="button button--primary" onClick={onSave}>Save</button>
    </div>
  </main>
}

export default App;
