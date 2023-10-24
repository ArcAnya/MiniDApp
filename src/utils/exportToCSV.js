import Papa from 'papaparse';

export function exportToCSV(data) {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported_data.csv';
    a.click();
    URL.revokeObjectURL(url);
}
