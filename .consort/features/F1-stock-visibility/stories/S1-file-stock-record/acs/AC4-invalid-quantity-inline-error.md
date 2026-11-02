# AC4-invalid-quantity-inline-error

- **Given** the operator is on the stock-record form
- **When** they submit a quantity that is not a whole number of zero or more (e.g. -3 or 2.5)
- **Then** an error naming the quantity field is shown inline next to it and no stock record is created
