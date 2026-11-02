"""EP1/EP3: /api/stock-records — file, list, and fetch one stock record (JSON only)."""

from typing import Any

from fastapi import APIRouter, Body, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.services import stock_records as service

router = APIRouter(prefix="/api/stock-records", tags=["stock-records"])

_FIELDS = ("sku", "location", "quantity", "tracking_code")


@router.post("")
def file_stock_record(
    payload: Any = Body(default=None), db: Session = Depends(service.get_session)
) -> JSONResponse:
    body = payload if isinstance(payload, dict) else {}
    try:
        record = service.create_stock_record(db, **{f: body.get(f) for f in _FIELDS})
    except service.StockRecordValidationError as exc:
        return JSONResponse(status_code=422, content={"errors": exc.errors})
    except service.DuplicateStockRecordError:
        return JSONResponse(status_code=409, content={"error": service.DUPLICATE_MESSAGE})
    return JSONResponse(status_code=201, content=record.to_dict())


@router.get("")
def list_stock_records(db: Session = Depends(service.get_session)) -> list[dict]:
    return [r.to_dict() for r in service.list_stock_records(db)]


@router.get("/{sku}")
def get_stock_record(
    sku: str, location: str = Query(...), db: Session = Depends(service.get_session)
) -> JSONResponse:
    try:
        record = service.get_stock_record(db, sku=sku, location=location)
    except service.StockRecordNotFoundError:
        return JSONResponse(status_code=404, content={"error": service.NOT_FOUND_MESSAGE})
    return JSONResponse(status_code=200, content=record.to_detail_dict())
