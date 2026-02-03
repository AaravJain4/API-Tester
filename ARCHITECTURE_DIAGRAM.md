# 🏗️ Architecture Diagram

## Component Hierarchy

```
App.jsx (Main Container)
├── Header
│   ├── Logo
│   └── Actions (Env, History buttons)
│
├── App Layout
│   ├── Sidebar (Collections Tree)
│   │   ├── Collections List
│   │   │   ├── Collection Item
│   │   │   │   ├── Folders
│   │   │   │   │   └── Requests
│   │   │   │   └── Root Requests
│   │   │   └── ...
│   │   ├── New Collection Modal
│   │   ├── New Folder Modal
│   │   └── Context Menu
│   │
│   └── Main Content
│       ├── Environment Panel (conditional)
│       ├── History Panel (conditional)
│       │
│       ├── Request Section
│       │   ├── Request Header Bar
│       │   │   ├── Toggle Sidebar Button
│       │   │   ├── Request Title
│       │   │   └── Save Button
│       │   │
│       │   ├── Request URL Bar
│       │   │   ├── Method Select
│       │   │   ├── URL Input
│       │   │   └── Send Button
│       │   │
│       │   ├── Tabs Navigation
│       │   │
│       │   └── RequestTabs Component
│       │       ├── Params Tab
│       │       ├── Authorization Tab
│       │       ├── Headers Tab
│       │       ├── Body Tab
│       │       ├── Tests Tab
│       │       └── Code Tab
│       │
│       └── ResponseViewer Component
│           ├── Response Header (status, time, size)
│           ├── Response Tabs
│           └── Response Content
│               ├── Pretty View
│               ├── Raw View
│               ├── Headers View
│               └── Tests Results View
│
└── Save Request Modal (conditional)
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         App.jsx                              │
│                    (State Container)                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Uses Custom Hooks
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                      Custom Hooks Layer                       │
├──────────────────────────────────────────────────────────────┤
│  useRequest()      │  useAuth()       │  useCollections()    │
│  - method          │  - authType      │  - collections       │
│  - url             │  - bearerToken   │  - selectedCollection│
│  - params          │  - basicAuth     │  - selectedFolder    │
│  - headers         │  - apiKey        │  - selectedRequest   │
│  - body            │                  │  - CRUD operations   │
│  - formParams      │                  │                      │
├──────────────────────────────────────────────────────────────┤
│  useEnvironment()  │  useHistory()                           │
│  - envVars         │  - history                              │
│  - replaceEnvVars  │  - addToHistory                         │
│                    │  - clearHistory                         │
└──────────────────────────────────────────────────────────────┘
                              │
                              │ Calls Services
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                      Services Layer                           │
├──────────────────────────────────────────────────────────────┤
│  apiService.js                                                │
│  - sendApiRequest()                                           │
│  - runTests()                                                 │
└──────────────────────────────────────────────────────────────┘
                              │
                              │ Uses Utilities
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                      Utilities Layer                          │
├──────────────────────────────────────────────────────────────┤
│  helpers.js        │  codeGenerator.js  │  constants.js      │
│  - buildUrl()      │  - generateCode()  │  - HTTP_METHODS    │
│  - formatJSON()    │                    │  - AUTH_TYPES      │
│  - formatBytes()   │                    │  - BODY_TYPES      │
│  - getStatusClass()│                    │                    │
│  - downloadJSON()  │                    │                    │
│  - uploadJSON()    │                    │                    │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Interaction
      │
      ▼
Component Event Handler
      │
      ▼
Custom Hook Method
      │
      ▼
Update State
      │
      ├─────────────────┐
      │                 │
      ▼                 ▼
Service Call    localStorage
(if needed)      (persist)
      │
      ▼
API Request
      │
      ▼
Response
      │
      ▼
Update State
      │
      ▼
Re-render Components
```

## Collections Data Structure

```javascript
{
  collections: [
    {
      id: "1643234567890",
      name: "My API Project",
      createdAt: "2024-01-30T00:00:00.000Z",
      folders: [
        {
          id: "1643234567891",
          name: "User Endpoints",
          createdAt: "2024-01-30T00:00:00.000Z",
          requests: [
            {
              id: "1643234567892",
              name: "Get User Profile",
              method: "GET",
              url: "{{API_URL}}/users/me",
              params: [...],
              headers: [...],
              body: "",
              bodyType: "json",
              formParams: [...],
              authType: "bearer",
              bearerToken: "{{TOKEN}}",
              preRequestScript: "",
              testScript: "expect(response.status).toBe(200);",
              createdAt: "2024-01-30T00:00:00.000Z",
              updatedAt: "2024-01-30T00:00:00.000Z"
            }
          ]
        }
      ],
      requests: [
        // Root-level requests (not in folders)
      ]
    }
  ]
}
```

## File Dependencies

```
App.jsx
├── components/
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   │   └── utils/helpers.js (downloadJSON, uploadJSON)
│   ├── RequestTabs.jsx
│   └── ResponseViewer.jsx
│       └── utils/helpers.js (formatJSON, formatBytes, getStatusClass)
│
├── hooks/
│   ├── useRequest.js
│   ├── useAuth.js
│   ├── useCollections.js
│   ├── useEnvironment.js
│   └── useHistory.js
│
├── services/
│   └── apiService.js
│
└── utils/
    ├── constants.js
    ├── helpers.js
    └── codeGenerator.js
```

## Request Lifecycle

```
1. User configures request
   ├── Select method
   ├── Enter URL
   ├── Add params/headers/body
   └── Configure auth

2. User clicks "Send"
   │
   ├── Pre-request script runs
   │
   ├── Environment variables replaced
   │
   ├── URL built with params
   │
   ├── Auth headers added
   │
   └── Request sent via apiService

3. Response received
   │
   ├── Response data parsed
   │
   ├── Tests executed
   │
   ├── Results displayed
   │
   └── Added to history

4. User saves request (optional)
   │
   ├── Request data collected
   │
   ├── Saved to collection/folder
   │
   └── Persisted to localStorage
```

## Module Responsibilities

```
┌─────────────────────────────────────────────────────────┐
│ App.jsx                                                  │
│ - Orchestrates all hooks                                │
│ - Manages UI state (tabs, modals, etc.)                 │
│ - Handles user actions                                  │
│ - Passes data to components                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Custom Hooks                                             │
│ - Encapsulate specific domain logic                     │
│ - Manage related state                                  │
│ - Provide methods for state manipulation                │
│ - Handle localStorage persistence                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Components                                               │
│ - Pure presentational components                        │
│ - Receive data via props                                │
│ - Emit events via callbacks                             │
│ - No direct state management                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Services                                                 │
│ - Business logic                                         │
│ - API communication                                      │
│ - Data transformation                                    │
│ - No UI concerns                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Utils                                                    │
│ - Pure functions                                         │
│ - No side effects                                        │
│ - Reusable across app                                   │
│ - Helper functions                                       │
└─────────────────────────────────────────────────────────┘
```

## Benefits of This Architecture

✅ **Separation of Concerns**: Each module has a clear, single responsibility
✅ **Reusability**: Hooks and components can be reused
✅ **Testability**: Each layer can be tested independently
✅ **Maintainability**: Easy to locate and fix issues
✅ **Scalability**: Easy to add new features
✅ **Type Safety**: Structure supports TypeScript migration
✅ **Performance**: Optimized re-renders with proper state management

---

This architecture follows React best practices and industry standards for production applications.
