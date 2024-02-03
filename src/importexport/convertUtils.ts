import { Unit } from "@/types/scenarioModels";

export type OrbatToTextOptions = {
  indent?: string;
};
export function orbatToText(root: Unit, options: OrbatToTextOptions = {}): string[] {
  const indent = options.indent ?? "\t";
  const result: string[] = [];

  function helper(node: Unit, depth: number = 0) {
    result.push(indent.repeat(depth) + node.name + "\n");
    node.subUnits?.forEach((child: any) => helper(child, depth + 1));
  }

  helper(root);
  return result;
}
