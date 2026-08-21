import { Resend } from "resend";

type AccessCodeEmail = {
  to: string;
  name: string;
  code: string;
};

/**
 * Without a Resend key there is no way to deliver, and pretending otherwise is
 * worse than failing: the caller records an OTP challenge and tells the member
 * a code is on its way. So this fails closed everywhere unless a developer
 * opts in explicitly, and the opt-in cannot be honoured in production.
 *
 * MAIL_CONSOLE_FALLBACK=true prints the message — access codes included — to
 * the server log. Only ever set it on a local machine.
 */
function deliveryUnavailable(summary: string) {
  const optedIn = process.env.MAIL_CONSOLE_FALLBACK === "true";
  const local = process.env.NODE_ENV !== "production";

  if (!optedIn || !local) {
    return new Error("RESEND_API_KEY is not set");
  }

  console.warn(
    `[mail] MAIL_CONSOLE_FALLBACK is on and RESEND_API_KEY is not set — nothing was delivered.\n[mail] ${summary}`,
  );
  return null;
}

function fromAddress() {
  return (
    process.env.RESEND_FROM_EMAIL?.replace(/^["']|["']$/g, "") ||
    "EC-Council Advisory Board <noreply@ecc0uncil.org>"
  );
}

export async function sendAccessCodeEmail({ to, name, code }: AccessCodeEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    const failure = deliveryUnavailable(`access code for ${to}: ${code}`);
    if (failure) {
      throw failure;
    }
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: fromAddress(),
    to,
    subject: "Your EC-Council AI Advisory Board access code",
    html: renderAccessCodeEmail(name, code),
    text: renderAccessCodeText(name, code),
  });

  if (error) {
    throw new Error(error.message);
  }
}

type ReminderEmail = {
  to: string;
  name: string;
  closesAt: string;
  url: string;
};

export async function sendPulseReminderEmail({
  to,
  name,
  closesAt,
  url,
}: ReminderEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    const failure = deliveryUnavailable(`reminder for ${to} (${name})`);
    if (failure) {
      throw failure;
    }
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: fromAddress(),
    to,
    subject: "Reminder: your EC-Council AI Advisory Board pulse",
    html: renderReminderEmail(name, closesAt, url),
    text: renderReminderText(name, closesAt, url),
  });

  if (error) {
    throw new Error(error.message);
  }
}

function renderReminderEmail(name: string, closesAt: string, url: string) {
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(url);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>Board Pulse reminder</title>
  </head>
  <body style="margin:0;padding:0;background:#F3F0EA;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F0EA;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #E4DFD4;">
            <tr>
              <td style="height:4px;background:#9F1D1D;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:32px 40px 12px;font-family:Georgia,'Times New Roman',serif;">
                <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#9F1D1D;">
                  EC-Council
                </p>
                <p style="margin:0;font-size:22px;line-height:1.3;color:#1A1916;">
                  Artificial Intelligence Advisory Board
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px 8px;font-family:Georgia,'Times New Roman',serif;color:#1A1916;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Dear ${safeName},</p>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#4A463C;">
                  Your response to the Board Pulse has not been submitted yet. It takes about twelve minutes, and the window closes on <strong style="color:#1A1916;">${escapeHtml(closesAt)}</strong>.
                </p>
                <p style="margin:0;font-size:16px;line-height:1.7;color:#4A463C;">
                  Select your name on the board page and we will send a one-time access code to this address.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:24px 40px 32px;">
                <a href="${safeUrl}" style="display:inline-block;padding:14px 28px;background:#9F1D1D;color:#FFFFFF;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;text-decoration:none;border-radius:4px;">
                  Open the board page
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 40px 24px;border-top:1px solid #E4DFD4;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#8A8478;">
                EC-Council Artificial Intelligence Advisory Board<br />
                This is an automated message. Please do not reply.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderReminderText(name: string, closesAt: string, url: string) {
  return [
    `Dear ${name},`,
    "",
    "Your response to the EC-Council AI Advisory Board pulse has not been submitted yet.",
    `The window closes on ${closesAt}.`,
    "",
    `Open the board page and select your name to receive a one-time access code: ${url}`,
    "",
    "EC-Council Artificial Intelligence Advisory Board",
  ].join("\n");
}

function renderAccessCodeEmail(name: string, code: string) {
  const safeName = escapeHtml(name);
  const digits = code.split("");
  const digitCells = digits
    .map(
      (digit) => `
        <td align="center" style="padding:0 4px;">
          <div style="width:44px;height:56px;line-height:56px;border:1px solid #D6D0C6;border-radius:4px;background:#FAF8F4;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;letter-spacing:0;color:#1A1916;">
            ${escapeHtml(digit)}
          </div>
        </td>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>Advisory Board access code</title>
  </head>
  <body style="margin:0;padding:0;background:#F3F0EA;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      Your one-time access code is ${escapeHtml(code)}. It expires in 10 minutes.
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F0EA;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #E4DFD4;">
            <tr>
              <td style="height:4px;background:#9F1D1D;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:32px 40px 12px;font-family:Georgia,'Times New Roman',serif;">
                <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#9F1D1D;">
                  EC-Council
                </p>
                <p style="margin:0;font-size:22px;line-height:1.3;color:#1A1916;">
                  Artificial Intelligence Advisory Board
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 40px 0;">
                <div style="height:1px;background:#E4DFD4;font-size:0;line-height:0;">&nbsp;</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 8px;font-family:Georgia,'Times New Roman',serif;color:#1A1916;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
                  Dear ${safeName},
                </p>
                <p style="margin:0;font-size:16px;line-height:1.7;color:#4A463C;">
                  Use the one-time access code below to sign in to the Advisory Board workspace. For your security, this code expires in <strong style="color:#1A1916;">10 minutes</strong> and can be used only once.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:28px 40px;">
                <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7A7468;">
                  Access code
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    ${digitCells}
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 32px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#7A7468;">
                If you did not request this code, you can ignore this message. No access will be granted without it.
              </td>
            </tr>
            <tr>
              <td style="padding:18px 40px 24px;border-top:1px solid #E4DFD4;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#8A8478;">
                EC-Council Artificial Intelligence Advisory Board<br />
                This is an automated message. Please do not reply.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderAccessCodeText(name: string, code: string) {
  return [
    `Dear ${name},`,
    "",
    "Your one-time access code for the EC-Council Artificial Intelligence Advisory Board is:",
    "",
    code,
    "",
    "This code expires in 10 minutes and can be used only once.",
    "",
    "If you did not request this code, you can ignore this message.",
    "",
    "EC-Council Artificial Intelligence Advisory Board",
  ].join("\n");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
