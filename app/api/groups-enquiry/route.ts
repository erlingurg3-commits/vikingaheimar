import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, occasion, guests, date, message } = body;

    // Basic server-side validation
    if (!name?.trim() || !email?.trim() || !occasion?.trim()) {
      return NextResponse.json(
        { error: "Name, email, and occasion are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    // Build the email body
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; color: #222;">
        <h2 style="font-size: 20px; margin-bottom: 4px;">New Group Enquiry</h2>
        <p style="color: #666; font-size: 13px; margin-top: 0;">Submitted via vikingworld.is</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #888; width: 160px;">Name</td>
            <td style="padding: 8px 0; font-weight: 500;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;">Email</td>
            <td style="padding: 8px 0;">
              <a href="mailto:${email}" style="color: #1a1a1a;">${email}</a>
            </td>
          </tr>
          ${phone ? `
          <tr>
            <td style="padding: 8px 0; color: #888;">Phone</td>
            <td style="padding: 8px 0;">
              <a href="tel:${phone}" style="color: #1a1a1a;">${phone}</a>
            </td>
          </tr>` : ""}
          <tr>
            <td style="padding: 8px 0; color: #888;">Occasion</td>
            <td style="padding: 8px 0;">${occasion}</td>
          </tr>
          ${guests ? `
          <tr>
            <td style="padding: 8px 0; color: #888;">Guests</td>
            <td style="padding: 8px 0;">${guests}</td>
          </tr>` : ""}
          ${date ? `
          <tr>
            <td style="padding: 8px 0; color: #888;">Preferred date</td>
            <td style="padding: 8px 0;">${new Date(date).toLocaleDateString("en-GB", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</td>
          </tr>` : ""}
        </table>

        ${message ? `
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 13px; color: #888; margin-bottom: 8px;">Message</p>
        <p style="font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
        ` : ""}

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #aaa;">
          Reply directly to this email to respond to ${name}.
        </p>
      </div>
    `;

    // Send to both inboxes
    await resend.emails.send({
      from: "Víkingaheimar Website <no-reply@vikingworld.is>",
      to: ["info@vikingworld.is", "erlingur@vikingworld.is"],
      replyTo: email,
      subject: `Group enquiry — ${occasion} — ${name}`,
      html,
    });

    // Auto-reply to the enquirer
    await resend.emails.send({
      from: "Erlingur at Víkingaheimar <erlingur@vikingworld.is>",
      to: [email],
      subject: "We received your enquiry — Víkingaheimar",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; color: #222;">
          <h2 style="font-size: 18px;">Thank you, ${name}.</h2>
          <p style="font-size: 14px; line-height: 1.7; color: #444;">
            We have received your enquiry regarding a <strong>${occasion}</strong>
            at Víkingaheimar and will be in touch within one business day.
          </p>
          <p style="font-size: 14px; line-height: 1.7; color: #444;">
            In the meantime, feel free to reach me directly:
          </p>
          <p style="font-size: 14px; color: #222;">
            Erlingur Gunnarsson<br />
            Operations Director, Víkingaheimar<br />
            <a href="mailto:erlingur@vikingworld.is" style="color: #8a6a30;">erlingur@vikingworld.is</a><br />
            <a href="tel:+3548938383" style="color: #8a6a30;">+354 893 8383</a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="font-size: 12px; color: #aaa;">
            Víkingaheimar · Víkingabraut 1 · 260 Reykjanesbær · Iceland
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[groups-enquiry] Error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
