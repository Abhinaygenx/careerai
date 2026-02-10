import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Email configuration - uses environment variables for security
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use App Password for Gmail
    },
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, data } = body;

        // Validate request
        if (!type || !data) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        let emailContent: { subject: string; html: string };

        if (type === 'contact') {
            // Contact form submission
            const { name, email, subject, message } = data;

            if (!name || !email || !message) {
                return NextResponse.json(
                    { error: 'Missing required contact fields' },
                    { status: 400 }
                );
            }

            const subjectLabels: Record<string, string> = {
                general: 'General Inquiry',
                support: 'Technical Support',
                billing: 'Billing Question',
                partnership: 'Partnership Opportunity',
                feedback: 'Product Feedback',
            };

            emailContent = {
                subject: `[Career.AI Contact] ${subjectLabels[subject] || 'New Message'} from ${name}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 20px; border-radius: 10px 10px 0 0;">
                            <h1 style="color: white; margin: 0; font-size: 24px;">📧 New Contact Message</h1>
                        </div>
                        <div style="background: #1a1a2e; padding: 30px; border-radius: 0 0 10px 10px; color: #e4e4e7;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #a1a1aa;">Name:</td>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #333; color: white; font-weight: bold;">${name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #a1a1aa;">Email:</td>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #333;">
                                        <a href="mailto:${email}" style="color: #8b5cf6;">${email}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #a1a1aa;">Subject:</td>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #333; color: white;">${subjectLabels[subject] || subject}</td>
                                </tr>
                            </table>
                            <div style="margin-top: 20px;">
                                <h3 style="color: #a1a1aa; margin-bottom: 10px;">Message:</h3>
                                <div style="background: #0a0a0f; padding: 20px; border-radius: 8px; border-left: 4px solid #8b5cf6;">
                                    <p style="color: white; margin: 0; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                                </div>
                            </div>
                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; text-align: center;">
                                <p style="color: #71717a; font-size: 12px; margin: 0;">
                                    Sent from Career.AI Contact Page<br>
                                    ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                                </p>
                            </div>
                        </div>
                    </div>
                `,
            };
        } else if (type === 'suggestion') {
            // Suggestion form submission
            const { category, suggestion, priority } = data;

            if (!suggestion) {
                return NextResponse.json(
                    { error: 'Missing suggestion content' },
                    { status: 400 }
                );
            }

            const categoryLabels: Record<string, string> = {
                feature: 'New Feature Request',
                improvement: 'Improve Existing Feature',
                ui: 'User Interface / Design',
                performance: 'Performance / Speed',
                content: 'Content / Resources',
                other: 'Other',
            };

            const priorityLabels: Record<string, { emoji: string; text: string; color: string }> = {
                low: { emoji: '😊', text: 'Nice to Have', color: '#22c55e' },
                medium: { emoji: '👍', text: 'Would Help', color: '#eab308' },
                high: { emoji: '🔥', text: 'Really Need This', color: '#ef4444' },
            };

            const priorityInfo = priorityLabels[priority] || priorityLabels.medium;

            emailContent = {
                subject: `[Career.AI Suggestion] ${priorityInfo.text} - ${categoryLabels[category] || category}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 20px; border-radius: 10px 10px 0 0;">
                            <h1 style="color: white; margin: 0; font-size: 24px;">💡 New Suggestion Received</h1>
                        </div>
                        <div style="background: #1a1a2e; padding: 30px; border-radius: 0 0 10px 10px; color: #e4e4e7;">
                            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                                <div style="flex: 1; background: #0a0a0f; padding: 15px; border-radius: 8px; text-align: center;">
                                    <p style="color: #a1a1aa; margin: 0 0 5px 0; font-size: 12px;">CATEGORY</p>
                                    <p style="color: #8b5cf6; margin: 0; font-weight: bold;">${categoryLabels[category] || category}</p>
                                </div>
                                <div style="flex: 1; background: #0a0a0f; padding: 15px; border-radius: 8px; text-align: center; border: 2px solid ${priorityInfo.color};">
                                    <p style="color: #a1a1aa; margin: 0 0 5px 0; font-size: 12px;">PRIORITY</p>
                                    <p style="color: ${priorityInfo.color}; margin: 0; font-weight: bold;">
                                        ${priorityInfo.emoji} ${priorityInfo.text}
                                    </p>
                                </div>
                            </div>
                            <div style="margin-top: 20px;">
                                <h3 style="color: #a1a1aa; margin-bottom: 10px;">Suggestion:</h3>
                                <div style="background: #0a0a0f; padding: 20px; border-radius: 8px; border-left: 4px solid #ec4899;">
                                    <p style="color: white; margin: 0; line-height: 1.6; white-space: pre-wrap;">${suggestion}</p>
                                </div>
                            </div>
                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; text-align: center;">
                                <p style="color: #71717a; font-size: 12px; margin: 0;">
                                    Sent from Career.AI Suggestion Form<br>
                                    ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                                </p>
                            </div>
                        </div>
                    </div>
                `,
            };
        } else {
            return NextResponse.json(
                { error: 'Invalid form type' },
                { status: 400 }
            );
        }

        // Send email
        await transporter.sendMail({
            from: `"Career.AI" <${process.env.EMAIL_USER}>`,
            to: 'abhinaykumar5432@gmail.com',
            ...emailContent,
        });

        return NextResponse.json(
            { success: true, message: 'Email sent successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Email sending failed:', error);
        return NextResponse.json(
            { error: 'Failed to send email. Please try again later.' },
            { status: 500 }
        );
    }
}
