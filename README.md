# fetch-employee-details
1. I have .zip files on S3 which I need to download using GraphQL API created in AppSync. This repository contains downloadFiles.js which does this task. Also once downloaded, we need to unzip files and read "Basic Details" sheet from each .xlsx file. Then read specific 5 columns from each sheet and add it in single csv file. This later part is done by createCSV.js
2. I need to upload .zip files on s3. For the project testing purpose, I added 5 files on S3. For now, these files names are also hard-coded in script.
  -> Employee details - Mumbai.zip
  -> Employee details - Pune.zip
  -> Employee details - Noida.zip
  -> Employee details - Hyderabad.zip
  -> Employee details - Bengaluru.zip
3. Each .xlsx file is having multiple sheets:
  -> Basic Details
  -> Company Profile
  -> Financials
  -> Skills & Certs
  -> Education
  -> Previous Company
4. I need to only read first sheet: Basic Details. In that sheet, there are 20+ columns. I only want to read 5 columns data (Employee Id,First Name,Last Name,Permanent Address,Birth Date) and put it in csv file named consolidated_data.csv.
5. I have created GraphQL API in AWS AppSync and for accessing s3 bucket I need presigned url for which I have used GetS3PreSignedUrl() lambda function. 

