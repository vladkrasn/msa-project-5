import { SQL } from "bun";
import { asString, generateCsv, mkConfig } from 'export-to-csv';
import { createTransport } from 'nodemailer';

// Extract data (the db is the one from task 1)
const pg = new SQL("postgres://airflow:airflow@postgres:5432/airflow");
const result = await pg`SELECT * from test`;

// Create csv
const csvConfig = mkConfig({ useKeysAsHeaders: true });
const csv = generateCsv(csvConfig)(result);
const csvBuffer = Buffer.from(asString(csv));

// Write the csv file to disk
//await Bun.write("./report.csv", new Uint8Array(csvBuffer))

const mailTransport = createTransport({
// secret transport info
})

await mailTransport.sendMail({
  from: "email@test.com",
  attachments: [{
    cid: "0",
    filename: "report.csv",
    content: csvBuffer,
  }],
  to: "email@test.com",
  subject: "Your report is here!",
})
