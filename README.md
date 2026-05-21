# Startup Management Dashboard

A comprehensive web-based dashboard for managing startup and SME operations, featuring analytics, financial tracking, and business intelligence tools.

## Features

- **Dashboard Overview**: Real-time KPI monitoring (revenue, campaigns, leads, CSAT)
- **Analytics**: Interactive charts and data visualization using Chart.js
- **Financial Management**: Revenue, expense, and profit tracking
- **Campaign Management**: Marketing campaign tracking and performance
- **Multi-theme Support**: 5 built-in themes (corporate, dark, light, brand, sunset)
- **Responsive Design**: Mobile-friendly interface
- **Interactive Chatbot**: Built-in assistant for user support
- **Keyboard Shortcuts**: Quick navigation and accessibility

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Charts**: Chart.js for data visualization
- **Fonts**: Google Fonts (Inter)
- **Architecture**: Component-based SPA with custom router

## Project Structure

```
Startup-Management-Major/
├── frontend/          # SPA UI and Config
│   ├── src/           # Component-based SPA UI Logic
│   ├── public/        # Static assets and index.html
│   └── package.json   # Node dependencies and scripts
├── backend/           # Flask Microservice & Express Server
│   ├── models_api.py  # Main Flask REST API for ML Models
│   ├── server.js      # Express server & proxy
│   └── requirements.txt
├── models/            # Serialized ML Models (.pkl)
│   ├── campaign_performance/
│   ├── customer_segmentation/
│   ├── forecasting/
│   ├── recommendation_engine/
│   └── workflow_optimization/
├── data/              # Datasets (.csv)
└── notebooks/         # Jupyter Notebooks for ML Research
```

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional but recommended)

### Installation & Running Locally

This project requires both the Node.js frontend and Python backend to be running.

**1. Start the Backend (Flask API)**
```bash
cd backend
pip install -r requirements.txt
python models_api.py
```
*The backend will run on http://localhost:5000*

**2. Start the Frontend (Express Server)**
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on http://localhost:3000*

**3. View Dashboard**
Open `http://localhost:3000` in your browser.

## Usage

### Navigation
- Use the sidebar menu to navigate between sections
- **Ctrl/Cmd + B**: Toggle sidebar
- **Ctrl/Cmd + K**: Focus search bar

### Themes
- Click the "Theme" button in the top bar to cycle through available themes
- Theme preference is automatically saved

### Chatbot
- Click the chat icon (💬) to open the assistant
- Ask questions about features, pricing, or navigation
- The chatbot provides contextual help based on your current page

## Features Overview

### Dashboard
- Key performance indicators
- Revenue tracking
- Campaign metrics
- Customer satisfaction scores

### Analytics
- Interactive charts and graphs
- Data filtering and insights
- Performance trends

### Financials
- Revenue management
- Expense tracking
- Profit analysis

## Customization

### Adding New Themes
Edit the theme array in `src/js/app.js`:
```javascript
const order = ['corporate','dark','light','brand','sunset','your-theme'];
```

### Modifying Data
Update `assets/mock-data.json` with your business data:
```json
{
  "kpis": {
    "revenue": 128450,
    "campaigns": 14,
    "leads": 326,
    "csat": 4.6
  }
}
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is available for educational and demonstration purposes.

## Support

For questions or support, use the built-in chatbot or contact the development team."
