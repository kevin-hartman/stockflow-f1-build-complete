import { Fragment } from "react";
import { Link } from "react-router-dom";
import type { StockRecord } from "../api/stockRecords";
import { useStockRecords } from "../hooks/useStockRecords";

const COLUMNS = 4;

function groupByLocation(records: StockRecord[]): [string, StockRecord[]][] {
  const groups: [string, StockRecord[]][] = [];
  for (const r of records) {
    const last = groups[groups.length - 1];
    if (last && last[0] === r.location) last[1].push(r);
    else groups.push([r.location, [r]]);
  }
  return groups;
}

function NotTracked() {
  return (
    <span className="pill pill--not-tracked" data-testid="not-tracked">
      not tracked
    </span>
  );
}

function EmptyState() {
  return (
    <section className="empty-state" data-testid="empty-state">
      <img className="empty-state__icon" src="/warehouse.png" alt="" />
      <h2 className="empty-state__title">No stock filed yet</h2>
      <p className="empty-state__copy">File a stock record to see it listed here by location.</p>
      <Link className="btn btn--primary" to="/stock/new" data-testid="empty-state-cta">
        File stock record
      </Link>
    </section>
  );
}

function StockRow({ record }: { record: StockRecord }) {
  return (
    <tr data-testid="stock-row">
      <td data-testid="stock-cell-sku">{record.sku}</td>
      <td data-testid="stock-cell-location">{record.location}</td>
      <td className="num" data-testid="stock-cell-quantity">{record.quantity}</td>
      <td data-testid="stock-cell-tracking-code">{record.tracking_code ?? <NotTracked />}</td>
    </tr>
  );
}

export function StockTable() {
  const state = useStockRecords();

  if (state.status === "loading") {
    return (
      <p className="empty-state__copy" role="status" aria-live="polite" data-testid="stock-loading">
        Loading stock...
      </p>
    );
  }
  if (state.status === "failed") {
    return (
      <div className="alert" role="alert" data-testid="stock-error">
        {state.message}
      </div>
    );
  }
  if (state.records.length === 0) return <EmptyState />;

  return (
    <table className="stock-table" data-testid="stock-table">
      <thead>
        <tr>
          <th scope="col">SKU</th>
          <th scope="col">Location</th>
          <th scope="col" className="num">Quantity</th>
          <th scope="col">Tracking code</th>
        </tr>
      </thead>
      <tbody>
        {groupByLocation(state.records).map(([location, records]) => (
          <Fragment key={location}>
            <tr data-testid="location-group">
              <th scope="colgroup" colSpan={COLUMNS} data-testid="location-group-header">
                {location}
              </th>
            </tr>
            {records.map((r) => (
              <StockRow key={r.id} record={r} />
            ))}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}
