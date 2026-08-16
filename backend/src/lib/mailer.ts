export type ContactMessage = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

/**
 * Delivers a contact-form message.
 *
 * With RESEND_API_KEY set, it sends a real email via Resend (resend.com —
 * free tier is plenty for a portfolio). Without it, the message is just
 * logged, so local development works with no accounts or secrets.
 */
export async function sendContactEmail(msg: ContactMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";

  if (!apiKey || !to) {
    console.log("[contact] (no RESEND_API_KEY — logging instead of sending)");
    console.log(`  from: ${msg.name} <${msg.email}>`);
    console.log(`  subject: ${msg.subject}`);
    console.log(`  message: ${msg.message}`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: msg.email,
      subject: `[Portfolio] ${msg.subject}`,
      text: `${msg.message}\n\n— ${msg.name} <${msg.email}>`,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
  }
}
