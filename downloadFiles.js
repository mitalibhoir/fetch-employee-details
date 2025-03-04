const { Amplify } = require("aws-amplify");
const awsExports = require("./aws-exports");
const path = require("path");

// console.log("awsExports:", JSON.stringify(awsExports, null, 2));
Amplify.configure(awsExports);

const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");

const axios = require("axios");
const fs = require("fs");
const { exit } = require("process");
const { log } = require("console");

const APPSYNC_ENDPOINT =
  "https://n3r6lwce2rhilmn6xrgwmtfvdq.appsync-api.ap-south-1.amazonaws.com/graphql";
const API_KEY = "da2-cco7p4srwzcp7nboiwrbzdgw6i";

if (isMainThread) {
  // List of files to download
  const fileNames = [
    "Employee details - Mumbai.zip",
    "Employee details - Pune.zip",
    "Employee details - Noida.zip",
    "Employee details - Hyderabad.zip",
    "Employee details - Bengaluru.zip",
  ];

  fileNames.forEach((file) => {
    const worker = new Worker(__filename, { workerData: file });
    worker.on("message", (msg) => console.log(msg));
    worker.on("error", (err) => console.error(err));
  });
} else {
  (async () => {
    const fileName = workerData;

    try {
      const downloadFolder = path.join(__dirname, "downloadedFiles");
      if (!fs.existsSync(downloadFolder)) {
        fs.mkdirSync(downloadFolder, { recursive: true });
      }

      // Request pre-signed URL from AppSync
      const response = await axios.post(
        APPSYNC_ENDPOINT,
        {
          query: `query GetFileDownloadUrl($fileName: String!) {
        getFileDownloadUrl(fileName: $fileName) {
            url
        }
    }`,
          variables: { fileName },
        },
        {
          headers: {
            "x-api-key": API_KEY,
            "Content-Type": "application/text",
          },
        }
      );

      const fileUrl = response.data.data.getFileDownloadUrl.url;

      const filePath = path.join(downloadFolder, fileName);

      // Download the file using the pre-signed URL
      const writer = fs.createWriteStream(filePath);
      const res = await axios.get(fileUrl, { responseType: "stream" });
      res.data.pipe(writer);

      writer.on("finish", () =>
        parentPort.postMessage(`${fileName} downloaded to ${filePath}`)
      );
    } catch (error) {
      parentPort.postMessage(`Error downloading ${fileName}: ${error.message}`);
    }
  })();
}
