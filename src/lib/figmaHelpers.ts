const { variables } = figma;

import { ResolvedVariableValue } from "@lib/Types";

export function checkForAliasInVariableValue(
  variable: Variable,
  modeId: string,
): boolean {
  return checkForAliasInValue(variable.valuesByMode[modeId]);
}

export function checkForAliasInValue(value: VariableValue): boolean {
  let check = true;
  try {
    check = (value as VariableAlias).type && (value as VariableAlias).type === "VARIABLE_ALIAS";
  } catch (error) {
  } finally {
    return check;
  }
}

async function resolveVariable(variable: Variable, modeId: string): Promise<Variable | null> {
  let _variable = null;

  try {
    _variable = await figma.variables.getVariableByIdAsync(
      (variable.valuesByMode[modeId] as VariableAlias).id,
    );
  } catch (error) {
  }

  if (_variable === null) {
    const defaultMode = Object.keys(variable.valuesByMode)[0];

    _variable = await figma.variables.getVariableByIdAsync(
      (variable.valuesByMode[defaultMode] as VariableAlias).id,
    );
  }

  if (_variable !== null) {
    if (checkForAliasInVariableValue(_variable, modeId)) {
      return resolveVariable(_variable, modeId);
    } else {
      //console.log('resolved variable: ', _variable.name, _variable.valuesByMode[modeId]);
    }
  } else {
    //console.log('Variable not found!');
  }

  return variable;
}

export async function resolveVariableValueAsync(
  variable: Variable,
  modeId: string,
): Promise<ResolvedVariableValue | undefined> {
  //let resolvedVariable: ResolvedVariableValue | undefined;

  //if (figma.editorType === "dev") {
  //const isAlias = checkForAliasInVariableValue(variable, modeId);

  //if (isAlias) {
  const resolvedVariable = await resolveVariable(variable, modeId);

  if (resolvedVariable !== null) {

    if (resolvedVariable.variableCollectionId !== variable.variableCollectionId) {
      modeId = Object.keys(resolvedVariable.valuesByMode)[0];
    }

    let resolvedValue = resolvedVariable.valuesByMode[modeId];

    //if (!resolvedValue) {
    /*const defaultModeId = (await variables.getVariableCollectionByIdAsync(
      resolvedVariable.variableCollectionId,
    ))!.defaultModeId;
*/
    //if (defaultModeId) {

    //resolvedValue = resolvedVariable.valuesByMode[Object.keys(variable.valuesByMode)[0]];
    //}
    //}
    //console.log("resolvedValue", resolvedValue, resolvedVariable);
    return {
      value: resolvedValue,
      resolvedType: resolvedVariable.resolvedType,
    };
  } else {
    return {
      value: variable.valuesByMode[modeId],
      resolvedType: variable.resolvedType,
    };
  }
  //} else {
  /* const collection = await variables.getVariableCollectionByIdAsync(
     variable.variableCollectionId,
   );
   if (collection) {
     const frame = figma.createFrame();
     frame.locked = true;
     frame.visible = false;
     frame.setExplicitVariableModeForCollection(
       collection,
       modeId,
     );
     resolvedVariable = variable.resolveForConsumer(frame);
     frame.remove();
   }
}*/

  //return resolvedVariable;
}

const boolean = "Boolean";
const color = "Color";
const number = "Number";
const text = "Text";

export enum ReadableVariableTypes {
  BOOLEAN = boolean,
  COLOR = color,
  NUMBER = number,
  TEXT = text
}

export type ReadableVariableType = typeof boolean | typeof color | typeof number | typeof text;

export function getReadableType(resolvedType: VariableResolvedDataType): ReadableVariableType {
  switch (resolvedType) {
    case "BOOLEAN":
      return ReadableVariableTypes.BOOLEAN;
    case "COLOR":
      return ReadableVariableTypes.COLOR;
    case "FLOAT":
      return ReadableVariableTypes.NUMBER;
    case "STRING":
    default:
      return ReadableVariableTypes.TEXT;
  }
}

export function columnSplice<T>(arr: T[], columnCount: number, placeholder: T): T[][] {
  const columns: T[][] = [];
  for (let i = 0; i < arr.length; i += columnCount) {
    const column = arr.slice(i, i + columnCount);
    while (column.length < columnCount) {
      column.push(placeholder);
    }
    columns.push(column);
  }
  return columns;
}
