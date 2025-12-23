import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully to:', options.to);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error('Failed to send email');
  }
}; 