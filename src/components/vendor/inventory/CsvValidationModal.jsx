import { useState, useEffect, useMemo, useRef } from 'react';
import {
  XIcon,
  FileTextIcon,
  CircleCheckIcon,
  BadgeAlertIcon,
  BoxIcon,
  ArrowLeftIcon,
  DownloadIcon,
  UploadIcon,
  TriangleAlertIcon,
} from '@/icons';
import { SAMPLE_CSV_PREVIEW_ROWS } from '@/mock/vendor/vendorInventory.mock';
import {
  downloadSampleInventoryCsv,
  downloadErrorReportCsv,
  parseCsvText,
  validateInventoryRows,
} from '@/utils/csvInventoryHelper';
import { toast } from '@/utils/toast';

export const CsvValidationModal = ({
  isOpen,
  file,
  inventoryItems = [],
  onClose,
  onBack,
  onImportSuccess,
  isCommitting = false,
}) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'valid' | 'invalid'
  const [fileContent, setFileContent] = useState('');
  const [currentFile, setCurrentFile] = useState(file);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const fileInputRef = useRef(null);

  // Sync current file when prop changes
  useEffect(() => {
    setCurrentFile(file);
  }, [file]);

  // Read file contents if real file is provided
  useEffect(() => {
    if (!isOpen) {
      setFileContent('');
      setActiveTab('all');
      return;
    }

    if (currentFile instanceof File || currentFile instanceof Blob) {
      setIsReadingFile(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target?.result || '');
        setIsReadingFile(false);
      };
      reader.onerror = () => {
        toast.error('Failed to read the uploaded CSV file.');
        setIsReadingFile(false);
      };
      reader.readAsText(currentFile);
    } else {
      setFileContent('');
      setIsReadingFile(false);
    }
  }, [isOpen, currentFile]);

  // Parse and validate rows against store inventory
  const validationResult = useMemo(() => {
    // If real CSV content was read, parse & validate
    if (fileContent.trim()) {
      const parsed = parseCsvText(fileContent);
      return validateInventoryRows(parsed.rows, inventoryItems);
    }

    // Fallback: If no real file was uploaded, use mock preview rows
    const mockRows = SAMPLE_CSV_PREVIEW_ROWS.map((r) => ({
      ...r,
      errorType: r.status === 'Invalid' ? (r.errorMessage?.includes('Unit') ? 'UNIT_MISMATCH' : 'INVALID_QUANTITY') : null,
      currentStock: 10,
      newCalculatedStock: 10 + (r.quantity > 0 ? r.quantity : 0),
    }));

    const validRows = mockRows.filter((r) => r.status === 'Valid');
    const invalidRows = mockRows.filter((r) => r.status === 'Invalid');

    return {
      isValidHeader: true,
      totalRows: mockRows.length,
      validRows,
      invalidRows,
      allRows: mockRows,
      skuNotFoundCount: 0,
      variantNotFoundCount: 0,
    };
  }, [fileContent, inventoryItems]);

  if (!isOpen) return null;

  const fileName = currentFile?.name || 'inventory_stock_oct_01.csv';
  const fileSizeStr =
    currentFile?.size ? `${(currentFile.size / 1024).toFixed(1)} KB` : '1.2 KB';

  const {
    isValidHeader,
    headerErrorMessage,
    totalRows,
    validRows,
    invalidRows,
    allRows,
    skuNotFoundCount,
    variantNotFoundCount,
  } = validationResult;

  const validCount = validRows.length;
  const invalidCount = invalidRows.length;
  const hasErrors = invalidCount > 0;

  const displayedRows =
    activeTab === 'valid'
      ? validRows
      : activeTab === 'invalid'
      ? invalidRows
      : allRows;

  const handleFileChange = (e) => {
    const nextFile = e.target.files?.[0];
    if (nextFile) {
      setCurrentFile(nextFile);
      e.target.value = '';
    }
  };

  const handleDownloadErrors = () => {
    if (invalidRows.length === 0) {
      toast.info('No invalid rows to export.');
      return;
    }
    downloadErrorReportCsv(invalidRows, fileName);
    toast.success(`Exported ${invalidRows.length} error rows to CSV.`);
  };

  const handleConfirmImport = () => {
    if (validCount === 0) {
      toast.error('No valid rows available to import.');
      return;
    }
    if (onImportSuccess) {
      onImportSuccess(validRows);
    } else {
      toast.success(`Successfully imported stock for ${validCount} items!`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 sm:p-7 max-h-[92vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden animate-in fade-in zoom-in-95 duration-150 space-y-5">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <XIcon size={18} />
        </button>

        {/* Header with Title and Download Sample Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8 sm:pr-10">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
              CSV Inventory Import & Validation
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review your stock upload before applying changes to your inventory catalog.
            </p>
          </div>

          <button
            type="button"
            onClick={downloadSampleInventoryCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
            title="Download standard template with SKU, product, variant, quantity, unit"
          >
            <DownloadIcon size={14} />
            <span>Download Sample CSV</span>
          </button>
        </div>

        {/* File Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <FileTextIcon size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-slate-800 break-all">
                {fileName}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {fileSizeStr} • {totalRows} data rows checked
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Choose different file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                !isValidHeader
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : hasErrors
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {!isValidHeader
                ? 'Invalid Headers'
                : hasErrors
                ? 'Needs Correction'
                : 'All Rows Valid'}
            </span>
          </div>
        </div>

        {/* Missing Headers Alert (Case 2: Column Header Mismatch) */}
        {!isValidHeader && (
          <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 flex items-start gap-3 text-xs text-rose-900">
            <TriangleAlertIcon size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-bold text-rose-950 block">
                Invalid CSV Structure
              </strong>
              <p className="text-rose-800 text-[11px] leading-relaxed">
                {headerErrorMessage}
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={downloadSampleInventoryCsv}
                  className="font-bold text-rose-700 underline hover:text-rose-950 cursor-pointer text-[11px]"
                >
                  Click here to download the official sample template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Summary Stat Cards */}
        {isValidHeader && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
              <span className="text-lg font-black text-slate-800">{totalRows}</span>
              <span className="text-xs font-semibold text-slate-600">Total Rows</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center gap-2.5">
              <CircleCheckIcon size={16} className="text-emerald-600 shrink-0" />
              <div>
                <span className="text-sm sm:text-base font-black text-emerald-800 block">
                  {validCount}
                </span>
                <span className="text-[11px] font-bold text-emerald-700">Valid</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/80 flex items-center gap-2.5">
              <BadgeAlertIcon size={16} className="text-rose-600 shrink-0" />
              <div>
                <span className="text-sm sm:text-base font-black text-rose-800 block">
                  {invalidCount}
                </span>
                <span className="text-[11px] font-bold text-rose-700">Invalid</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center gap-2.5">
              <BoxIcon size={16} className="text-amber-600 shrink-0" />
              <div>
                <span className="text-sm sm:text-base font-black text-amber-800 block">
                  {skuNotFoundCount + variantNotFoundCount}
                </span>
                <span className="text-[11px] font-bold text-amber-700">Unmatched</span>
              </div>
            </div>
          </div>
        )}

        {/* Notice Info Box */}
        <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-200/80 flex items-start gap-3 text-xs text-orange-950">
          <BoxIcon size={18} className="text-orange-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-orange-900 block">
              Quantities are added to existing stock counts, not overwritten.
            </strong>
            <span className="text-orange-800/80 text-[11px]">
              For example: If current stock is 10 and CSV quantity is 50, resulting stock will be 60.
            </span>
          </div>
        </div>

        {/* Row Preview Table with Filter Tabs */}
        {isValidHeader && (
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-white text-slate-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Rows ({totalRows})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('valid')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                    activeTab === 'valid'
                      ? 'bg-white text-emerald-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Valid ({validCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('invalid')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                    activeTab === 'invalid'
                      ? 'bg-white text-rose-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Invalid ({invalidCount})
                </button>
              </div>

              {hasErrors && (
                <button
                  type="button"
                  onClick={handleDownloadErrors}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
                  title="Download only the failed rows with error descriptions to fix and re-upload"
                >
                  <DownloadIcon size={12} />
                  <span>Download Error Report ({invalidCount})</span>
                </button>
              )}
            </div>

            <div className="border border-slate-200/80 rounded-xl overflow-hidden text-xs max-h-72 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500">
                    <th className="py-2.5 px-3 w-12">Row</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Variant</th>
                    <th className="py-2.5 px-3">Add Qty</th>
                    <th className="py-2.5 px-3">Unit</th>
                    <th className="py-2.5 px-3">Validation Status / Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {displayedRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No rows found for selected tab.
                      </td>
                    </tr>
                  ) : (
                    displayedRows.map((row) => {
                      const isInvalid = row.status === 'Invalid';
                      return (
                        <tr
                          key={row.row}
                          className={`transition-colors ${
                            isInvalid ? 'bg-rose-50/40 hover:bg-rose-50/60' : 'hover:bg-slate-50/60'
                          }`}
                        >
                          <td className="py-2.5 px-3 text-slate-400">{row.row}</td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                            {row.sku || '—'}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-800">
                            {row.product || '—'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {row.variant || 'Standard'}
                          </td>
                          <td
                            className={`py-2.5 px-3 font-bold ${
                              Number(row.quantity) <= 0 || isNaN(Number(row.quantity))
                                ? 'text-rose-600'
                                : 'text-slate-800'
                            }`}
                          >
                            {row.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{row.unit || '—'}</td>
                          <td className="py-2.5 px-3">
                            {!isInvalid ? (
                              <span className="text-emerald-600 font-bold flex items-center gap-1">
                                <CircleCheckIcon size={13} />
                                <span>Valid</span>
                              </span>
                            ) : (
                              <span className="text-rose-600 font-semibold flex items-center gap-1">
                                <BadgeAlertIcon size={13} className="shrink-0" />
                                <span className="leading-snug">{row.errorMessage}</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-400">
              Products are matched via SKU. Variants are checked against existing options. Quantities must be greater than 0.
            </p>
          </div>
        )}

        {/* Action Buttons & Partial Import Option */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ArrowLeftIcon size={14} />
              <span>Cancel / Back</span>
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {hasErrors && (
                <button
                  type="button"
                  onClick={handleDownloadErrors}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                >
                  <DownloadIcon size={14} />
                  <span>Export Errors CSV</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={validCount === 0 || isCommitting || !isValidHeader}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20 active:scale-98"
              >
                <CircleCheckIcon size={15} />
                <span>
                  {isCommitting
                    ? 'Importing...'
                    : hasErrors
                    ? `Import ${validCount} Valid Rows Only`
                    : `Import All ${validCount} Rows`}
                </span>
              </button>
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-400">
            {hasErrors
              ? `You can safely import ${validCount} valid products now. Download the error report to fix the ${invalidCount} invalid rows.`
              : 'All rows are validated and ready to update in your catalog inventory.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CsvValidationModal;
