const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'references', 'Prompts actualizacion.xlsx');
const outPath = path.join(__dirname, 'temp_excel_content.json');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    fs.writeFileSync(outPath, JSON.stringify(jsonData, null, 2));
    console.log('Done');
} catch (error) {
    console.error('Error reading file:', error);
}
