# AC3-missing-required-field-inline-error

- **Given** the operator is on the stock-record form
- **When** they submit with any one of SKU, location or quantity left blank
- **Then** an error naming that field is shown inline next to it (never a generic 'bad request'), the other entered values remain in the form, and no stock record is created
