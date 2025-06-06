import nodemailer from "nodemailer";

export async function sendWelcomeEmail(toEmail) {
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: parseInt(process.env.MAILTRAP_PORT),
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });

  const mailOptions = {
  from: process.env.MAILTRAP_FROM,
  to: toEmail,
  subject: "Welcome to Unbound",
  text: `Welcome to Unbound. This is your space to reflect, express, and remain in remembrance of the Truth. You are free.`,
  html: `
    <div style="font-family: sans-serif; font-size: 16px; line-height: 1.7; color: #333;">
      <p>Hi there,</p>

      <p>I’m so glad you’ve decided to be part of this space.</p>

      <p>
        Unbound is a space where Truth can be expressed and contemplated. 
        It’s here to invoke the truth of your real nature and to share insights that uplift others.
      </p>

      <p>
        By remaining in remembrance of the Truth, we begin to dissolve the illusion of separation — and the fear it brings.
      </p>

      <p>
        I hope you enjoy your stay here, and remember to treat this space like your own inner temple.
      </p>

      <p>
        Welcome to Unbound. I’m truly glad to have you here, and I look forward to seeing your expressions of the Truth.
      </p>

      <p>
        → <a href="https://iamtruth.me/feed" style="color: #0070f3; text-decoration: none;">Visit the space</a>
      </p>

      <p style="margin-top: 2rem;">Sincerely,<br><strong>Unbound</strong></p>
    </div>
  `,
};


  await transporter.sendMail(mailOptions);
}
