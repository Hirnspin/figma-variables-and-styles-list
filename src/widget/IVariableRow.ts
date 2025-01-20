import { ReadableVariableType } from "@lib/figmaHelpers";
import { IVariableRowValue } from "./VariableRowValue";

export default interface IVariableRow {
  name: string;
  description: string;
  readableType: ReadableVariableType;
  id: string;
  isPublished: boolean;
  collectionId: string;
  codeSyntax: {
    [platform in CodeSyntaxPlatform]?: string;
  };
  variableValuesByMode: Array<IVariableRowValue>;
  scopes: VariableScope[];
}
