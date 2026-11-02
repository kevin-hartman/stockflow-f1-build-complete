import { useState, type FormEvent } from "react";
import type { StockRecordInput } from "../api/stockRecords";
import { useFileStockRecord } from "../hooks/useFileStockRecord";

type FieldName = keyof StockRecordInput;

const FIELDS: Array<{ name: FieldName; label: string; testId: string; type: "text" | "number" }> = [
  { name: "sku", label: "SKU", testId: "stock-record-sku", type: "text" },
  { name: "location", label: "Location", testId: "stock-record-location", type: "text" },
  { name: "quantity", label: "Quantity", testId: "stock-record-quantity", type: "number" },
  { name: "tracking_code", label: "Tracking code (optional)", testId: "stock-record-tracking-code", type: "text" },
];

const EMPTY: StockRecordInput = { sku: "", location: "", quantity: "", tracking_code: "" };

// File one stock record. Values stay in the fields on every refusal.
export function StockRecordForm() {
  const [values, setValues] = useState<StockRecordInput>(EMPTY);
  const { state, submit } = useFileStockRecord();
  const errors = state.status === "invalid" ? state.errors : {};
  const busy = state.status === "submitting";

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void submit(values);
  }

  return (
    <form className="card" data-testid="stock-record-form" noValidate onSubmit={onSubmit}>
      {FIELDS.map((f) => {
        const error = errors[f.name];
        const id = `stock-record-${f.name}`;
        return (
          <div key={f.name} className={`field${error ? " field--error" : ""}`}>
            <label className="field__label" htmlFor={id}>
              {f.label}
            </label>
            <input
              id={id}
              className="field__input"
              data-testid={f.testId}
              type={f.type}
              inputMode={f.type === "number" ? "numeric" : undefined}
              value={values[f.name]}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
            />
            {error && (
              <span id={`${id}-error`} className="field__error" data-testid={`${f.testId}-error`}>
                {error}
              </span>
            )}
          </div>
        );
      })}
      {state.status === "duplicate" && (
        <div className="alert" role="alert" data-testid="stock-record-duplicate-error">
          {state.message}
        </div>
      )}
      {state.status === "failed" && (
        <div className="alert" role="alert" data-testid="stock-record-error">
          {state.message}
        </div>
      )}
      {state.status === "success" && (
        <div className="alert" role="status" aria-live="polite" data-testid="stock-record-success">
          Record filed
        </div>
      )}
      <button
        type="submit"
        className="btn btn--primary"
        data-testid="stock-record-submit"
        disabled={busy}
        aria-busy={busy}
      >
        File record
      </button>
    </form>
  );
}
