# FinTrack - Personal Finance Management Application

FinTrack is a comprehensive financial management application that helps users track income and expenses, manage budget limits, visualize spending patterns, and generate detailed financial reports.

![FinTrack Dashboard]()

## Features

### 1. Financial Transaction Management

- 📥 **Add Income**: Record income transactions with categories and dates
- 📤 **Add Expenses**: Track expenses with detailed categorization
- 🗂️ **Transaction History**: View and filter your complete transaction history
- 🧹 **CRUD Operations**: Full ability to create, read, update, and delete transactions

### 2. Budget Management

- 💰 **Category Limits**: Set spending limits for expense categories
- 🔔 **Limit Notifications**: Get alerted when you exceed category budget limits
- 📊 **Progress Tracking**: See visual progress bars showing how close you are to limits

### 3. Financial Dashboard

- 📈 **Financial Overview**: View your financial status at a glance
- 📅 **Time-based Filtering**: Filter transactions by this month, last month, last 3 months, or all time
- 💹 **Category Analysis**: See breakdowns of income and expenses by category

### 4. Visual Analytics

- 📊 **Category Visualization**: Bar charts showing income and expense categories
- 🥧 **Pie Charts**: Visual breakdown of your spending patterns
- 📉 **Trend Analysis**: Compare current month with previous months

### 5. Notifications System

- 🚨 **Budget Alerts**: Get notified when you exceed category spending limits
- 🔔 **Notification Center**: View all alerts in a central location
- 🆕 **Welcome Notifications**: New users receive helpful onboarding guidance

### 6. PDF Report Generation

- 📑 **Financial Reports**: Generate comprehensive PDF reports
- 📆 **Monthly Comparisons**: Compare current month with previous month
- 🎯 **Limit Tracking**: Highlighted sections show exceeded category limits
- 📋 **Detailed Breakdowns**: Income and expense details with category analysis

### 7. User Authentication

- 🔒 **Secure Login**: Google authentication integration
- 👤 **User Profiles**: Personal data saved to your account
- 🔐 **Protected Routes**: Secure access to your financial information

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Firebase account (for backend services)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/sneupane007/fintrack.git
   cd fintrack
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure Firebase:

   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication with Google provider
   - Create Firestore database
   - Update Firebase configuration in `src/config/firebase.js`

4. Start the development server:

   ```bash
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Usage Guide

### Setting Up Your Account

1. Sign in using your Google account
2. Upon first login, you'll receive a welcome notification with tips

### Adding Transactions

1. Navigate to the Dashboard
2. Use the "Add Income" form to record income
3. Use the "Add Expense" form to record expenses
4. All transactions will appear in the "Recent Transactions" section

### Managing Budget Limits

1. Click the settings icon on the Categories page
2. Set monthly spending limits for each expense category
3. Save your limits

### Monitoring Your Budget

1. Check the notification bell icon for any limit alerts
2. View the Categories page to see visual progress bars for each category
3. Exceeded limits will be highlighted in red

### Generating Reports

1. Navigate to the Reports page
2. Review the financial summary and category breakdowns
3. Click "Generate PDF Report" to create a detailed financial report
4. The PDF will download automatically to your device

### Analyzing Spending Patterns

1. Visit the Categories page to see bar charts of income and expenses
2. Use the time filter to change the date range
3. Check the Reports page for month-to-month comparisons

## Folder Structure

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React for the frontend framework
- Firebase for backend services
- Chart.js for data visualization
- jsPDF for PDF generation
