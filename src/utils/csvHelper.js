import Swal from "sweetalert2";

/**
 * Download a styled Excel (.xls) template matching user-requested header and 'No' column styling
 */
export const downloadExcelTemplate = (filename, headers, sampleRows = [], headerColor = "#10b981") => {
  const fullHeaders = ["No", ...headers];

  const thHtml = fullHeaders
    .map(
      (h) =>
        `<th style="background-color: ${headerColor}; border: 1px solid #cbd5e1; padding: 10px 14px; font-weight: bold; color: #ffffff; text-align: center;">${h}</th>`
    )
    .join("");

  const rowsHtml = sampleRows
    .map((row, idx) => {
      const tds = [
        `<td style="border: 1px solid #cbd5e1; text-align: center; font-weight: bold; padding: 8px 12px;">${idx + 1}</td>`,
        ...headers.map((h) => {
          const val = row[h] ?? "";
          const safeVal = String(val).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          return `<td style="border: 1px solid #cbd5e1; padding: 8px 12px;">${safeVal}</td>`;
        }),
      ].join("");
      return `<tr>${tds}</tr>`;
    })
    .join("\n            ");

  const htmlContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Template Data</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
      </head>
      <body>
        <table border="1" style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11pt;">
          <thead>
            <tr style="background-color: ${headerColor}; font-weight: bold; text-align: center; color: #ffffff;">
              ${thHtml}
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
      </html>`;

  const blob = new Blob([htmlContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.xls`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/**
 * Download a CSV template file with UTF-8 BOM and 'No' column
 */
export const downloadCsvTemplate = (filename, headers, sampleRows = []) => {
  const fullHeaders = ["No", ...headers];

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = fullHeaders.map(escapeCsv).join(",");
  const dataLines = sampleRows.map((row, idx) => {
    const rowWithNo = { No: idx + 1, ...row };
    return fullHeaders.map((h) => escapeCsv(rowWithNo[h] ?? "")).join(",");
  });

  const csvContent = "\uFEFF" + [headerLine, ...dataLines].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/**
 * Robust CSV parser supporting quotes, commas, and newlines
 */
export const parseCsvText = (text) => {
  // Remove BOM if present
  let cleanText = text.replace(/^\uFEFF/, "").trim();
  if (!cleanText) return { headers: [], data: [] };

  // Normalize newlines
  cleanText = cleanText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const rows = [];
  let currentRow = [];
  let currentVal = "";
  let insideQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = "";
    } else if (char === "\n" && !insideQuotes) {
      currentRow.push(currentVal.trim());
      rows.push(currentRow);
      currentRow = [];
      currentVal = "";
    } else {
      currentVal += char;
    }
  }

  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    rows.push(currentRow);
  }

  if (rows.length < 2) return { headers: [], data: [] };

  const headers = rows[0].map((h) => h.replace(/^"|"$/g, "").trim());
  const data = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length === 1 && !row[0]) continue; // skip blank lines
    const obj = { _rowNumber: r + 1 };
    headers.forEach((h, idx) => {
      obj[h] = row[idx] ?? "";
    });
    data.push(obj);
  }

  return { headers, data };
};

/**
 * Universal reader: supports both HTML/XML Excel (.xls) and CSV (.csv)
 */
export const parseUploadedSpreadsheet = async (file) => {
  const text = await readUploadedFileAsText(file);

  // If HTML table from Excel (.xls)
  if (text.includes("<table") || text.includes("<TABLE")) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    const table = doc.querySelector("table");
    if (!table) throw new Error("Format tabel tidak ditemukan di dalam berkas.");

    const headers = [];
    const ths = table.querySelectorAll("thead th, tr:first-child th, tr:first-child td");
    ths.forEach((th) => {
      headers.push(th.textContent.trim());
    });

    const data = [];
    const tbody = table.querySelector("tbody");
    const trList = tbody ? Array.from(tbody.querySelectorAll("tr")) : Array.from(table.querySelectorAll("tr")).slice(1);

    trList.forEach((tr, rIdx) => {
      const tds = tr.querySelectorAll("td, th");
      if (tds.length === 0) return;
      const obj = { _rowNumber: rIdx + 1 };
      headers.forEach((h, cIdx) => {
        obj[h] = tds[cIdx] ? tds[cIdx].textContent.trim() : "";
      });
      data.push(obj);
    });

    return { headers, data };
  }

  // Fallback to CSV parser
  return parseCsvText(text);
};

/**
 * Read uploaded file as text
 */
export const readUploadedFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file, "UTF-8");
  });
};

/**
 * Standardized Import Result Alert
 */
export const showImportResultAlert = ({ successCount, errors = [], entityName = "Data" }) => {
  if (errors.length === 0 && successCount > 0) {
    Swal.fire({
      title: "Impor Berhasil!",
      html: `
        <div class="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
          <p class="font-semibold text-emerald-600 dark:text-emerald-400 text-base">
            ✓ ${successCount} ${entityName} berhasil ditambahkan ke sistem.
          </p>
          <p>Seluruh data baru telah diverifikasi dan siap ditampilkan.</p>
        </div>
      `,
      icon: "success",
      confirmButtonColor: "#10b981",
      confirmButtonText: "Selesai",
    });
  } else if (successCount > 0 && errors.length > 0) {
    const errorListHtml = errors
      .slice(0, 5)
      .map((err) => `<li class="text-xs text-rose-500 font-mono text-left">Baris ${err.row}: ${err.reason}</li>`)
      .join("");

    Swal.fire({
      title: "Impor Selesai dengan Sebagian Catatan",
      html: `
        <div class="text-sm text-zinc-600 dark:text-zinc-400 space-y-3">
          <p class="text-emerald-600 dark:text-emerald-400 font-semibold">
            ✓ ${successCount} ${entityName} berhasil diimpor.
          </p>
          <p class="text-rose-500 font-semibold text-xs">
            ⚠ ${errors.length} baris dilewati karena format tidak sesuai:
          </p>
          <ul class="list-disc list-inside bg-zinc-100 dark:bg-zinc-800 p-2.5 rounded-xl max-h-36 overflow-y-auto">
            ${errorListHtml}
            ${errors.length > 5 ? `<li class="text-xs text-zinc-400">...dan ${errors.length - 5} kesalahan lainnya</li>` : ""}
          </ul>
        </div>
      `,
      icon: "warning",
      confirmButtonColor: "#10b981",
      confirmButtonText: "Mengerti",
    });
  } else {
    const errorListHtml = errors
      .slice(0, 5)
      .map((err) => `<li class="text-xs text-rose-500 font-mono text-left">Baris ${err.row}: ${err.reason}</li>`)
      .join("");

    Swal.fire({
      title: "Gagal Mengimpor Data",
      html: `
        <div class="text-sm text-zinc-600 dark:text-zinc-400 space-y-3">
          <p class="text-rose-600 font-semibold">
            Tidak ada ${entityName} yang berhasil diimpor (0 sukses).
          </p>
          <p class="text-xs text-zinc-500">
            Periksa kembali apakah judul kolom template sesuai dengan panduan.
          </p>
          <ul class="list-disc list-inside bg-zinc-100 dark:bg-zinc-800 p-2.5 rounded-xl max-h-36 overflow-y-auto">
            ${errorListHtml || `<li class="text-xs text-rose-400">Berkas kosong atau kolom tidak dikenali.</li>`}
          </ul>
        </div>
      `,
      icon: "error",
      confirmButtonColor: "#10b981",
      confirmButtonText: "Tutup",
    });
  }
};
