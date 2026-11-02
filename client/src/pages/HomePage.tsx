import { Link } from "react-router-dom";
import { useHealth } from "../hooks/useHealth";
import { StatusBadge, type BadgeTone } from "../components/StatusBadge";
import { StockTable } from "../components/StockTable";

// Home: stock by location. Every state (loading, success, error) is explicit,
// never a blank region, per the design brief's no-silent-states rule.
export function HomePage() {
  const health = useHealth();

  let tone: BadgeTone = "warn";
  let label = "Checking backend...";
  if (health.status === "ok") {
    tone = "ok";
    label = `Backend ${health.backend}`;
  } else if (health.status === "error") {
    tone = "error";
    label = `Backend unreachable: ${health.message}`;
  }

  return (
    <main className="page">
      <div className="page__header">
        <img className="page__icon" src="/warehouse.png" alt="" />
        <h1 className="page__title" data-testid="home-title">Stock by location</h1>
        <StatusBadge tone={tone} label={label} />
        <Link className="btn btn--secondary btn--sm" to="/stock/new">
          File stock record
        </Link>
      </div>
      <StockTable />
    </main>
  );
}
