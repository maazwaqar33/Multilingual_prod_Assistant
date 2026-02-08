# Setup Instructions for Email Features

To enable "Forgot Password" and "Email Verification" features, please follow these steps:

1. Open `backend/.env` file.
2. Locate the `# Email Configuration` section.
3. Fill in your Gmail address for `SMTP_USER` and `SMTP_FROM`.
   Example:
   ```env
   SMTP_USER=my.email@gmail.com
   SMTP_FROM=my.email@gmail.com
   ```
4. Save the file.
5. Restart the backend (wait for `uvicorn` to reload).

Once configured, the "Forgot Password" button will send real emails using the App Password you provided (`sewr vyqr pfly rfef`).

**Note**: Without this configuration, the system will only simulate sending emails (printing to console).
