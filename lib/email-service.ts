import nodemailer from "nodemailer"
import { ApiError } from "./api-error"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Use App Password for Gmail
  },
})

export const sendServiceConfirmationEmail = async (
  userEmail: string,
  userName: string,
  serviceDetails: {
    name: string
    provider: string
    date: string
    time: string
    price: number
  },
) => {
  try {
    await transporter.sendMail({
      from: `"ServiceHub" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: "Service Booking Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank you for your booking, ${userName}!</h2>
          <p>Your service has been confirmed. Here are the details:</p>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
            <p><strong>Service:</strong> ${serviceDetails.name}</p>
            <p><strong>Provider:</strong> ${serviceDetails.provider}</p>
            <p><strong>Date:</strong> ${serviceDetails.date}</p>
            <p><strong>Time:</strong> ${serviceDetails.time}</p>
            <p><strong>Price:</strong> $${serviceDetails.price}</p>
          </div>
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br>ServiceHub Team</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Email sending error:", error)
    throw new ApiError(500, "Failed to send confirmation email")
  }
}

