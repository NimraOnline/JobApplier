# Task Breadown

### 1. Fast API to Create Emails on the Fly

We are setting up an API that allows users to request a custom email address dynamically. The email address will be created on Zoho Mail using a custom domain (e.g., `username@yourdomain.com`). The API will return the newly created email address and a randomly generated password.

### **Prerequisites**

1. **Zoho Mail Account**: Set up a Zoho Mail account with a custom domain.
2. **Domain Setup**: The domain needs to be verified with Zoho (e.g., `yourdomain.com`).
3. **Zoho API Access**: You will need to create a Zoho API Client for OAuth 2.0 authentication and get the **API credentials** (Client ID, Client Secret).
4. **Python Environment**: The backend API will be built using Python and Flask.

---

### **Step 1: Zoho Mail Setup**

#### 1.1. Sign Up for Zoho Mail

* Go to [Zoho Mail Sign-up](https://www.zoho.com/mail/) and choose **"Zoho Mail Free Plan"** or **"Mail Lite"**.
* Set up your **custom domain** (e.g., `yourdomain.com`). You will need to verify your domain ownership by adding a **TXT record** to your domain’s DNS settings.

#### 1.2. API Access Setup

* Go to the [Zoho API Console](https://api-console.zoho.com/) and create a new **OAuth Client**.
* You will receive a **Client ID** and **Client Secret**. Keep these for authentication in the API.
* Obtain your **OAuth Access Token** using Zoho’s OAuth 2.0 process.

  * Follow Zoho's [OAuth 2.0 Flow](https://www.zoho.com/oauth/) to get the **access token**. This will be required to make API requests on behalf of your Zoho account.

---

### **Step 2: API Design and Implementation**

We will build an API using **Flask** in Python that will:

1. Accept a `POST` request with the desired **username**.
2. Create the email address using Zoho's API.
3. Return the created **email** and a **random password**.

#### 2.1. Install Required Libraries

Ensure that Python is installed on your system. Install the necessary libraries for Flask and making HTTP requests:

```bash
pip install Flask requests
```

#### 2.2. Flask API Setup

Create a new file named `app.py` and implement the following code:

```python
from flask import Flask, request, jsonify
import random
import string
import requests

app = Flask(__name__)

# Zoho API credentials
ZOHO_CLIENT_ID = 'YOUR_ZOHO_CLIENT_ID'  # Replace with your Zoho Client ID
ZOHO_CLIENT_SECRET = 'YOUR_ZOHO_CLIENT_SECRET'  # Replace with your Zoho Client Secret
ZOHO_ACCESS_TOKEN = 'YOUR_ZOHO_ACCESS_TOKEN'  # Replace with your Zoho OAuth Access Token

# Your Zoho domain (e.g., example.com)
DOMAIN = 'yourdomain.com'

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

if __name__ == '__main__':
    app.run(debug=True)
```

---

### **Step 3: API Explanation**

1. **OAuth Token**:

   * You will use the **Zoho OAuth Access Token** (`ZOHO_ACCESS_TOKEN`) for authentication.
   * To get the **Access Token**, follow Zoho’s [OAuth documentation](https://www.zoho.com/oauth/).

2. **Password Generation**:

   * The `generate_password()` function generates a random password using a combination of letters, digits, and punctuation.

3. **Zoho User Creation**:

   * The `create_zoho_user()` function makes a `POST` request to Zoho’s **adduser** API endpoint. It sends the user’s email, password, and other details.

4. **API Route**:

   * The `/create_email` route accepts **POST** requests with the **username** parameter (before the `@`).
   * It returns the newly created **email address** and **password** as a JSON response.

---

### **Step 4: Obtain Zoho OAuth Access Token**

To interact with Zoho’s API, you need to authenticate via **OAuth 2.0**.

1. **Generate Authorization URL**: Redirect users to Zoho’s authorization URL:

   ```plaintext
   https://accounts.zoho.com/oauth/v2/auth?scope=ZohoMail.fullaccess&client_id=YOUR_CLIENT_ID&response_type=code&access_type=offline&redirect_uri=YOUR_REDIRECT_URI
   ```

2. **Exchange Code for Token**:
   Once the user authorizes the app, you will receive an **authorization code**. Exchange this code for an **access token** via a `POST` request to Zoho’s token endpoint:

   ```bash
   curl -X POST https://accounts.zoho.com/oauth/v2/token \
   -d client_id=YOUR_CLIENT_ID \
   -d client_secret=YOUR_CLIENT_SECRET \
   -d grant_type=authorization_code \
   -d redirect_uri=YOUR_REDIRECT_URI \
   -d code=AUTHORIZATION_CODE
   ```

   This will return an **access token** you can use for API requests.

---

### **Step 5: Testing the API**

1. **Run the Flask App**:

   Run the following command in the directory where `app.py` is located:

   ```bash
   python app.py
   ```

2. **Send a POST Request** to create an email address:

   * You can use **Postman**, **curl**, or any HTTP client to send a **POST** request to your server.

   Example using **curl**:

   ```bash
   curl -X POST http://127.0.0.1:5000/create_email -H "Content-Type: application/json" -d '{"username": "newuser"}'
   ```

   **Response**:

   ```json
   {
       "email": "newuser@yourdomain.com",
       "password": "randomlyGeneratedPassword123"
   }
   ```

---

### **Step 6: Domain Cost Considerations**

* **Free Plan for Zoho Mail**:

  * Zoho's free plan allows **up to 5 users** with your custom domain (e.g., `yourdomain.com`).
  * For more users, you’ll need to upgrade to a paid plan (starts at **\$1/user/month**).

* **Domain Costs**:

  * Using **your own custom domain** will have associated costs (e.g., domain registration costs).
  * If you use a free subdomain from another provider (e.g., `example.mailgun.com`), it may save costs, but you won’t have full control over the branding.

---

### **Step 7: Security and Considerations**

* **HTTPS**: Ensure that the API is served over **HTTPS** to protect user data.
* **Authentication**: Implement **rate-limiting** and **authentication** for your API to prevent abuse.
* **Environment Variables**: Store your **Zoho API credentials** (Client ID, Client Secret, Access Token) in environment variables or a configuration file, and not directly in the code.

---

### **Conclusion**

Once the API is up and running, you’ll have a dynamic email creation system that allows you to generate custom email addresses on the fly, along with random passwords for each user.

Let me know if you need further help or clarifications to share with your developer!
