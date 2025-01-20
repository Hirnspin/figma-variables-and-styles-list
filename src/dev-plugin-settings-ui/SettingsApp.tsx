import "./SettingsApp.css";
import * as React from "react";
import IPluginSettings from "@lib/IPluginSettings";

function SettingsApp() {
  const [state, setState] = React.useState<IPluginSettings>({
    customVariablePrefix: ''
  });

  function savePreference() {
    parent.postMessage(
      {
        pluginMessage: {
          type: "SAVE",
          settings: {
            customVariablePrefix: state.customVariablePrefix
          } as IPluginSettings
        }
      },
      "*",
    );
  }

  function close() {
    parent.postMessage({ pluginMessage: { type: "CLOSE" } }, "*");
  }

  onkeydown = (event) => {
    if (event.key === "Escape") {
      close();
    }
    if (event.key === "Enter") {
      savePreference();
      close();
    }
  };

  React.useEffect(() => {
    onmessage = (event) => {
      const {
        data: { pluginMessage: { settings } },
      } = event;
      setState({
        ...settings
      });
    };
  }, []);

  return (
    <div className="main-container">
      <label htmlFor="customVariablePrefix">Custom variable prefix</label>
      <input
        type="text"
        autoFocus
        placeholder="prefix-"
        id="customVariablePrefix"
        aria-describedby="customVariablePrefixHelpBlock"
        value={state.customVariablePrefix}
        onChange={(event) => {
          setState({ ...state, customVariablePrefix: event.target.value });
        }}
        onBlur={() => savePreference()}
      />
      <div id="customVariablePrefixHelpBlock">
        <small>Add a custom prefix to your variables.</small>
        <small>Please note:</small>
        <ul>
          <li>
            <small>No dash will be added automatically!</small>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default SettingsApp;
