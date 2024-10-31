import type { Doc } from "../common/types.ts";
import type { SourceFormats } from "../common/enums.ts";

export interface IParser {
  name: string;
  sourceFormat: SourceFormats;
  parse: (data: string | Uint8Array, filePath?: string) => Doc | Promise<Doc>;
}
