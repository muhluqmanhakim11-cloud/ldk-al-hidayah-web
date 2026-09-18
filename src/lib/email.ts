import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password (bukan password biasa)
  },
});

interface SendAcceptedEmailOptions {
  to: string;        // email anggota
  name: string;      // nama anggota
  division?: string; // nama divisi (opsional)
}

export async function sendAcceptedEmail({ to, name, division }: SendAcceptedEmailOptions) {
  const divisionText = division ? `di bidang <strong>${division}</strong>` : "di LDK Al-Hidayah";

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Selamat Bergabung!</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a6b3a 0%,#2d9e5f 100%);padding:40px 40px 30px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;letter-spacing:1px;">LDK Al-Hidayah</h1>
              <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Lembaga Dakwah Kampus</p>
            </td>
          </tr>
          <!-- Congratulations Banner -->
          <tr>
            <td style="background:#e8f5ed;padding:30px 40px;text-align:center;border-bottom:2px solid #2d9e5f;">
              <p style="font-size:40px;margin:0;">🎉</p>
              <h2 style="color:#1a6b3a;margin:12px 0 6px;font-size:22px;">Selamat, ${name}!</h2>
              <p style="color:#2d9e5f;margin:0;font-size:15px;font-weight:600;">Pendaftaran Anda Telah <strong>DITERIMA</strong></p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:35px 40px;">
              <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 18px;">Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
              <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 18px;">
                Alhamdulillah, dengan bangga kami menyampaikan bahwa Anda resmi diterima sebagai anggota 
                <strong style="color:#1a6b3a;">LDK Al-Hidayah</strong> ${divisionText}.
              </p>
              <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 25px;">
                Kami berharap Anda dapat memberikan kontribusi terbaik dan bersama-sama kita membangun dakwah yang bermakna di lingkungan kampus.
              </p>
              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf4;border-left:4px solid #2d9e5f;border-radius:4px;margin-bottom:25px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="color:#1a6b3a;font-size:13px;font-weight:700;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.5px;">Langkah Selanjutnya</p>
                    <p style="color:#444;font-size:14px;line-height:1.6;margin:0;">
                      Harap pantau informasi lebih lanjut mengenai jadwal kegiatan orientasi anggota baru melalui grup WhatsApp resmi LDK Al-Hidayah atau hubungi pengurus.
                    </p>
                  </td>
                </tr>
              </table>
              <p style="color:#333;font-size:15px;line-height:1.7;margin:0;">
                Semoga Allah SWT meridhoi setiap langkah kita dalam ber-amar ma'ruf nahi munkar. Aamiin.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;padding:25px 40px;text-align:center;border-top:1px solid #eee;">
              <p style="color:#888;font-size:12px;margin:0 0 6px;">Email ini dikirim otomatis oleh sistem LDK Al-Hidayah.</p>
              <p style="color:#888;font-size:12px;margin:0;">Jika ada pertanyaan, silakan hubungi pengurus melalui WhatsApp resmi.</p>
              <p style="color:#2d9e5f;font-size:13px;font-weight:600;margin:12px 0 0;">LDK Al-Hidayah &mdash; Bersama Membangun Dakwah Kampus</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  await transporter.sendMail({
    from: `"LDK Al-Hidayah" <${process.env.EMAIL_USER}>`,
    to,
    subject: "🎉 Selamat! Pendaftaran Anda di LDK Al-Hidayah Diterima",
    html,
  });
}
