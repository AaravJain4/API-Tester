# API Tester Pro - Production Architecture

## 🏗️ Architecture Overview

This application has been refactored to follow production-grade best practices with a modular, scalable architecture.

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx
│   ├── Header.css
│   ├── Sidebar.jsx      # Collections/Folders tree view
│   ├── Sidebar.css
│   ├── RequestTabs.jsx  # Request configuration tabs
│   ├── RequestTabs.css
│   ├── ResponseViewer.jsx
│   └── ResponseViewer.css
├── hooks/               # Custom React hooks for state management
│   ├── useRequest.js    # Request state (method, URL, params, headers, body)
│   ├── useAuth.js       # Authentication state (bearer, basic, API key)
│   ├── useCollections.js # Collections & folders management
│   ├── useEnvironment.js # Environment variables
│   └── useHistory.js    # Request history
├── services/            # Business logic & API calls
│   └── apiService.js    # HTTP request handling & test execution
├── utils/               # Utility functions
│   ├── constants.js     # App constants
│   ├── helpers.js       # Helper functions (formatting, file ops)
│   └── codeGenerator.js # Code generation for multiple languages
├── App.jsx              # Main application component
├── App.css              # Main application styles
├── index.css            # Global styles & CSS variables
└── main.jsx             # Application entry point
```

## 🎯 Key Features

### 1. **Collections & Folders** 📁
- Organize requests into collections
- Create folders within collections for better organization
- Save, update, and delete requests
- Import/export collections as JSON
- Duplicate requests
- Context menu for quick actions

### 2. **Custom Hooks Architecture** 🎣
Each hook manages a specific domain of state:

- **useRequest**: Manages request configuration
  - HTTP method, URL, query params
  - Headers, body (JSON/Form/Raw)
  - Form data with file uploads
  
- **useAuth**: Handles authentication
  - Bearer token
  - Basic authentication
  - API key authentication
  
- **useCollections**: Manages collections & folders
  - CRUD operations for collections
  - CRUD operations for folders
  - CRUD operations for saved requests
  - Import/export functionality
  
- **useEnvironment**: Environment variables
  - Variable management
  - Variable replacement in requests
  
- **useHistory**: Request history
  - Auto-save recent requests
  - Load from history

### 3. **Component-Based UI** 🧩
- **Header**: App branding and quick actions
- **Sidebar**: Collections tree view with drag-drop ready structure
- **RequestTabs**: Tabbed interface for request configuration
- **ResponseViewer**: Beautiful response display with tabs

### 4. **Service Layer** ⚙️
- **apiService**: Centralized HTTP request handling
  - Request execution
  - Test running
  - Error handling

### 5. **Code Generation** 💻
Generate code snippets in multiple languages:
- cURL
- JavaScript (Fetch)
- Node.js (Axios)
- Python (Requests)
- PHP (cURL)

## 📦 Data Persistence

All data is persisted in localStorage:
- `apiCollections`: Collections, folders, and saved requests
- `envVars`: Environment variables
- `apiHistory`: Request history (last 50 requests)

## 🎨 Design Patterns

### 1. **Custom Hooks Pattern**
Separates state logic from UI components for better reusability and testing.

### 2. **Container/Presentational Pattern**
- `App.jsx` acts as a container managing state
- Components are presentational, receiving props

### 3. **Service Layer Pattern**
Business logic is separated into service modules.

### 4. **Utility Functions**
Common operations are extracted into utility functions.

## 🚀 Usage

### Creating a Collection
1. Click the "+" button in the sidebar
2. Enter a collection name
3. Start adding requests or folders

### Saving a Request
1. Configure your request (URL, method, headers, etc.)
2. Click the "Save" button
3. Select or create a collection
4. Name your request

### Using Environment Variables
1. Click the settings icon in the header
2. Add variables with key-value pairs
3. Use `{{variableName}}` syntax in requests

### Organizing with Folders
1. Right-click on a collection
2. Select "Add Folder"
3. Drag requests into folders (UI ready for this feature)

## 🔧 Extending the Application

### Adding a New Hook
```javascript
// src/hooks/useMyFeature.js
import { useState } from 'react';

export const useMyFeature = () => {
  const [state, setState] = useState(initialState);
  
  // Add your logic here
  
  return {
    state,
    // ... methods
  };
};
```

### Adding a New Component
```javascript
// src/components/MyComponent.jsx
import './MyComponent.css';

const MyComponent = ({ prop1, prop2 }) => {
  return (
    <div className="my-component">
      {/* Your JSX */}
    </div>
  );
};

export default MyComponent;
```

### Adding a New Service
```javascript
// src/services/myService.js
export const myServiceFunction = async (params) => {
  // Your business logic
  return result;
};
```

## 🎯 Best Practices Implemented

1. **Single Responsibility**: Each module has one clear purpose
2. **DRY (Don't Repeat Yourself)**: Common logic extracted into hooks/utils
3. **Separation of Concerns**: UI, state, and business logic are separated
4. **Modularity**: Easy to add/remove features
5. **Maintainability**: Clear structure makes code easy to understand
6. **Scalability**: Architecture supports growth

## 🔄 State Management Flow

```
User Action → Component → Custom Hook → Service (if needed) → Update State → Re-render
```

## 📝 Future Enhancements

- [ ] Drag-and-drop for reordering requests/folders
- [ ] Workspaces for multiple environments
- [ ] Request chaining
- [ ] GraphQL support
- [ ] WebSocket testing
- [ ] Team collaboration features
- [ ] Cloud sync
- [ ] Request templates
- [ ] Mock server
- [ ] API documentation generation

## 🤝 Contributing

When adding new features:
1. Create appropriate hooks for state management
2. Build reusable components
3. Add services for business logic
4. Update this documentation
5. Follow the existing code style

## 📚 Learn More

- [React Hooks Documentation](https://react.dev/reference/react)
- [Component Patterns](https://www.patterns.dev/posts/react-component-patterns)
- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)

---

Built with ❤️ using React + Vite
