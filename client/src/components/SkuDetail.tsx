import type { ReactNode } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useStockRecord } from "../hooks/useStockRecord";
import { NotTracked } from "./NotTracked";

function orNotTracked(value: string | number | null): ReactNode {
  return value ?? <NotTracked testId="detail-not-tracked" />;
}

function DetailRow({ label, testId, numeric, children }: { label: string; testId: string; numeric?: boolean; children: ReactNode }) {
  return (
    <tr>
      <th scope="row">{label}</th>
      <td className={numeric ? "num" : undefined} data-testid={testId}>
        {children}
      </td>
    </tr>
  );
}

// SKU detail: the single record keyed by (sku, location) — nothing from sibling records.
export function SkuDetail() {
  const { sku = "" } = useParams();
  const [params] = useSearchParams();
  const location = params.get("location") ?? "";
  const state = useStockRecord(sku, location);

  let body: ReactNode;
  if (state.status === "loading") {
    body = (
      <p className="empty-state__copy" role="status" aria-live="polite" data-testid="detail-loading">
        Loading record...
      </p>
    );
  } else if (state.status === "failed") {
    body = <div className="alert" role="alert" data-testid="detail-error">{state.message}</div>;
  } else if (state.status === "missing") {
    body = (
      <section className="empty-state" role="status" data-testid="detail-not-found">
        <h2 className="empty-state__title">Stock record not found</h2>
        <Link className="btn btn--secondary btn--sm" to="/">Back to stock</Link>
      </section>
    );
  } else {
    const r = state.record;
    body = (
      <table className="stock-table">
        <tbody>
          <DetailRow label="SKU" testId="detail-sku">{r.sku}</DetailRow>
          <DetailRow label="Location" testId="detail-location">{r.location}</DetailRow>
          <DetailRow label="Quantity" testId="detail-quantity" numeric>{r.quantity}</DetailRow>
          <DetailRow label="Tracking code" testId="detail-tracking-code">{orNotTracked(r.tracking_code)}</DetailRow>
          <DetailRow label="Par level" testId="detail-par-level" numeric>{orNotTracked(r.par_level)}</DetailRow>
        </tbody>
      </table>
    );
  }

  return (
    <main className="page page--narrow" data-testid="sku-detail">
      <div className="page__header">
        <img className="page__icon" src="/warehouse.png" alt="" />
        <h1 className="page__title">Stock record</h1>
        <Link className="btn btn--ghost btn--sm" to="/">Back to stock</Link>
      </div>
      <div className="card">{body}</div>
    </main>
  );
}
