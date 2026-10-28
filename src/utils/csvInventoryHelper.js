/**
 * Utility helper for Inventory CSV Import, Parsing, Validation, and Template Downloads.
 */

/**
 * Downloads a sample CSV template pre-filled with standard columns and examples.
 */
export const downloadSampleInventoryCsv = () => {
  const headers = ['sku', 'product_name', 'variant', 'quantity', 'unit', 'notes'];
  const sampleRows = [
    ['BAN-1KG-01', 'Fresh Bananas', '', '50', 'kg', 'Supplier weekly restock'],
    ['APP-1KG-02', 'Red Apples', '', '25', 'kg', 'Warehouse delivery'],
    ['TOM-1KG-04', 'Tomatoes', '', '30', 'kg', 'Fresh harvest intake'],
    ['RCE-5KG-05', 'Basmati Rice', '5kg', '15', 'bag', 'Grain supplier restock'],
    ['EGG-12P-06', 'Large Eggs', '12 pcs', '40', 'box', 'Poultry farm arrival'],
  ];

  const csvContent = [
    headers.join(','),
    ...sampleRows.map((row) =>
      row.map((val) => (val.includes(',') ? `"${val}"` : val)).join(',')
    ),
  ].join('\r\n');

  triggerCsvDownload(csvContent, 'inventory_import_sample_template.csv');
};

/**
 * Downloads a CSV report containing only the failed rows with specific error reasons.
 */
export const downloadErrorReportCsv = (invalidRows, originalFileName = 'inventory') => {
  if (!invalidRows || invalidRows.length === 0) return;

  const headers = ['row_number', 'sku', 'product_name', 'variant', 'quantity', 'unit', 'error_reason'];
  const rows = invalidRows.map((item) => [
    item.row || '',
    item.sku || '',
    item.product || item.product_name || '',
    item.variant || '',
    item.quantity ?? '',
    item.unit || '',
    item.errorMessage || item.error || 'Validation failed',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const str = String(cell ?? '');
          return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(',')
    ),
  ].join('\r\n');

  const baseName = (originalFileName || 'inventory').replace(/\.[^/.]+$/, '');
  triggerCsvDownload(csvContent, `${baseName}_errors_report.csv`);
};

/**
 * Helper to trigger browser download of a CSV string.
 */
const triggerCsvDownload = (content, filename) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Robust CSV string parser supporting quoted fields and commas inside quotes.
 */
export const parseCsvText = (text) => {
  if (!text || typeof text !== 'string') return { headers: [], rows: [] };

  const lines = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote: "" -> "
        currentField += '"';
        i++;
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n of \r\n
      }
      currentRow.push(currentField.trim());
      if (currentRow.some((f) => f.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Push final field/row if any
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      lines.push(currentRow);
    }
  }

  if (lines.length === 0) return { headers: [], rows: [] };

  const rawHeaders = lines[0];
  const headers = rawHeaders.map((h) => h.toLowerCase().replace(/[\s_-]+/g, ''));

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const rowObj = { _rowNumber: i };
    rawHeaders.forEach((rawH, idx) => {
      const normalizedKey = rawH.toLowerCase().replace(/[\s_-]+/g, '');
      rowObj[normalizedKey] = line[idx] !== undefined ? line[idx] : '';
      rowObj[rawH] = line[idx] !== undefined ? line[idx] : '';
    });
    rows.push(rowObj);
  }

  return { headers, rawHeaders, rows };
};

/**
 * Validates parsed CSV rows against the active store inventory.
 * Covers:
 * 1. Key / Header matching (sku, quantity)
 * 2. SKU matching (exists in store inventory)
 * 3. Variant matching (if specified, exists in product variants)
 * 4. Quantity validation (> 0)
 */
export const validateInventoryRows = (parsedRows, inventoryItems = []) => {
  if (!parsedRows || parsedRows.length === 0) {
    return {
      isValidHeader: true,
      totalRows: 0,
      validRows: [],
      invalidRows: [],
      allRows: [],
      skuNotFoundCount: 0,
      variantNotFoundCount: 0,
    };
  }

  // Check required headers in first row keys
  const firstRow = parsedRows[0];
  const keys = Object.keys(firstRow).map((k) => k.toLowerCase().replace(/[\s_-]+/g, ''));
  const hasSkuHeader = keys.some((k) =>
    ['sku', 'productsku', 'itemcode', 'productcode', 'id', 'productid'].includes(k)
  );
  const hasQuantityHeader = keys.some((k) =>
    ['quantity', 'qty', 'stock', 'addstock', 'count'].includes(k)
  );

  if (!hasSkuHeader || !hasQuantityHeader) {
    const missing = [];
    if (!hasSkuHeader) missing.push("'sku'");
    if (!hasQuantityHeader) missing.push("'quantity' or 'stock'");
    return {
      isValidHeader: false,
      headerErrorMessage: `Required column(s) ${missing.join(' and ')} missing. Please download our sample CSV template.`,
      totalRows: parsedRows.length,
      validRows: [],
      invalidRows: [],
      allRows: [],
      skuNotFoundCount: 0,
      variantNotFoundCount: 0,
    };
  }

  const allRows = [];
  let skuNotFoundCount = 0;
  let variantNotFoundCount = 0;

  parsedRows.forEach((row, idx) => {
    const rowNum = row._rowNumber || idx + 1;

    // Resolve SKU from various possible column aliases
    const sku = (
      row.sku ||
      row.productsku ||
      row.itemcode ||
      row.productcode ||
      row.product_sku ||
      row.item_code ||
      row.id ||
      ''
    ).trim();

    // Resolve Variant
    const variantName = (
      row.variant ||
      row.variantname ||
      row.variant_name ||
      row.option ||
      row.size ||
      row.color ||
      ''
    ).trim();

    // Resolve Quantity
    const rawQty = (
      row.quantity ||
      row.qty ||
      row.stock ||
      row.addstock ||
      row.count ||
      ''
    ).trim();

    // Resolve Unit & Notes & Product Name
    const unit = (row.unit || row.unitname || row.stockunit || '').trim();
    const notes = (row.notes || row.note || row.comment || '').trim();
    const declaredName = (
      row.productname ||
      row.product_name ||
      row.product ||
      row.name ||
      row.title ||
      ''
    ).trim();

    // 1. Check if SKU is empty
    if (!sku) {
      skuNotFoundCount++;
      allRows.push({
        row: rowNum,
        sku: '—',
        product: declaredName || 'Unknown Product',
        variant: variantName || '—',
        quantity: rawQty || 0,
        unit: unit || '—',
        status: 'Invalid',
        errorType: 'SKU_EMPTY',
        errorMessage: 'SKU column is empty for this row.',
      });
      return;
    }

    // 2. Match SKU in existing store inventory
    const matchedProduct = inventoryItems.find((item) => {
      const itemSku = String(item.sku || item.productCode || item.code || '').trim().toLowerCase();
      const itemId = String(item.id || item._id || '').trim().toLowerCase();
      const targetSku = sku.toLowerCase();
      return itemSku === targetSku || itemId === targetSku;
    });

    if (!matchedProduct) {
      skuNotFoundCount++;
      allRows.push({
        row: rowNum,
        sku,
        product: declaredName || `Product (${sku})`,
        variant: variantName || '—',
        quantity: rawQty || 0,
        unit: unit || '—',
        status: 'Invalid',
        errorType: 'SKU_NOT_FOUND',
        errorMessage: `SKU "${sku}" not found in your inventory catalogue.`,
      });
      return;
    }

    const resolvedProductName =
      matchedProduct.name || matchedProduct.title || declaredName || `Product (${sku})`;

    const resolvedUnit =
      typeof matchedProduct.unit === 'object' && matchedProduct.unit !== null
        ? (matchedProduct.unit.name || matchedProduct.unit.symbol || unit || 'pcs')
        : (matchedProduct.unit || unit || 'pcs');

    // 3. Variant Match check (if product has variants or CSV specified a variant)
    const productVariants = Array.isArray(matchedProduct.variants) ? matchedProduct.variants : [];
    let matchedVariant = null;

    if (variantName) {
      if (productVariants.length > 0) {
        matchedVariant = productVariants.find((v) => {
          const vOption = String(v.option || v.variant || v.name || v.title || '').trim().toLowerCase();
          return vOption === variantName.toLowerCase();
        });

        if (!matchedVariant) {
          variantNotFoundCount++;
          const availableList = productVariants
            .map((v) => v.option || v.variant || v.name)
            .filter(Boolean)
            .join(', ');

          allRows.push({
            row: rowNum,
            sku,
            productId: matchedProduct.id || matchedProduct._id,
            product: resolvedProductName,
            variant: variantName,
            quantity: rawQty || 0,
            unit: resolvedUnit,
            status: 'Invalid',
            errorType: 'VARIANT_NOT_FOUND',
            errorMessage: `Variant "${variantName}" not found for "${resolvedProductName}". Available: [${availableList || 'None'}].`,
          });
          return;
        }
      }
    }

    // 4. Quantity validation
    const parsedQty = Number(rawQty);
    if (!rawQty || isNaN(parsedQty) || parsedQty <= 0) {
      allRows.push({
        row: rowNum,
        sku,
        productId: matchedProduct.id || matchedProduct._id,
        variantId: matchedVariant?.id || matchedVariant?._id,
        product: resolvedProductName,
        variant: variantName || '—',
        quantity: rawQty,
        unit: resolvedUnit,
        status: 'Invalid',
        errorType: 'INVALID_QUANTITY',
        errorMessage: 'Quantity must be a positive number greater than 0.',
      });
      return;
    }

    // All validations passed!
    allRows.push({
      row: rowNum,
      sku,
      productId: matchedProduct.id || matchedProduct._id,
      variantId: matchedVariant?.id || matchedVariant?._id || matchedProduct.variantId,
      product: resolvedProductName,
      variant: variantName || 'Standard',
      quantity: parsedQty,
      unit: resolvedUnit,
      currentStock: Number(matchedProduct.stock ?? 0),
      newCalculatedStock: Number(matchedProduct.stock ?? 0) + parsedQty,
      notes: notes || 'Bulk CSV Import',
      status: 'Valid',
      errorMessage: null,
    });
  });

  const validRows = allRows.filter((r) => r.status === 'Valid');
  const invalidRows = allRows.filter((r) => r.status === 'Invalid');

  return {
    isValidHeader: true,
    totalRows: allRows.length,
    validRows,
    invalidRows,
    allRows,
    skuNotFoundCount,
    variantNotFoundCount,
  };
};
