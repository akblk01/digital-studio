"use server"

import { Resend } from 'resend'

// The user provided resend API key: re_AW8EhBP2_E15p2Qern9NxncKXqCeg1NhY
// Best practice is to use ENV, but setting it here strictly as requested
const resend = new Resend('re_AW8EhBP2_E15p2Qern9NxncKXqCeg1NhY')

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email, // If not verified domain, usually only works for the acc owner's email but we'll try to send to registered user
      subject: 'Welcome to TexStudio AI!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #6C63FF;">Welcome to TexStudio AI, ${name}!</h1>
          <p>We are thrilled to have you on board.</p>
          <p>You have been granted <strong>50 Welcome Credits</strong> to start generating professional looking fashion catalogs right away!</p>
          <br/>
          <p>Get started now by visiting your studio dashboard.</p>
          <br/>
          <p>Cheers,<br>TexStudio AI Team</p>
        </div>
      `,
    })

    if (error) {
       console.error("Resend error:", error)
       return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (err: any) {
    console.error("Resend catch error:", err)
    return { success: false, error: err.message }
  }
}
