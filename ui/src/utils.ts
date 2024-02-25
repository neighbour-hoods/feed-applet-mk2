import { CellId, CellInfo, encodeHashToBase64 } from "@holochain/client";
import { decode } from "@msgpack/msgpack";

function getCellId(cellInfo: CellInfo): CellId | undefined {
  if ("provisioned" in cellInfo) {
    return cellInfo.provisioned.cell_id;
  }
  if ("cloned" in cellInfo) {
    return cellInfo.cloned.cell_id;
  }
  return undefined;
}

export function parseZomeError(err: Error) {
  if(!err!.message) return "Not a valid error type";

  const decodedErrors = err.message.match(/Deserialize\(\[(.*?)\]\)/);
  const error = decodedErrors![1];
  return JSON.stringify(error ? decode(JSON.parse("[" + error + "]")) : "{}", null, 2)
}
  
export { getCellId }
