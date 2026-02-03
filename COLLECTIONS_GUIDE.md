# 🚀 Quick Start Guide - Collections & Folders

## Getting Started

Your API Tester now has a powerful **Collections & Folders** system for organizing requests!

## 📁 Collections Workflow

### Step 1: Create Your First Collection

1. Look at the **sidebar** on the left
2. Click the **"+"** button at the top
3. Enter a name like "My Project API"
4. Click **Create**

### Step 2: Add a Folder (Optional)

1. Click the small **"+"** icon next to your collection name
2. Enter a folder name like "User Endpoints"
3. Click **Create**

### Step 3: Configure a Request

1. Select HTTP method (GET, POST, etc.)
2. Enter the URL
3. Add query params, headers, body as needed
4. Configure authentication if required

### Step 4: Save the Request

1. Click the **"Save"** button in the top bar
2. Enter a descriptive name like "Get User Profile"
3. Make sure your collection is selected in the sidebar
4. Click **Save**

### Step 5: Load a Saved Request

1. Navigate the sidebar tree
2. Click on any saved request
3. All settings load automatically!

## 🎯 Pro Tips

### Organizing Requests

```
📁 My Project API
  ├── 📂 Authentication
  │   ├── 🔵 POST Login
  │   ├── 🔵 POST Register
  │   └── 🔵 POST Refresh Token
  ├── 📂 Users
  │   ├── 🟢 GET List Users
  │   ├── 🟢 GET User by ID
  │   ├── 🟡 PUT Update User
  │   └── 🔴 DELETE User
  └── 🟢 GET Health Check
```

### Context Menu Actions

**Right-click** on items for quick actions:
- **Collection**: Export, Delete
- **Folder**: Delete
- **Request**: Duplicate, Delete

### Import/Export

**Export a Collection:**
1. Right-click on a collection
2. Select "Export"
3. Save the JSON file

**Import a Collection:**
1. Click the import icon (↓) in sidebar header
2. Select a JSON file
3. Collection is added instantly!

## 🔧 Environment Variables

Use variables across all requests:

1. Click the **⚙️** icon in the header
2. Add variables:
   ```
   Key: API_URL
   Value: https://api.example.com
   
   Key: AUTH_TOKEN
   Value: your-token-here
   ```
3. Use in requests: `{{API_URL}}/users`

## 📝 Example Workflow

### Building a Complete API Collection

1. **Create Collection**: "E-commerce API"

2. **Add Folders**:
   - Products
   - Orders
   - Customers
   - Auth

3. **Save Requests**:
   ```
   Auth/
     - POST Login
     - POST Logout
   
   Products/
     - GET All Products
     - GET Product by ID
     - POST Create Product
     - PUT Update Product
     - DELETE Product
   
   Orders/
     - GET My Orders
     - POST Create Order
     - GET Order Status
   ```

4. **Use Environment Variables**:
   ```
   {{BASE_URL}}/products
   {{BASE_URL}}/orders
   Authorization: Bearer {{TOKEN}}
   ```

5. **Add Tests**:
   ```javascript
   expect(response.status).toBe(200);
   expect(response.body.data).toContain('products');
   ```

## 🎨 UI Features

### Sidebar
- **Expandable tree view**: Click arrows to expand/collapse
- **Color-coded methods**: GET (green), POST (blue), PUT (yellow), DELETE (red)
- **Selected state**: Current request is highlighted
- **Toggle sidebar**: Click ☰ icon to hide/show

### Request Header Bar
- **Toggle sidebar button**: Show/hide collections
- **Request title**: Shows current request name
- **Save button**: Quick save with icon

### Tabs
- **Query Params**: URL parameters
- **🔐 Authorization**: Auth configuration
- **Headers**: Custom headers
- **Body**: Request payload (POST/PUT/PATCH)
- **⚡ Tests**: Pre-request scripts & tests
- **💻 Code**: Generate code snippets

## 💾 Data Persistence

Everything is automatically saved:
- ✅ Collections structure
- ✅ All saved requests
- ✅ Environment variables
- ✅ Request history

Data persists across browser sessions!

## 🔄 Keyboard Shortcuts

- **Enter** in URL field: Send request
- **Enter** in modals: Confirm action
- **Esc**: Close modals (coming soon)

## 🎯 Common Use Cases

### API Development
1. Create collection per microservice
2. Organize by resource type
3. Save common requests
4. Use environment variables for different environments

### API Testing
1. Create test collections
2. Add test scripts to requests
3. Run and verify responses
4. Export for team sharing

### API Documentation
1. Save example requests
2. Add descriptive names
3. Export collection as documentation
4. Share with team

## 🚨 Troubleshooting

**Request not saving?**
- Make sure a collection is selected
- Check that you've entered a request name

**Can't see sidebar?**
- Click the ☰ icon to toggle it

**Lost collections?**
- Check browser localStorage
- Collections are stored locally

## 📚 Next Steps

1. ✅ Create your first collection
2. ✅ Save some requests
3. ✅ Organize with folders
4. ✅ Set up environment variables
5. ✅ Add tests to requests
6. ✅ Export and share!

---

**Need help?** Check out `ARCHITECTURE.md` for technical details!

**Happy API Testing! 🎉**
