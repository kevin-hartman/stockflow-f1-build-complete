import { StockRecordForm } from "../components/StockRecordForm";

export function FileStockRecordPage() {
  return (
    <main className="page page--narrow">
      <div className="page__header">
        <img className="page__icon" src="/warehouse.png" alt="" />
        <h1 className="page__title">File stock record</h1>
      </div>
      <StockRecordForm />
    </main>
  );
}
