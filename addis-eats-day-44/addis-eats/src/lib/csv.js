function quoteCsvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function toCsv(headers, rows) {
  return [headers, ...rows]
    .map((row) => row.map(quoteCsvCell).join(","))
    .join("\r\n");
}

export function downloadCsv(filename, headers, rows) {
  const blob = new Blob(["\uFEFF", toCsv(headers, rows)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
