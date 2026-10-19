export function csvCell(value: unknown) {
  let text = String(value ?? "")
  if (/^[\s\u0000-\u001f]*[=+\-@]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}
export function csvDocument(headers: string[], rows: unknown[][]) {
  return (
    "\uFEFF" +
    [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")
  )
}
