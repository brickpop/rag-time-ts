import type { ParserId } from "../common/enums.ts";
import type { Doc } from "../common/types.ts";

export interface IParser {
  id: ParserId;
  parse: (data: string | Uint8Array, filePath?: string) => Doc | Promise<Doc>;
}
