Setup e deploy da Cloud Function de envio de e-mail (SendGrid)

1) Instalar dependências

  Na pasta `functions/` rode:

  npm install

2) Configurar variáveis de ambiente (opções):

  Usando firebase functions config (recomendado):

  firebase functions:config:set sendgrid.apikey="YOUR_SENDGRID_API_KEY" sendgrid.from="noreply@yourdomain.com"

  Ou definir variáveis de ambiente no ambiente de execução (process.env.SENDGRID_API_KEY, EMAIL_FROM).

3) Testar localmente (emulador):

  npm run start

  e envie um POST para http://localhost:5001/<PROJECT_ID>/us-central1/sendContactEmail com JSON { name, email, subject, message }

4) Deploy:

  firebase deploy --only functions

5) No front-end Angular, realizar um POST para a URL da função (ou usar rewrite do Hosting):

  Exemplo com fetch:

  fetch('https://us-central1-YOUR_PROJECT.cloudfunctions.net/sendContactEmail', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, subject, message })
  })

  Exemplo com Angular HttpClient:

  this.http.post('/sendContactEmail', { name, email, subject, message }).subscribe(...)

Observações:
- Recomendo usar SendGrid (ou outro provedor) por confiabilidade. O envio direto por SMTP via nodemailer é possível, mas pode exigir credenciais SMTP e tem mais problemas com entrega.
- Se quiser, eu posso: criar um endpoint Callable em vez de HTTP, integrar validação adicional, ou adicionar reCAPTCHA antes do envio no front-end.
