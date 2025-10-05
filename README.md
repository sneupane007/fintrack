## FinTrack - Personal Finance Management Application

FinTrack is a comprehensive financial management application that helps users track income and expenses, manage budget limits, visualize spending patterns, and generate detailed financial reports.


### Features

1. Financial Transaction Management
2. Budget Management
3. Financial Dashboard
4. Visual Analytics
5. Notifications System
6. PDF Report Generation
7. User Authentication(firebase)

### Configure Firebase:

   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication with Google provider
   - Create Firestore database
   - Update Firebase configuration in `src/config/firebase.js`
```
fintrack/
├── public/             # Public assets
├── src/                # Source files
│   ├── components/     # React components
│   │   ├── auth/       # Authentication components
│   │   ├── create/     # Transaction creation forms
│   │   ├── dashboard/  # Dashboard components
│   │   ├── navigation/ # Navigation components
│   │   ├── read/       # Transaction display components
│   │   ├── reports/    # Financial reports components
│   │   ├── settings/   # Settings components
│   │   └── visualization/ # Chart and visualization components
│   ├── context/        # React context providers
│   ├── utils/          # Utility functions
│   ├── config/         # Configuration files
│   └── App.js          # Main App component
└── README.md           # This file
```
