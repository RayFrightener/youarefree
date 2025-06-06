import dotenv from "dotenv";
dotenv.config();

import { sendWelcomeEmail } from "./lib/email.js";

const testEmail = "your@email.com"; // Any email, Mailtrap will catch it
console.log(process.env.MAILTRAP_HOST, process.env.MAILTRAP_USER);

sendWelcomeEmail(testEmail)
  .then(() => {
    console.log("Test email sent!");
  })
  .catch((err) => {
    console.error("Failed to send test email:", err);
  });