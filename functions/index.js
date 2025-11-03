const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const cors = require('cors')({ origin: true });

admin.initializeApp();

// Expect SENDGRID_API_KEY and EMAIL_FROM to be set in functions config
const SENDGRID_API_KEY = functions.config().sendgrid?.apikey || process.env.SENDGRID_API_KEY;
const EMAIL_FROM = functions.config().sendgrid?.from || process.env.EMAIL_FROM;

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

exports.sendContactEmail = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send({ error: 'Method Not Allowed' });
    }

    const { name, email, subject, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).send({ error: 'Missing required fields: name, email, message' });
    }

    if (!SENDGRID_API_KEY || !EMAIL_FROM) {
      console.error('SendGrid not configured. Set SENDGRID_API_KEY and EMAIL_FROM in functions config.');
      return res.status(500).send({ error: 'Email service not configured' });
    }

    const mail = {
      to: EMAIL_FROM, // send to site owner
      from: EMAIL_FROM,
      subject: subject || `Mensagem de contato de ${name}`,
      replyTo: email,
      text: `Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`,
      html: `<p><strong>Nome:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><hr/><p>${message}</p>`
    };

    try {
      await sgMail.send(mail);
      return res.status(200).send({ success: true });
    } catch (error) {
      console.error('Erro ao enviar email via SendGrid:', error?.response?.body || error);
      return res.status(500).send({ error: 'Failed to send email' });
    }
  });
});
