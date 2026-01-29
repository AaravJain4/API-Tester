# 🚀 API Tester Pro

A powerful, modern, and beautiful API testing tool built with React - similar to Postman but with a premium dark-themed interface.

![API Tester Pro](https://img.shields.io/badge/React-18.3-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.3-purple?logo=vite)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🎯 Core Functionality

- **HTTP Methods Support**: GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD
- **Request Configuration**:
  - URL input with environment variable support
  - Query parameters (key-value pairs with enable/disable toggles)
  - Custom headers
  - Request body (JSON, Form Data, Raw)
- **Response Display**:
  - Status code with color-coded badges
  - Response time tracking
  - Formatted JSON response body
  - Response headers viewer
  - Timestamp tracking

### 🎨 Enhanced Features

#### 1. **🔐 Authorization**

- **NEW:** Dedicated Authorization tab
- Bearer Token authentication
- Basic Auth (username/password)
- API Key authentication
- Environment variable support in all auth types
- Automatic header generation

#### 2. **⚡ Tests & Scripts**

- **NEW:** Pre-request scripts (JavaScript)
- **NEW:** Automated response testing
- Built-in test assertions (toBe, toEqual, toContain, toBeLessThan)
- Visual test results with pass/fail indicators
- Test execution context with response data

#### 3. **💻 Multi-Language Code Generation**

- **NEW:** 5 programming languages supported:
  - cURL (command-line)
  - JavaScript (Fetch API)
  - Python (Requests library)
  - Node.js (Axios)
  - PHP (cURL)
- Includes all headers, auth, params, and body
- Copy-ready code snippets
- Environment variables automatically replaced

#### 4. **📊 Extended Response Viewer**

- **NEW:** Pretty/Raw/Headers/Test Results tabs
- Response size display (bytes/KB/MB)
- Enhanced metadata (status, time, size, timestamp)
- Test results visualization
- Improved JSON formatting

#### 5. **Environment Variables**

- Define reusable variables with `{{variableName}}` syntax
- Use variables in URLs, headers, params, body, and auth
- Persistent storage in localStorage
- Easy management interface

#### 6. **Request History**

- Automatically saves last 50 requests
- View past requests with method, URL, status, and response time
- Click to reload any previous request
- Persistent storage across sessions
- Clear history option

#### 7. **Premium UI/UX**

- Modern dark theme with gradient accents
- Smooth animations and transitions
- Responsive design for all screen sizes
- Method-specific color coding
- Status code color indicators (2xx, 3xx, 4xx, 5xx)
- Loading states with animations
- Glassmorphism effects

#### 8. **Developer Experience**

- Keyboard shortcuts (Enter to send request)
- Monospace fonts for code/URLs
- Syntax highlighting for JSON
- Toggle-able parameters and headers
- Auto-formatting for JSON responses

## 🚀 Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+ (recommended)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory**:

```bash
cd CRUD
```

2. **Install dependencies**:

```bash
npm install
```

3. **Start the development server**:

```bash
npm run dev
```

4. **Open your browser**:
   Navigate to `http://localhost:5173`

## 📖 Usage Guide

### Making a Request

1. **Select HTTP Method**: Choose from the dropdown (GET, POST, PUT, etc.)
2. **Enter URL**: Type your API endpoint in the URL field
3. **Add Parameters** (Optional):
   - Click "Query Params" tab
   - Add key-value pairs
   - Toggle checkboxes to enable/disable specific params
4. **Add Headers** (Optional):
   - Click "Headers" tab
   - Add custom headers like Authorization, Content-Type, etc.
5. **Add Body** (For POST/PUT/PATCH):
   - Click "Body" tab
   - Select format: JSON, Form Data, or Raw
   - Enter your request payload
6. **Click Send**: Hit the "Send" button or press Enter

### Using Environment Variables

1. Click the **⚙️ icon** in the header
2. Add variable name and value pairs
3. Use in requests with `{{variableName}}` syntax
4. Example:
   - Variable: `baseUrl` = `https://api.example.com`
   - URL: `{{baseUrl}}/users`

### Viewing History

1. Click the **🕐 icon** in the header
2. Browse previous requests
3. Click any item to reload that request
4. Use "Clear All" to reset history

### Generating Code

1. Configure your request
2. Click the "Code" tab
3. Copy the generated cURL command
4. Use in terminal or scripts

## 🎨 Color Coding

### HTTP Methods

- **GET**: Green
- **POST**: Yellow
- **PUT**: Blue
- **PATCH**: Purple
- **DELETE**: Red
- **OPTIONS**: Cyan
- **HEAD**: Orange

### Status Codes

- **2xx (Success)**: Green
- **3xx (Redirect)**: Yellow
- **4xx (Client Error)**: Orange
- **5xx (Server Error)**: Red

## 🛠️ Technical Stack

- **Framework**: React 18.3
- **Build Tool**: Vite 7.3
- **Styling**: Vanilla CSS with CSS Variables
- **Fonts**:
  - Inter (UI)
  - Fira Code (Code/Monospace)
- **Storage**: localStorage for persistence
- **HTTP Client**: Fetch API

## 📁 Project Structure

```
CRUD/
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # Component-specific styles
│   ├── index.css        # Global design system
│   └── main.jsx         # Application entry point
├── index.html           # HTML template
├── package.json         # Dependencies
└── vite.config.js       # Vite configuration
```

## 🎯 Key Features Explained

### Request Configuration

The app supports comprehensive request configuration:

- **URL Builder**: Automatically constructs URLs with query parameters
- **Header Management**: Add/remove custom headers with toggle controls
- **Body Types**: Support for JSON, form-encoded, and raw data
- **Variable Substitution**: Replace `{{variables}}` throughout the request

### Response Handling

Smart response processing:

- **Content-Type Detection**: Automatically parses JSON responses
- **Performance Metrics**: Tracks and displays request duration
- **Error Handling**: Graceful error messages for failed requests
- **Header Inspection**: View all response headers

### Data Persistence

- **Request History**: Last 50 requests saved to localStorage
- **Environment Variables**: Persistent variable storage
- **Session Recovery**: Reload previous configurations

## 🚀 Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## 🎨 Customization

### Changing Colors

Edit CSS variables in `src/index.css`:

```css
:root {
  --primary-500: hsl(220, 75%, 55%);
  --bg-primary: hsl(220, 20%, 8%);
  /* ... more variables */
}
```

### Adding New Features

The component structure is modular and easy to extend:

- Add new tabs in the request section
- Extend the response viewer
- Add new code generation formats

## 🐛 Troubleshooting

### CORS Errors

If you encounter CORS errors:

- Use a CORS proxy for development
- Configure your API server to allow CORS
- Use browser extensions (for testing only)

### Node Version Warning

If you see Node.js version warnings:

- The app will still work with Node 20.16+
- For best compatibility, upgrade to Node 20.19+ or 22.12+

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Inspired by Postman and Insomnia
- Built with modern web technologies
- Designed for developers, by developers

## 🔮 Future Enhancements

Completed features:

- [x] ~~Authentication helpers (OAuth, JWT)~~ ✅ **DONE** - Bearer, Basic, API Key auth
- [x] ~~Add new tabs in the request section~~ ✅ **DONE** - Authorization, Tests tabs
- [x] ~~Extend the response viewer~~ ✅ **DONE** - Pretty/Raw/Headers/Tests tabs
- [x] ~~Add new code generation formats~~ ✅ **DONE** - 5 languages supported

Potential future features:

- [ ] Collections/Folders for organizing requests
- [ ] OAuth 2.0 flow automation
- [ ] Request/Response interceptors
- [ ] GraphQL support
- [ ] WebSocket testing
- [ ] Import/Export collections
- [ ] Themes (light mode)
- [ ] Collaborative features
- [ ] Mock server
- [ ] API documentation generator

---

**Made with ❤️ using React and Vite**
