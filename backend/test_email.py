
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_smtp():
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    # Also check APP_PASS if used as fallback in code, though I removed it from .env
    # The code in email_utils.py uses: smtp_pass = os.getenv("SMTP_PASS") or os.getenv("APP_PASS", "")
    
    smtp_from = os.getenv("SMTP_FROM", smtp_user)
    
    print(f"SMTP Config:")
    print(f"  Host: {smtp_host}")
    print(f"  Port: {smtp_port}")
    print(f"  User: {smtp_user}")
    print(f"  From: {smtp_from}")
    print(f"  Pass: {'*' * len(smtp_pass) if smtp_pass else 'None'}")
    
    if not smtp_user or not smtp_pass:
        print("ERROR: SMTP_USER or SMTP_PASS not set.")
        return

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Test Email from TodoEvolve Debugger"
        msg["From"] = smtp_from
        msg["To"] = smtp_user  # Send to self
        
        html = "<h1>It works!</h1><p>This is a test email.</p>"
        msg.attach(MIMEText(html, "html"))
        
        print("Connecting to SMTP server...")
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.set_debuglevel(1)  # Enable debug output
            print("Starting TLS...")
            server.starttls()
            print("Logging in...")
            server.login(smtp_user, smtp_pass)
            print("Sending email...")
            server.sendmail(smtp_from, smtp_user, msg.as_string())
        
        print("SUCCESS: Email sent!")
    except Exception as e:
        print(f"FAILURE: {str(e)}")

if __name__ == "__main__":
    test_smtp()
