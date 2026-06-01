/* eslint-disable */
const xlsx = require('xlsx');
const path = require('path');

const filePath = 'C:\\Users\\ABDER SHAHEEN\\Downloads\\KB 2.0 Update (2).xlsx';
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
console.log('First 15 rows of KB 2.0 Update (2).xlsx:');
for (let i = 0; i < Math.min(data.length, 15); i++) {
  console.log(`Row ${i}:`, data[i]);
}
