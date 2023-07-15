const nodemailer = require("nodemailer");

const sendMail = async (option) => {
  // 1. Create the transpoter: service that actually send the email ex gmail
  console.log("email started...");
  const transpoter = nodemailer.createTransport({
    host: process.env.HOST,
    port: process.env.GPORT,
    auth: {
      user: process.env.GUSER,
      pass: process.env.GPASS,
    },
  });
  transpoter.verify((error, success) => {
    if (error) {
      console.error("Mailtrap configuration error:", error);
    } else {
      console.log("Mailtrap configured successfully");
    }
  });

  // 2. define the email options\

  const mailOptions = {
    from: "info@mailtrap.club",
    to: option.email,
    subject: option.subject,
    text: option.message,
  };
  // 3. actually sent the email
  console.log(mailOptions);
  await transpoter.sendMail(mailOptions);
  console.log("mailSend");
};

module.exports = sendMail;
