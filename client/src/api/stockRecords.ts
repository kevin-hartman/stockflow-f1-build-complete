// EP1 client: the only code that calls /api/stock-records.

export interface StockRecord {
  id: number;
  sku: string;
  location: string;
  quantity: number;
  tracking_code: string | null;
}

export interface StockRecordInput {
  sku: string;
  location: string;
  quantity: string;
  tracking_code: string;
}

export type FieldErrors = Partial<Record<keyof StockRecordInput, string>>;

export type FileResult =
  | { kind: "created"; record: StockRecord }
  | { kind: "invalid"; errors: FieldErrors }
  | { kind: "duplicate"; message: string }
  | { kind: "failed"; message: string };

const DUPLICATE_FALLBACK = "A record for that SKU at that location already exists";

function toPayload(input: StockRecordInput) {
  const quantity = input.quantity.trim();
  return {
    sku: input.sku,
    location: input.location,
    quantity: quantity === "" ? null : quantity,
    tracking_code: input.tracking_code.trim() === "" ? null : input.tracking_code,
  };
}

export async function fileStockRecord(input: StockRecordInput): Promise<FileResult> {
  const res = await fetch("/api/stock-records", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(toPayload(input)),
  });
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (res.status === 201) return { kind: "created", record: body as unknown as StockRecord };
  if (res.status === 422) return { kind: "invalid", errors: (body.errors ?? {}) as FieldErrors };
  if (res.status === 409) {
    return { kind: "duplicate", message: typeof body.error === "string" ? body.error : DUPLICATE_FALLBACK };
  }
  return { kind: "failed", message: `Could not file the record (status ${res.status})` };
}
