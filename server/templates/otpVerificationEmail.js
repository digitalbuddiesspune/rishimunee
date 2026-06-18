const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const buildOtpVerificationEmail = ({
  otp,
  ttlMinutes = 10,
  clientUrl = "https://www.risheemuni.in",
}) => {
  const safeOtp = escapeHtml(otp);
  const safeTtl = escapeHtml(ttlMinutes);
  const safeClientUrl = escapeHtml(clientUrl);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>RisheeMuni verification code</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f1fb;font-family:Arial,Helvetica,sans-serif;color:#1f1a2e;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f1fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e7e0f4;">
            <tr>
              <td style="padding:28px 32px 16px;text-align:center;background:linear-gradient(135deg,#2f1d5c 0%,#5b2f8b 100%);">
                <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#d9c7ff;">RisheeMuni</p>
                <h1 style="margin:0;font-size:28px;line-height:1.3;color:#ffffff;">Verify your email</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#4a4560;">
                  Use the verification code below to complete your account setup.
                </p>
                <div style="margin:24px 0;padding:20px;border-radius:16px;background:#f8f5ff;border:1px dashed #c8b4ef;text-align:center;">
                  <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#6d5f8d;">Your code</p>
                  <p style="margin:0;font-size:36px;font-weight:700;letter-spacing:10px;color:#2f1d5c;">${safeOtp}</p>
                </div>
                <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#4a4560;">
                  This code expires in <strong>${safeTtl} minutes</strong>.
                </p>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#7a738f;">
                  If you did not request this code, you can safely ignore this email.
                  Never share this code with anyone.
                </p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px auto 0;">
                  <tr>
                    <td style="border-radius:999px;background:#2f1d5c;">
                      <a href="${safeClientUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                        Open RisheeMuni
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 28px;border-top:1px solid #efe8f8;text-align:center;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#9a92ad;">
                  © ${new Date().getFullYear()} RisheeMuni Technologies. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};
