const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const AdmZip = require("adm-zip");

// Define required columns
const REQUIRED_COLUMNS = [
  "Employee Id",
  "First Name",
  "Last Name",
  "Permanent Address",
  "Birth Date",
];

// Input and output paths
const inputFolder = "downloadedFiles";
const extractedFolder = "extractedFiles";
const outputCSV = "consolidated_data.csv";

// Ensure required folders exist
if (!fs.existsSync(inputFolder)) fs.mkdirSync(inputFolder, { recursive: true });
if (!fs.existsSync(extractedFolder))
  fs.mkdirSync(extractedFolder, { recursive: true });

// CSV Writer setup
const csvWriter = createCsvWriter({
  path: outputCSV,
  header: REQUIRED_COLUMNS.map((col) => ({ id: col, title: col })),
});

// Extract `.zip` files before processing
const extractZipFiles = async () => {
  const files = fs.readdirSync(inputFolder);
  for (const file of files) {
    if (file.endsWith(".zip")) {
      const filePath = path.join(inputFolder, file);
      console.log(`Extracting: ${file}`);
      const zip = new AdmZip(filePath);
      zip.extractAllTo(extractedFolder, true);
    }
  }
};

// Read all `.xlsx` files from extracted folder
const processExcelFiles = async () => {
  const files = fs.readdirSync(extractedFolder);
  console.log("Extracted Files:", files);

  let allData = [];

  for (const file of files) {
    if (file.endsWith(".xlsx")) {
      const filePath = path.join(extractedFolder, file);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);

      console.log(`Processing: ${file}`);
      console.log(
        "Available Sheets:",
        workbook.worksheets.map((s) => `"${s.name}"`)
      );

      // Locate "Basic Details" sheet
      const sheet = workbook.worksheets.find(
        (s) => s.name.trim().toLowerCase() === "basic details"
      );

      if (!sheet) {
        console.warn(`"Basic employee details" sheet not found in ${file}`);
        continue;
      }

      // Extract header row
      const headerRow = sheet.getRow(1).values;

      const missingColumns = REQUIRED_COLUMNS.filter(
        (col) => !headerRow.includes(col)
      );

      if (missingColumns.length > 0) {
        console.warn(
          `Missing columns in ${file}: ${missingColumns.join(", ")}`
        );
        continue;
      }

      // Extract required columns
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row

        const rowData = {};
        REQUIRED_COLUMNS.forEach((col) => {
          rowData[col] = row.getCell(headerRow.indexOf(col)).value || "";
        });

        allData.push(rowData);
      });
    }
  }

  // Write to CSV if data exists
  if (allData.length > 0) {
    await csvWriter.writeRecords(allData);
    console.log(`CSV file created: ${outputCSV}`);
  } else {
    console.warn("No valid data found. CSV not created.");
  }
};

// Run the entire process
(async () => {
  await extractZipFiles();
  await processExcelFiles();
})();
