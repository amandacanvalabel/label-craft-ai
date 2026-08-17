// Envio de e-mails via Resend usando a API HTTP (fetch) — sem dependência nova.
// Configure na Vercel:
//   RESEND_API_KEY   — chave da API do Resend (obrigatória para enviar)
//   EMAIL_FROM       — remetente, ex.: "CanvaLabel <no-reply@canvalabel.com>"
//                      (precisa de domínio verificado no Resend)
//   NEXT_PUBLIC_BASE_URL — ex.: "https://www.canvalabel.com" (links dos e-mails)
//
// Se RESEND_API_KEY não estiver definida, os envios são apenas logados (no-op),
// então nada quebra em ambiente sem e-mail configurado.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "CanvaLabel <onboarding@resend.dev>";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.canvalabel.com";

const BRAND = "#2563eb";

type SendResult = { ok: boolean; error?: string };

async function sendEmail(to: string, subject: string, html: string): Promise<SendResult> {
  if (!RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY não configurada — e-mail NÃO enviado:", subject, "→", to);
    return { ok: false, error: "no-api-key" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: EMAIL_FROM, to: [to], subject, html }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[email] falha no envio", res.status, body);
      return { ok: false, error: `resend-${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] erro de rede", err);
    return { ok: false, error: "network" };
  }
}

// Layout base (HTML com CSS inline — compatível com clientes de e-mail).
function layout(opts: {
  title: string;
  intro: string;
  bodyHtml?: string;
  buttonText?: string;
  buttonUrl?: string;
  footerNote?: string;
}): string {
  const { title, intro, bodyHtml = "", buttonText, buttonUrl, footerNote } = opts;
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f5f7fa;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="display:inline-block;font-size:20px;font-weight:800;color:${BRAND};letter-spacing:-.5px;">CanvaLabel</span>
    </div>
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:32px;">
      <h1 style="margin:0 0 12px;font-size:20px;font-weight:800;color:#0f172a;">${title}</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">${intro}</p>
      ${bodyHtml}
      ${
        buttonText && buttonUrl
          ? `<div style="text-align:center;margin:26px 0 8px;">
               <a href="${buttonUrl}" style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:13px 28px;border-radius:9999px;">${buttonText}</a>
             </div>
             <p style="margin:14px 0 0;font-size:12px;line-height:1.5;color:#94a3b8;word-break:break-all;">Se o botão não funcionar, copie e cole este link no navegador:<br>${buttonUrl}</p>`
          : ""
      }
      ${footerNote ? `<p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#64748b;">${footerNote}</p>` : ""}
    </div>
    <p style="text-align:center;margin:20px 0 0;font-size:12px;color:#94a3b8;">
      CanvaLabel — Rótulos ANVISA para alimentos e cosméticos.<br>
      Este é um e-mail automático, não é necessário responder.
    </p>
  </div>
</body></html>`;
}

/** E-mail de recuperação de senha (link seguro, expira em 1 hora). */
export function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  const html = layout({
    title: "Redefinir sua senha",
    intro: `Olá${name ? ", " + name : ""}! Recebemos um pedido para redefinir a senha da sua conta no CanvaLabel. Clique no botão abaixo para criar uma nova senha.`,
    buttonText: "Criar nova senha",
    buttonUrl: resetUrl,
    footerNote:
      "Este link expira em 1 hora e só pode ser usado uma vez. Se você não pediu para redefinir a senha, pode ignorar este e-mail com segurança — sua senha atual continua válida.",
  });
  return sendEmail(to, "Redefinir sua senha — CanvaLabel", html);
}

/** E-mail de boas-vindas ao criar a conta. */
export function sendWelcomeEmail(to: string, name: string, planName?: string) {
  const html = layout({
    title: `Bem-vindo(a) ao CanvaLabel${name ? ", " + name : ""}! 🎉`,
    intro: `Sua conta foi criada com sucesso${planName ? ` no plano <b>${planName}</b>` : ""}. Agora você já pode criar rótulos de alimentos e cosméticos em conformidade com a ANVISA — com tabela nutricional automática, selos obrigatórios e exportação pronta para a gráfica.`,
    buttonText: "Acessar minha conta",
    buttonUrl: `${BASE_URL}/dashboard`,
    footerNote: "Qualquer dúvida, é só chamar a gente pelo suporte dentro da plataforma.",
  });
  return sendEmail(to, "Bem-vindo(a) ao CanvaLabel!", html);
}

/** E-mail de confirmação de plano/pagamento ativado. */
export function sendPlanConfirmationEmail(to: string, name: string, planName: string, amount: number) {
  const valor =
    amount > 0
      ? `R$ ${amount.toFixed(2).replace(".", ",")}`
      : "Gratuito";
  const html = layout({
    title: "Plano ativado ✅",
    intro: `Olá${name ? ", " + name : ""}! Confirmamos a ativação do seu plano no CanvaLabel.`,
    bodyHtml: `<div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:8px 0;">
        <div style="display:flex;justify-content:space-between;font-size:14px;color:#475569;padding:4px 0;">
          <span>Plano</span><b style="color:#0f172a;">${planName}</b>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:14px;color:#475569;padding:4px 0;">
          <span>Valor</span><b style="color:#0f172a;">${valor}</b>
        </div>
      </div>`,
    buttonText: "Começar a criar rótulos",
    buttonUrl: `${BASE_URL}/dashboard`,
    footerNote: amount > 0 ? "O comprovante do pagamento é enviado separadamente pelo nosso meio de pagamento." : undefined,
  });
  return sendEmail(to, "Plano ativado — CanvaLabel", html);
}
