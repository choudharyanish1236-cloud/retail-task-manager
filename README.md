# RetailPro Manager

RetailPro Manager is a world-class, cross-platform retail business management application designed for small and medium-sized shops. It streamlines manual processes like billing, stock tracking, and payment follow-ups through an intuitive interface powered by Google Gemini AI.

## 🚀 Key Features

### 1. Smart Billing & Invoicing
- **AI-Powered Suggestions**: Automatically suggests product names and HSN codes as you type using the Gemini 3 Flash model.
- **Flexible Invoicing**: Create tax-compliant invoices with automatic calculations for SGST, CGST, discounts, and totals.
- **Payment Tracking**: Toggle between "Paid" and "Pending" status. Set optional due dates for credit sales.
- **Quotations**: Generate professional estimates without tax for client reviews.

### 2. Intelligent Stock Management
- **Voice Control**: Add or reduce stock using natural language commands (e.g., "Add 50 units of milk").
- **Low Stock Thresholds**: Set custom thresholds for every product.
- **Visual Alerts**: Real-time highlighting of products running low in the inventory list.
- **Automatic Sync**: Stock counts automatically decrease upon invoice generation.

### 3. Customer & Dealer Management
- **Pending Payments Dashboard**: Track outstanding amounts per customer with color-coded overdue indicators.
- **Smart Reminders**: Send payment reminders via WhatsApp or in-app notifications with customizable templates.
- **Reminder History**: Keep track of when and how you last reminded a customer.

### 4. Advanced Dashboard & Analytics
- **Sales Trends**: Visualize weekly sales performance with area charts.
- **Inventory Status**: Bar chart representation of stock levels compared to minimum thresholds.
- **Critical Alerts**: A dedicated section for immediate action items like low stock or overdue payments.

## 🛠️ Tech Stack
- **Frontend**: React (v19) with TypeScript
- **Styling**: Tailwind CSS
- **Visualization**: Recharts
- **AI Engine**: Google Gemini API (@google/genai)
- **State Management**: React Hooks & Local Storage for persistence

## ⚙️ Setup & Configuration

### Prerequisites
- Node.js and a modern web browser.
- A Google Gemini API Key.

### Environment Variables
The application requires an API key to function. Ensure it is available in your environment:
- `process.env.API_KEY`: Your valid Google Gemini API key.

### Installation
1. Clone the repository.
2. Install dependencies (if using a local environment):
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📝 Usage Guidelines

1. **Billing**: Start typing in the search bar. Use AI suggestions to quickly populate the invoice. If a customer is buying on credit, toggle the "Paid" switch and select a "Due Date".
2. **Inventory**: Use the "Record Voice Action" button for hands-free stock updates. Ensure you allow microphone permissions when prompted.
3. **Thresholds**: Update the "Low Threshold" column in the Inventory section to ensure you receive dashboard alerts when stock is low.
4. **Reminders**: Go to the "Customers" section to view pending dues. Click "Remind" to open the WhatsApp integration tool.

## 🛡️ Data Security
All data is currently stored locally in the browser's `localStorage`. For production environments, it is recommended to integrate a secure backend (e.g., Firebase or PostgreSQL) with encrypted user authentication.

---
*Built with ❤️ for modern retail.*