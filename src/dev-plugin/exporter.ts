import ExportFile from "@lib/ExportFile";
import IPluginSettings from "@lib/IPluginSettings";
import {
  colorToHexString,
  colorToHslaString,
  colorToRgbaString,
} from "@lib/colorHelpers";
import "@lib/stringExtensions";
import {
  resolveVariableValueAsync,
  getVariableById,
  checkForAliasInValue,
} from "@lib/figmaHelpers";
import {
  CodegenCustomSettings,
  TabSizeValue,
} from "@lib/PluginManifestProperties";

const { variables } = figma;

export function generateJSON(
  selectedCollectionId: string = "0",
  codePreferences: CodegenPreferences,
  settings: IPluginSettings,
  customSettings: CodegenCustomSettings,
): ExportFile[] {
  let collections = variables.getLocalVariableCollections();

  if (selectedCollectionId !== "0") {
    collections = collections.filter((c) => c.id === selectedCollectionId);
  }

  const files: ExportFile[] = [];

  collections.forEach((collection) =>
    files.push(
      ...processCollection(
        collection,
        codePreferences,
        settings,
        customSettings,
      ),
    ),
  );

  if (JSON.parse(customSettings.separateCollections)) {
    return files.filter((x) => Object.keys(x.body).length > 0);
  } else {
    let _body = {};

    files.forEach((x) => (_body = Object.assign(_body, x.body)));

    return [
      {
        fileName: `tokens.json`,
        body: _body,
      },
    ];
  }
}

function getCollectionAbbrevation(collectionName: string, suffix: string | "") {
  const lowerName = collectionName.toLocaleLowerCase();
  if (lowerName.includes("primitive")) {
    return `prim${suffix}`;
  } else if (lowerName.includes("semantic")) {
    return `sem${suffix}`;
  } else if (lowerName.includes("component")) {
    return `comp${suffix}`;
  } else if (lowerName.includes("system")) {
    return `sys${suffix}`;
  } else if (lowerName.includes("reference")) {
    return `ref${suffix}`;
  } else if (lowerName.includes("component")) {
    return `comp${suffix}`;
  } else {
    return `${collectionName.toKebabCase()}${suffix}`;
  }
}

function getCssVarName(
  variableName: string,
  prefix: string,
  codeSyntax: string | undefined,
) {
  if (codeSyntax) {
    const regex = RegExp(/(?!var\()([a-z-0-9\_\-\%\\]+)(?=,|\))/);
    const regexResult = regex.exec(codeSyntax);
    let _cssVarName = "";

    if (regexResult && regexResult.length > 0) {
      if (regexResult[0].includes(",")) {
        _cssVarName = regexResult[0].split(",")[0];
      } else {
        _cssVarName = regexResult[0];
      }
    } else {
      _cssVarName = codeSyntax;
    }

    if (_cssVarName.startsWith("--")) {
      return _cssVarName;
    } else {
      return `--${_cssVarName}`;
    }
  } else {
    return `--${prefix}${variableName.replace(/\//g, "-").toKebabCase()}`;
  }
}

export function generateCSS(
  selectedCollectionId: string = "0",
  codePreferences: CodegenPreferences,
  settings: IPluginSettings,
  customSettings: CodegenCustomSettings,
): ExportFile[] {
  const { unit, scaleFactor } = codePreferences;
  const space = parseInt(customSettings.tabSize as TabSizeValue as string);
  let collections = figma.variables.getLocalVariableCollections();

  if (selectedCollectionId !== "0") {
    collections = collections.filter((c) => c.id === selectedCollectionId);
  }

  let styleSheetFiles = [];

  styleSheetFiles = collections
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((collection) => {
      let cssVars = "";

      if (collection.variableIds.length > 0) {
        cssVars += `/* ${collection.name
          .replace(/_(\d+)/g, "")
          .trimStart()} */`;
        collection.modes.forEach((mode, modeIndex) => {
          let innerIndentation = " ".repeat(space);

          if (collection.modes.length > 1) {
            cssVars += `\n@media (prefers-color-scheme: ${mode.name.toKebabCase()}) {`;
            cssVars += `\n  :root {`;
            innerIndentation = " ".repeat(space * 2);
          } else {
            cssVars += `\n:root {`;
          }

          collection.variableIds
            .map((variableId) => figma.variables.getVariableById(variableId)!)
            .sort((a, b) => a.name.localeCompare(b.name))
            .filter((v) =>
              !JSON.parse(customSettings.generateTextValues)
                ? v.resolvedType === "STRING"
                  ? false
                  : true
                : true,
            )
            .forEach(async (variable) => {
              const { name, resolvedType, valuesByMode, description } =
                variable;
              const resolvedVariableValue = await resolveVariableValueAsync(
                variable,
                mode.modeId,
              );
              let cssVarName: string | undefined = "";
              let cssVarValue: string | undefined = "";
              const value = valuesByMode[mode.modeId];
              let prefix = "";

              if (JSON.parse(customSettings.collectionNamePrefix)) {
                if (JSON.parse(customSettings.useCollectionNameAbbreviations)) {
                  prefix = getCollectionAbbrevation(collection.name, "-");
                } else {
                  prefix = `${collection.name.toKebabCase()}-`;
                }
              }

              prefix = `${settings.customVariablePrefix}${prefix}`;
              cssVarName = getCssVarName(
                name,
                prefix,
                JSON.parse(customSettings.useCodeSyntaxName)
                  ? variable.codeSyntax.WEB
                  : undefined,
              );

              if (checkForAliasInValue(value)) {
                const aliasVariable = getVariableById(
                  (variable.valuesByMode[mode.modeId] as VariableAlias).id,
                );
                const resolvedVariableName = getCssVarName(
                  aliasVariable.name,
                  prefix,
                  JSON.parse(customSettings.useCodeSyntaxName)
                    ? aliasVariable.codeSyntax.WEB
                    : undefined,
                );
                const resolvedVariableCssVarLeftPart = `var(${resolvedVariableName}, `;

                if (resolvedVariableValue) {
                  if (
                    resolvedVariableValue.resolvedType === "STRING" &&
                    JSON.parse(customSettings.generateTextValues)
                  ) {
                    cssVarValue = `${resolvedVariableCssVarLeftPart}"${resolvedVariableValue.value}")`;
                  } else if (resolvedVariableValue.resolvedType === "COLOR") {
                    cssVarValue = `${resolvedVariableCssVarLeftPart}${customSettings.colorValueType === "rgb"
                      ? colorToRgbaString(resolvedVariableValue.value as RGBA)
                      : customSettings.colorValueType === "hex"
                        ? colorToHexString(resolvedVariableValue.value as RGBA)
                        : colorToHslaString(resolvedVariableValue.value as RGBA)
                      })`;
                  } else if (resolvedVariableValue.resolvedType === "FLOAT") {
                    cssVarValue = `${resolvedVariableCssVarLeftPart}${unit.toLowerCase() === "pixel"
                      ? `${resolvedVariableValue.value}px`
                      : `${((resolvedVariableValue.value as number) /
                        scaleFactor!) as number
                      }rem`
                      })`;
                  } else if (resolvedVariableValue.resolvedType === "BOOLEAN") {
                    cssVarValue = `${resolvedVariableCssVarLeftPart}"${(resolvedVariableValue.value as boolean) ? 1 : 0
                      }")`;
                  } else {
                    cssVarValue = `${resolvedVariableCssVarLeftPart}"${resolvedVariableValue.value}")`;
                  }
                }
              } else if (
                resolvedType === "STRING" &&
                JSON.parse(customSettings.generateTextValues)
              ) {
                cssVarValue = `"${value}"`;
              } else if (resolvedType === "COLOR") {
                cssVarValue =
                  customSettings.colorValueType === "rgb"
                    ? colorToRgbaString(value as RGBA)
                    : customSettings.colorValueType === "hex"
                      ? colorToHexString(value as RGBA)
                      : colorToHslaString(value as RGBA);
              } else if (resolvedType === "FLOAT") {
                cssVarValue =
                  unit.toLowerCase() === "pixel"
                    ? `${value}px`
                    : `${((value as number) / scaleFactor!) as number}rem`;
              } else if (resolvedType === "BOOLEAN") {
                cssVarValue = `${(value as boolean) ? 1 : 0}`;
              } else {
                cssVarValue = `"${value}"`;
              }

              if (description && JSON.parse(customSettings.showCssComments)) {
                cssVars += `\n${innerIndentation}/** ${description.replace(
                  /\r?\n|\r/g,
                  " ",
                )} */`;
              }

              cssVars += `\n${innerIndentation}${cssVarName}: ${cssVarValue};`;
            });

          if (collection.modes.length > 1) {
            cssVars += `\n  }`;
          }

          cssVars += `\n}`;
        });
      }
      return {
        fileName: `${collection.name
          .toLocaleLowerCase()
          .replace(" ", "-")}.css`,
        body: cssVars,
      };
    });

  if (JSON.parse(customSettings.separateCollections)) {
    return styleSheetFiles;
  } else {
    return [
      {
        fileName: `tokens.css`,
        body: `${styleSheetFiles.map((x) => x.body).join("\n\n")}`,
      },
    ];
  }
}

function processCollection(
  { name: collectionName, modes, variableIds }: VariableCollection,
  codePreferences: CodegenPreferences,
  settings: IPluginSettings,
  customSettings: CodegenCustomSettings,
) {
  const files: ExportFile[] = [];

  modes.forEach((mode) => {
    const file: ExportFile = {
      fileName: `${collectionName.toKebabCase()}.tokens.json`,
      body: {},
    };

    variableIds.forEach((variableId) => {
      const {
        name: variableName,
        resolvedType,
        valuesByMode,
        description,
      } = figma.variables.getVariableById(variableId)!;
      const value = valuesByMode[mode.modeId];

      if (
        value !== undefined &&
        (["COLOR", "FLOAT"].includes(resolvedType) ||
          (["STRING"].includes(resolvedType) &&
            JSON.parse(customSettings.generateTextValues)))
      ) {
        let obj = file.body;

        if (!JSON.parse(customSettings.separateCollections)) {
          let _collectionName: any = collectionName.toKebabCase();

          if (JSON.parse(customSettings.useCollectionNameAbbreviations)) {
            _collectionName = getCollectionAbbrevation(collectionName, "");
          }

          obj[_collectionName] = obj[_collectionName] || {};
          obj = obj[_collectionName];
        }

        if (modes.length > 1) {
          const modeName: any = mode.name.toKebabCase();

          obj[modeName] = obj[modeName] || {};
          obj = obj[modeName];
        }

        variableName.split("/").forEach((groupName: string) => {
          const propName: any = groupName.toKebabCase()!;

          obj[propName] = obj[propName] || {};
          obj = obj[propName];
        });

        switch (resolvedType) {
          case "COLOR":
            obj.$type = "color";
            break;
          case "FLOAT":
            if (JSON.parse(customSettings.handleNumbersAsDimensions)) {
              obj.$type = "dimension";
            } else {
              obj.$type = "number";
            }
            break;
          case "STRING":
          default:
            obj.$type = "text";
            break;
        }

        if (description) {
          obj.$description = description.replace(/\r?\n|\r/g, " ");
        }

        if ((value as VariableAlias).type === "VARIABLE_ALIAS") {
          let _collectionName = "";

          if (!JSON.parse(customSettings.separateCollections)) {
            const _resolvedVariable = figma.variables.getVariableById(
              (value as VariableAlias).id,
            );

            if (_resolvedVariable) {
              const _collection = variables.getVariableCollectionById(
                _resolvedVariable.variableCollectionId,
              );

              if (_collection) {
                if (JSON.parse(customSettings.useCollectionNameAbbreviations)) {
                  _collectionName = getCollectionAbbrevation(
                    _collection.name,
                    ".",
                  );
                } else {
                  _collectionName = `${_collection.name.toKebabCase()}.`;
                }
              }
            }
          }

          obj.$value = `{${_collectionName}${figma.variables
            .getVariableById((value as VariableAlias).id)!
            .name.replace(/\//g, ".")
            .toLowerCase()
            .replace(" ", "-")
            .replace(/[^A-Za-z0-9\.\-\_\+]+/, "")}}`;
        } else {
          switch (resolvedType) {
            case "COLOR":
              obj.$value = colorToHexString(value as RGBA);
              break;
            case "FLOAT":
              const _scaleFactor = codePreferences.scaleFactor
                ? codePreferences.scaleFactor
                : 16;

              if (JSON.parse(customSettings.handleNumbersAsDimensions)) {
                if (codePreferences.unit.toLowerCase() === "pixel") {
                  obj.$value = `${value}px`;
                } else {
                  obj.$value = `${(value as number) / _scaleFactor}rem`;
                }
              } else {
                obj.$value = value;
              }
              break;
            case "BOOLEAN":
            case "STRING":
            default:
              obj.$value = value;
              break;
          }
        }
      }
    });

    files.push(file);
  });
  return files;
}
