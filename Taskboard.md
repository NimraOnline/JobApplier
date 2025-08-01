# Task Breadown

---
---

## 1. Fast API to Create Emails on the Fly ⛔BLOCKED⛔ requires: Domain to Process

---

### **1. Zoho Mail Setup**

#### **1.1. Sign Up for Zoho Mail (Free Tier)**

1. Go to the [Zoho Mail Sign-up page](https://www.zoho.com/mail/) and select **"Zoho Mail Free Plan"** or **"Mail Lite"**.

   * The **free plan** allows you to use **your own custom domain** and have up to **5 users**.
2. **Create your Zoho account**:

   * If you don't already have a Zoho account, create one by providing your details (name, email, password, etc.).
3. **Choose your custom domain**:

   * If you already own a domain (e.g., `yourdomain.com`), enter it. You will use this domain to create custom email addresses.

#### **1.2. Verify Your Domain**

To use your own custom domain with Zoho Mail, you'll need to **verify** ownership of the domain:

1. **Access DNS settings**: Log in to your domain registrar’s portal (e.g., GoDaddy, Namecheap) and locate the **DNS management** page.

2. **Add Zoho's verification TXT record**:

   * Zoho will provide a **TXT record** that you need to add to your domain’s DNS settings. This proves to Zoho that you own the domain.
   * It may take up to **24 hours** for the DNS record to propagate.

3. **Verify the domain in Zoho**:

   * After adding the TXT record, go back to your Zoho admin console and click **"Verify"** to confirm that your domain is now linked to your Zoho account.

---

### **2. Obtain Zoho API Credentials**

To interact with Zoho Mail programmatically, you need to obtain **OAuth 2.0 credentials**:

#### **2.1. Create a Zoho API Client**

1. Go to the [Zoho API Console](https://api-console.zoho.com/).
2. Create a new **OAuth client**:

   * Click **"Add Client"** and select **"Web-based"** for client type.
   * Enter your **redirect URI** (for now, you can use `http://localhost:5000` for local testing).
   * Save the **Client ID** and **Client Secret**—you’ll use these for authentication.

#### **2.2. Obtain OAuth Access Token**

1. **Generate Authorization URL**: Redirect the user to Zoho’s OAuth authorization URL to get the authorization code:

   ```plaintext
   https://accounts.zoho.com/oauth/v2/auth?scope=ZohoMail.fullaccess&client_id=YOUR_CLIENT_ID&response_type=code&access_type=offline&redirect_uri=YOUR_REDIRECT_URI
   ```

   * Replace `YOUR_CLIENT_ID` and `YOUR_REDIRECT_URI` with the values from your API client setup.

2. **Exchange Authorization Code for Token**: Once the user authorizes, they’ll receive an **authorization code**. Use this code to exchange for an **access token** by sending a `POST` request:

   ```bash
   curl -X POST https://accounts.zoho.com/oauth/v2/token \
   -d client_id=YOUR_CLIENT_ID \
   -d client_secret=YOUR_CLIENT_SECRET \
   -d grant_type=authorization_code \
   -d redirect_uri=YOUR_REDIRECT_URI \
   -d code=AUTHORIZATION_CODE
   ```

   * This will return an **access token** that you will use to authenticate API requests.

---

### **3. Set Up Flask API to Manage Emails**

Now, let's set up a simple **Flask API** that will interact with Zoho's API to **create**, **update**, and **delete** emails.

#### **3.1. Install Required Python Libraries**

1. Install Flask and `requests` using pip:

   ```bash
   pip install Flask requests
   ```

#### **3.2. Implement the API (app.py)**

Create a new Python file (`app.py`) with the following code:

```python
from flask import Flask, request, jsonify
import random
import string
import requests

app = Flask(__name__)

# Zoho API credentials
ZOHO_ACCESS_TOKEN = 'YOUR_ZOHO_ACCESS_TOKEN'  # Replace with your Zoho OAuth Access Token
DOMAIN = 'yourdomain.com'  # Replace with your domain name

def generate_password(length=12):
    """Generate a random password."""
    characters = string.ascii_letters + string.digits + string.punctuation
    return ''.join(random.choice(characters) for i in range(length))

def create_zoho_user(email, password):
    """Create a user on Zoho Mail."""
    url = 'https://mail.zoho.com/api/accounts/adduser'
    headers = {
        'Authorization': f'Zoho-oauthtoken {ZOHO_ACCESS_TOKEN}',
    }
    payload = {
        'email': email,
        'password': password,
        'firstName': email.split('@')[0],  # Just use the part before '@' as first name
        'lastName': 'User',  # You can customize this if needed
    }
    response = requests.post(url, headers=headers, data=payload)
    return response.json()

def delete_zoho_user(email):
    """Delete a user on Zoho Mail."""
    url = 'https://mail.zoho.com/api/accounts/removeuser'
    headers = {
        'Authorization': f'Zoho-oauthtoken {ZOHO_ACCESS_TOKEN}',
    }
    payload = {
        'email': email
    }
    response = requests.delete(url, headers=headers, data=payload)
    return response.json()

@app.route('/create_email', methods=['POST'])
def create_email():
    data = request.json
    username = data.get('username')

    if not username:
        return jsonify({'error': 'Username is required'}), 400

    email = f'{username}@{DOMAIN}'
    password = generate_password()

    # Create user on Zoho
    result = create_zoho_user(email, password)

    if result.get('status') == 'success':
        return jsonify({
            'email': email,
            'password': password
        })
    else:
        return jsonify({'error': result.get('message', 'Failed to create user')}), 500

@app.route('/delete_email', methods=['POST'])
def delete_email():
    data = request.json
    email = data.get('email')

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    # Delete user on Zoho
    result = delete_zoho_user(email)

    if result.get('status') == 'success':
        return jsonify({'message': f'Email {email} deleted successfully'})
    else:
        return jsonify({'error': result.get('message', 'Failed to delete user')}), 500

if __name__ == '__main__':
    app.run(debug=True)
```

---

### **4. API Endpoints**

* **POST `/create_email`**: Create a new email address on Zoho.

  * Input: `{ "username": "desiredUsername" }`
  * Output: `{ "email": "desiredUsername@yourdomain.com", "password": "randomlyGeneratedPassword" }`

* **POST `/delete_email`**: Delete an existing email address on Zoho.

  * Input: `{ "email": "emailToDelete@yourdomain.com" }`
  * Output: `{ "message": "Email emailToDelete@yourdomain.com deleted successfully" }`

---

### **5. Test the API**

1. **Run Flask**: Start your Flask app by running the following:

   ```bash
   python app.py
   ```

2. **Create Email**: Use **Postman** or **curl** to test the `/create_email` endpoint:

   ```bash
   curl -X POST http://127.0.0.1:5000/create_email -H "Content-Type: application/json" -d '{"username": "testuser"}'
   ```

3. **Delete Email**: After performing tests, delete the email by calling the `/delete_email` endpoint:

   ```bash
   curl -X POST http://127.0.0.1:5000/delete_email -H "Content-Type: application/json" -d '{"email": "testuser@yourdomain.com"}'
   ```

---

### **6. Domain Costs and Scaling**

* The **free Zoho Mail plan** allows for **up to 5 users**.
* After reaching 5 users, you can upgrade to the **Zoho Mail Pro plan** starting at **\$1/user/month** to add more users.

---

### **7. Security and Best Practices**

* **HTTPS**: Ensure that the API is served over HTTPS in production to protect user data.
* **OAuth Token**: Store your **Zoho OAuth Access Token** securely (e.g., using environment variables or a secret management tool).
* **Rate Limiting**: Implement rate limiting in your API to avoid hitting Zoho’s API limits.
* **Validation**: Add input validation and


error handling to ensure robustness.

---

This guide should give your developer everything they need to set up, test, and manage email creation, updates, and deletion via Zoho’s API. Let me know if anything needs further clarification! 😊

---
---

## 2. **FastAPI + Paddle Integration Guide**

For: *Job Applier App – Unlock & Schedule Offer Payment Flow*

---

### ⚙️ OVERVIEW

> Allow users to:
>
> 1. **Pay to unlock** a job offer
> 2. **Pay to unlock + schedule**
>
> After payment, the system should:
>
> * Mark user as **"PAID ✅"** in a Google Sheet
> * (Optional) Notify admin via email

---

## 🧩 STEP 1 — Set Up Paddle Account

1. Go to [https://vendors.paddle.com](https://vendors.paddle.com) and log in with the credentials (same info as Google Account but password begins with capitol A.

2. In your Paddle dashboard:

   * Go to **Developer Tools > Authentication**
   * Copy your:

     * `Vendor ID`
     * `API Key`
     * `Public Key` (for webhook validation)

3. Go to **Catalog > Products**, create two products:

   * One for "Unlock Only"
   * One for "Unlock + Schedule"

---

## 🧾 STEP 2 — Add Environment Variables

Create a `.env` file:

```env
PADDLE_VENDOR_ID=your_vendor_id
PADDLE_API_KEY=your_api_key
PADDLE_PUBLIC_KEY="-----BEGIN PUBLIC KEY----- ... -----END PUBLIC KEY-----"
PRICE_UNLOCK=price_id_for_unlock
PRICE_UNLOCK_SCHEDULE=price_id_for_unlock_schedule
DOMAIN=https://yourfrontend.com
GOOGLE_SHEET_ID=your_google_sheet_id
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password_or_app_password
```

---

## 🖥️ STEP 3 — Install Required Libraries

```bash
pip install fastapi uvicorn python-dotenv paddle-python google-api-python-client google-auth-httplib2 google-auth-oauthlib
```

---

## 🚀 STEP 4 — Create Payment Link Endpoint

```python
import os
from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
import paddle

load_dotenv()
app = FastAPI()

paddle.configure(vendor_id=os.getenv("PADDLE_VENDOR_ID"), api_key=os.getenv("PADDLE_API_KEY"))

@app.post("/create-payment-link/")
def create_payment_link(option: str, email: str):
    if option not in ["unlock", "unlock_schedule"]:
        raise HTTPException(status_code=400, detail="Invalid option")

    price_id = os.getenv("PRICE_UNLOCK") if option == "unlock" else os.getenv("PRICE_UNLOCK_SCHEDULE")

    result = paddle.PayLink.create({
        "customer_email": email,
        "prices": [price_id],
        "return_url": f"{os.getenv('DOMAIN')}/payment-success",
        "title": f"Job Offer - {option}",
        "webhook_url": f"{os.getenv('DOMAIN')}/paddle-webhook"
    })

    return {"url": result["url"]}
```

---

## 🔁 STEP 5 — Add Paddle Webhook

```python
from fastapi import Request
import paddle
import hashlib

@app.post("/paddle-webhook")
async def paddle_webhook(request: Request):
    data = await request.form()
    
    if data.get("alert_name") == "checkout_completed":
        email = data["email"]
        option = data["custom_data"]
        await mark_as_paid(email, option)
    
    return {"status": "ok"}
```

> Paddle will `POST` this when payment completes.

---

## ✅ STEP 6 — Update Google Sheet or Notify Admin

```python
from googleapiclient.discovery import build
from google.oauth2 import service_account

async def mark_as_paid(email, option):
    SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
    SERVICE_ACCOUNT_FILE = 'credentials.json'

    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    
    sheet_id = os.getenv("GOOGLE_SHEET_ID")
    service = build('sheets', 'v4', credentials=creds)
    sheet = service.spreadsheets()

    # Look for row with user's email
    result = sheet.values().get(spreadsheetId=sheet_id, range="Sheet1!A2:C").execute()
    rows = result.get('values', [])

    for i, row in enumerate(rows):
        if email in row:
            row_index = i + 2
            sheet.values().update(
                spreadsheetId=sheet_id,
                range=f"Sheet1!C{row_index}",
                valueInputOption="RAW",
                body={"values": [["PAID ✅"]]}
            ).execute()

            # Set green background
            service.spreadsheets().batchUpdate(
                spreadsheetId=sheet_id,
                body={
                    "requests": [{
                        "repeatCell": {
                            "range": {
                                "sheetId": 0,
                                "startRowIndex": row_index - 1,
                                "endRowIndex": row_index,
                                "startColumnIndex": 2,
                                "endColumnIndex": 3
                            },
                            "cell": {
                                "userEnteredFormat": {
                                    "backgroundColor": {
                                        "red": 0.0, "green": 1.0, "blue": 0.0
                                    }
                                }
                            },
                            "fields": "userEnteredFormat.backgroundColor"
                        }
                    }]
                }
            ).execute()
            break
```

---

## 📩 STEP 7 — (Optional) Email Notification

```python
import smtplib
from email.message import EmailMessage

def notify_admin(email):
    msg = EmailMessage()
    msg.set_content(f"New payment received from {email}")
    msg['Subject'] = "Job Offer Payment Confirmed"
    msg['From'] = os.getenv("EMAIL_USER")
    msg['To'] = "admin@yourcompany.com"

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(os.getenv("EMAIL_USER"), os.getenv("EMAIL_PASS"))
        smtp.send_message(msg)
```

---

## ✅ Workflow Recap

1. User clicks "Unlock" or "Unlock + Schedule"
2. Frontend calls: `POST /create-payment-link`
3. FastAPI returns Paddle-hosted link
4. User pays → Paddle sends `checkout_completed` to `/paddle-webhook`
5. Webhook:

   * Marks row as PAID ✅ in Google Sheet
   * (Optional) Notifies admin via email

---
---

## 3. Update Sheet to Reflect Employee Assignment Change
---
###Instructions: 
> Removing clients from employees should grey out the row on the employees sheet
>> This should be handled by app scripts.
> When _admin removes_ the assigned employee in the **dashboard sheet**, the previously assigned **employee’s sheet should turn the row grey**

** CHAT GPT GENERATED SCRIPT THAT MAY HELP BUT PROBABLY HAS ERRORS **


```javascript
const DASHBOARD_SHEET = "Dashboard";
const EMPLOYEE_COLUMN = 11; // Column K
const JOB_ID_COLUMN = 1; // Column A
const DIRECTORY_SHEET = "EmployeeDirectory";
const GREY = "#d3d3d3";

function onEdit(e) {
  const sheet = e.range.getSheet();
  if (sheet.getName() !== DASHBOARD_SHEET || e.range.getColumn() !== EMPLOYEE_COLUMN) return;

  const row = e.range.getRow();
  const jobId = sheet.getRange(row, JOB_ID_COLUMN).getValue();
  const newEmployee = e.range.getValue();
  const scriptProperties = PropertiesService.getScriptProperties();
  const key = `row-${row}`;
  const prevEmployee = scriptProperties.getProperty(key);

  // Store new employee value for future comparison
  scriptProperties.setProperty(key, newEmployee || "");

  // If previously assigned and now removed or changed
  if (prevEmployee && prevEmployee !== newEmployee) {
    const prevSheetName = getEmployeeSheetName(prevEmployee);
    if (prevSheetName) {
      greyOutRowInSheet(prevSheetName, jobId);
    }
  }
}

function getEmployeeSheetName(fullName) {
  const directorySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(DIRECTORY_SHEET);
  if (!directorySheet) return null;

  const data = directorySheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const name = data[i][0];
    const id = data[i][2];
    if (name && id && name.trim() === fullName.trim()) {
      const nameParts = name.split(" ");
      const formatted = `${nameParts[0]}_${nameParts[1]}_${id}`;
      return formatted;
    }
  }

  return null;
}

function greyOutRowInSheet(sheetName, jobId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(jobId).trim()) {
      const range = sheet.getRange(i + 1, 1, 1, sheet.getLastColumn());
      range.setBackground(GREY);
      break;
    }
  }
}
```

---
---
### 4.
