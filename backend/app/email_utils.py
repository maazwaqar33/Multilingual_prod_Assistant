import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def get_email_template(title, message, button_text, button_url):
    """
    Generate a minimalist, responsive HTML email template.
    Uses inline CSS for maximum compatibility.
    """
    return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 32px 32px 0 32px; text-align: center;">
                            <h1 style="margin: 0; color: #18181b; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">TodoEvolve</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 32px;">
                            <h2 style="margin: 0 0 16px 0; color: #27272a; font-size: 20px; font-weight: 600;">{title}</h2>
                            <p style="margin: 0 0 24px 0; color: #52525b; font-size: 16px; line-height: 1.6;">
                                {message}
                            </p>
                            
                            <!-- Button -->
                            <div style="text-align: center; margin: 32px 0;">
                                <a href="{button_url}" style="display: inline-block; padding: 14px 32px; background-color: #7c3aed; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 12px; transition: background-color 0.2s;">
                                    {button_text}
                                </a>
                            </div>
                            
                            <p style="margin: 0; color: #71717a; font-size: 14px; line-height: 1.5;">
                                If you didn't request this, you can safely ignore this email. The link will expire in 24 hours.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px; background-color: #fafafa; text-align: center; border-top: 1px solid #e4e4e7;">
                            <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                                &copy; 2026 TodoEvolve. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    """

from .config import get_settings

settings = get_settings()

def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """
    Send an HTML email using SMTP configuration from settings.
    """
    smtp_host = settings.smtp_host
    smtp_port = settings.smtp_port
    smtp_user = settings.smtp_user
    smtp_pass = settings.smtp_pass
    from_email = settings.smtp_from or smtp_user
    
    if not smtp_user or not smtp_pass:
        print(f"SMTP Error: Credentials missing (SMTP_USER/SMTP_PASS). Cannot send email to {to_email}")
        return False
        
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = from_email
        msg["To"] = to_email
        msg.attach(MIMEText(html_content, "html"))
        
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(from_email, to_email, msg.as_string())
        
        print(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"SMTP Send Error: {str(e)}")
        return False
