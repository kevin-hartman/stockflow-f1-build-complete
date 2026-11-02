# AC4-new-record-appears-without-reload

- **Given** the operator is in the app with the home stock table showing no record for (NUT-09, C-03)
- **When** they file a valid record for SKU "NUT-09", location "C-03", quantity 8 through the form and return to the home view
- **Then** the home table includes a NUT-09 / C-03 / 8 row without a full-page reload of the app
