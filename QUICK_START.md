# 📚 Quick Start Guide - API Tester Pro

Welcome to **API Tester Pro**! This guide will help you get started with testing APIs in minutes.

## 🎯 Your First API Request

### Step 1: Open the Application

The app is running at: **http://localhost:5173**

### Step 2: Make a Simple GET Request

1. The method dropdown should already be set to **GET**
2. In the URL field, enter: `https://jsonplaceholder.typicode.com/users/1`
3. Click the **Send** button (or press Enter)
4. Watch the response appear below! 🎉

**What you'll see:**

- ✅ Green **200** status badge (success!)
- ⚡ Response time in milliseconds
- 📄 Formatted JSON response body

---

## 🔧 Adding Query Parameters

Query parameters are added to the URL after a `?` symbol.

### Example: Filter Posts by User

1. Set method to **GET**
2. Enter URL: `https://jsonplaceholder.typicode.com/posts`
3. Click the **Query Params** tab
4. Add a parameter:
   - Key: `userId`
   - Value: `1`
   - ✅ Make sure the checkbox is checked
5. Click **Send**

**Result:** You'll only see posts from user #1!

### Adding Multiple Parameters

Just click **+ Add Parameter** and add more key-value pairs. They'll be automatically combined with `&`.

---

## 📝 Making a POST Request

POST requests send data to the server.

### Example: Create a New Post

1. Change method to **POST**
2. Enter URL: `https://jsonplaceholder.typicode.com/posts`
3. Click the **Body** tab (it appears for POST/PUT/PATCH)
4. Make sure **JSON** is selected
5. Enter this JSON:
   ```json
   {
     "title": "My First Post",
     "body": "This is my post content!",
     "userId": 1
   }
   ```
6. Click **Send**

**Result:** The API will return your created post with an ID!

---

## 🔑 Adding Headers

Headers provide additional information with your request.

### Example: Add Authorization Header

1. Click the **Headers** tab
2. Add a header:
   - Key: `Authorization`
   - Value: `Bearer your-token-here`
   - ✅ Check the checkbox
3. Add another header:
   - Key: `Content-Type`
   - Value: `application/json`
4. Click **Send**

**Tip:** You can disable headers temporarily by unchecking them instead of deleting!

---

## 🌍 Using Environment Variables

Environment variables let you reuse values across requests.

### Setting Up Variables

1. Click the **⚙️ icon** in the top-right corner
2. Add a variable:
   - Variable name: `api`
   - Value: `https://jsonplaceholder.typicode.com`
3. Add another:
   - Variable name: `userId`
   - Value: `1`
4. Click **Close**

### Using Variables in Requests

Now you can use these variables anywhere with `{{variableName}}`:

**In URL:**

```
{{api}}/users/{{userId}}
```

This becomes: `https://jsonplaceholder.typicode.com/users/1`

**In Headers:**

```
Authorization: Bearer {{apiToken}}
```

**In Body:**

```json
{
  "userId": {{userId}},
  "title": "Post from {{username}}"
}
```

**Benefits:**

- ✅ Change the API URL once, update everywhere
- ✅ Switch between development/production easily
- ✅ Keep sensitive tokens in one place

---

## 📜 Viewing Request History

Every request you make is automatically saved!

### Accessing History

1. Click the **🕐 icon** in the top-right corner
2. You'll see all your recent requests with:
   - HTTP method (color-coded)
   - Full URL
   - Status code
   - Response time
   - Timestamp

### Reusing Past Requests

- Click any history item to reload that request
- Modify it as needed and send again
- Use **Clear All** to reset your history

---

## 💻 Generating Code

Need to use your request in code or terminal?

### Get cURL Command

1. Configure your request (URL, headers, body, etc.)
2. Click the **Code** tab
3. Copy the generated cURL command
4. Paste it in your terminal!

**Example Output:**

```bash
curl -X POST "https://jsonplaceholder.typicode.com/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token123" \
  -d '{"title":"My Post","body":"Content","userId":1}'
```

---

## 🎨 Understanding the Interface

### Color Coding

**HTTP Methods:**

- 🟢 **GET** - Green (retrieving data)
- 🟡 **POST** - Yellow (creating data)
- 🔵 **PUT** - Blue (updating completely)
- 🟣 **PATCH** - Purple (updating partially)
- 🔴 **DELETE** - Red (removing data)
- 🔷 **OPTIONS** - Cyan (checking capabilities)
- 🟠 **HEAD** - Orange (getting headers only)

**Status Codes:**

- 🟢 **2xx** - Success (200, 201, 204, etc.)
- 🟡 **3xx** - Redirect (301, 302, etc.)
- 🟠 **4xx** - Client Error (400, 401, 404, etc.)
- 🔴 **5xx** - Server Error (500, 502, 503, etc.)

---

## 🚀 Try These Sample Requests

### 1. Get Random User

```
Method: GET
URL: https://randomuser.me/api/
```

### 2. Get Cat Fact

```
Method: GET
URL: https://catfact.ninja/fact
```

### 3. Get Dog Image

```
Method: GET
URL: https://dog.ceo/api/breeds/image/random
```

### 4. Get Your IP Info

```
Method: GET
URL: https://ipapi.co/json/
```

### 5. GitHub User Info

```
Method: GET
URL: https://api.github.com/users/octocat
Headers:
  - Accept: application/vnd.github.v3+json
```

---

## 💡 Pro Tips

### Keyboard Shortcuts

- **Enter** in URL field → Send request immediately
- **Tab** → Navigate between fields quickly

### Best Practices

1. **Use Environment Variables** for:
   - Base URLs
   - API keys/tokens
   - Common values used across requests

2. **Name Your Variables Clearly**:
   - ✅ `apiBaseUrl` instead of `url`
   - ✅ `authToken` instead of `token`

3. **Toggle Instead of Delete**:
   - Use checkboxes to disable params/headers
   - Keep them for later use

4. **Check the Code Tab**:
   - Verify what's actually being sent
   - Learn cURL syntax
   - Debug issues

5. **Use Request History**:
   - Compare different request variations
   - Track what worked
   - Avoid retyping URLs

---

## 🔍 Troubleshooting

### "Failed to fetch" Error

**Cause:** CORS (Cross-Origin Resource Sharing) restriction

**Solutions:**

1. The API doesn't allow requests from browsers
2. Use a CORS proxy for testing (e.g., `https://cors-anywhere.herokuapp.com/`)
3. Add CORS headers on your API server
4. Use browser extensions (for development only)

### Request Takes Too Long

**Check:**

1. Is the API server running?
2. Is your internet connection stable?
3. Is the URL correct?

### Response is Empty

**Check:**

1. Does the API return data for this endpoint?
2. Are you using the correct HTTP method?
3. Check the status code - 204 means "No Content" (which is normal)

### Variables Not Working

**Check:**

1. Are they defined in Environment Variables (⚙️ icon)?
2. Is the syntax correct? Use `{{variableName}}`
3. Are there any typos in the variable name?

---

## 🎓 Learning Resources

### Understanding HTTP Methods

- **GET**: Retrieve data (like reading a book)
- **POST**: Create new data (like writing a new book)
- **PUT**: Replace data completely (like rewriting a book)
- **PATCH**: Update data partially (like editing a chapter)
- **DELETE**: Remove data (like throwing away a book)

### Common Headers

- **Content-Type**: Format of the data you're sending
  - `application/json` - JSON data
  - `application/x-www-form-urlencoded` - Form data
  - `text/plain` - Plain text
- **Authorization**: Credentials to access protected resources
  - `Bearer <token>` - JWT tokens
  - `Basic <credentials>` - Username/password
- **Accept**: Format you want to receive
  - `application/json` - Want JSON back
  - `text/html` - Want HTML back

### HTTP Status Codes

- **200 OK**: Success!
- **201 Created**: Successfully created
- **204 No Content**: Success, but no data to return
- **400 Bad Request**: Your request has errors
- **401 Unauthorized**: Need to authenticate
- **403 Forbidden**: Authenticated but not allowed
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server had a problem

---

## 🎉 You're Ready!

You now know how to:

- ✅ Make GET, POST, PUT, PATCH, DELETE requests
- ✅ Add query parameters and headers
- ✅ Send JSON data in request body
- ✅ Use environment variables
- ✅ View and reuse request history
- ✅ Generate cURL commands

**Start testing your APIs and happy coding! 🚀**

---

## 📞 Need Help?

Check out:

- `README.md` - Full documentation
- `FEATURES.md` - Complete feature list
- `sample-collection.json` - Pre-made requests to try

**Enjoy API Tester Pro!** 💜
