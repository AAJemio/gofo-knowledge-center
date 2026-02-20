
import * as XLSX from 'xlsx';
import path from 'path';

const filePath = path.join(process.cwd(), 'references', 'AgentExportRecord_2026-02-14_20_56_21.xlsx');
console.log('Reading file:', filePath);

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Get headers (first row)
    const headers = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0];
    console.log('Headers:', headers);

    // Get first row of data
    const data = XLSX.utils.sheet_to_json(sheet)[0];
    console.log('Sample Data:', data);

} catch (error) {
    console.error('Error reading file:', error);
}
