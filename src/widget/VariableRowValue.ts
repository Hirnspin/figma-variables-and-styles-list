import { ResolvedVariableValue } from "@lib/Types";
import {
  checkForAliasInVariableValue,
  getReadableType,
  resolveVariableValueAsync,
} from "@lib/figmaHelpers";

export interface IVariableRowValue {
  modeName: string;
  modeId: string;
  variable: Variable;
  resolvedValue?: ResolvedVariableValue;
  isAliasToken: boolean;
  aliasTokenCollectionId?: string;
  aliasTokenName?: string;
  aliasTokenCollectionName?: string;
  publishingStatus?: PublishStatus
  readonly readableType: string;
}

export interface IVariableRowValueArgs {
  modeName: string,
  modeId: string,
  variable: Variable,
}

export class VariableRowValue implements IVariableRowValue {
  public modeName: string;
  public modeId: string;
  public variable: Variable;
  public resolvedValue?: ResolvedVariableValue;
  public isAliasToken: boolean;
  public aliasTokenCollectionId?: string;
  public aliasTokenName?: string;
  public aliasTokenCollectionName?: string;
  public publishingStatus?: PublishStatus;

  constructor(args: IVariableRowValueArgs) {
    this.modeName = args.modeName;
    this.modeId = args.modeId;
    this.variable = args.variable;
    this.isAliasToken = checkForAliasInVariableValue(
      this.variable,
      this.modeId,
    );
  }

  get readableType(): string {
    return this.resolvedValue ? getReadableType(this.resolvedValue.resolvedType) : '';
  }

  static async buildAsync(args: IVariableRowValueArgs) {
    const _variableValue = new VariableRowValue(args);

    _variableValue.resolvedValue = await resolveVariableValueAsync(_variableValue.variable, _variableValue.modeId);
    _variableValue.publishingStatus = await _variableValue.variable.getPublishStatusAsync();

    if (_variableValue.isAliasToken) {
      const aliasTokenVariable = await figma.variables.getVariableByIdAsync(
        (_variableValue.variable.valuesByMode[_variableValue.modeId] as VariableAlias).id,
      );

      _variableValue.aliasTokenCollectionId = aliasTokenVariable
        ? aliasTokenVariable.variableCollectionId
        : undefined;

      const aliasTokenCollection = _variableValue.aliasTokenCollectionId
        ? await figma.variables.getVariableCollectionByIdAsync(_variableValue.aliasTokenCollectionId)
        : null;

      _variableValue.aliasTokenCollectionId = aliasTokenVariable
        ? aliasTokenVariable.variableCollectionId
        : undefined;
      _variableValue.aliasTokenCollectionName = aliasTokenCollection
        ? aliasTokenCollection.name
        : undefined;
      _variableValue.aliasTokenName = aliasTokenVariable
        ? aliasTokenVariable.name
        : undefined;
    }

    return _variableValue;
  }
}
