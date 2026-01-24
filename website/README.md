# BodyScan AI - Modern React Frontend

A beautiful, modern, and interactive React-based frontend for the 3D Body Measurement System.

## 🎨 Features

- **Modern UI/UX**: Clean, professional design with smooth animations
- **Interactive Components**: Engaging interactions with Framer Motion
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-time Feedback**: Toast notifications for user actions
- **Data Visualization**: Charts and graphs for measurements
- **Size Recommendations**: Smart clothing size suggestions
- **Dark Mode Ready**: Easy to extend with dark mode

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- FastAPI backend running on `http://localhost:8000`

### Installation

```bash
cd website
npm install
```

### Configuration

Create a `.env` file in the website directory:

```env
REACT_APP_API_URL=http://localhost:8000
```

### Run Development Server

```bash
npm start
```

The website will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
website/
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx       # Navigation header
│   │   ├── ImageUpload.tsx  # Image upload component
│   │   ├── MeasurementForm.tsx  # Main form
│   │   ├── MeasurementsDisplay.tsx  # Results display
│   │   └── SizeRecommendations.tsx  # Size suggestions
│   ├── services/
│   │   └── api.ts           # API client and types
│   ├── styles/
│   │   └── globals.css      # Global styles
│   ├── App.tsx              # Main App component
│   └── index.tsx            # Entry point
├── public/
│   └── index.html           # HTML template
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind CSS config
├── tsconfig.json            # TypeScript config
└── .env                     # Environment variables
```

## 🎯 Key Components

### 1. Header
- Branding and navigation
- Animated logo with rotating icon
- Feature highlights

### 2. ImageUpload
- Drag and drop file upload
- File preview
- Image validation
- Visual feedback

### 3. MeasurementForm
- Height input (required)
- Gender selection
- Age input
- Tips for best results
- Form validation

### 4. MeasurementsDisplay
- Top measurements grid
- Bar chart visualization
- Complete measurements table
- Sortable by value

### 5. SizeRecommendations
- Size suggestions for different categories
- Gradient cards with icons
- Easy to read format

## 🔌 API Integration

The website connects to the FastAPI backend via the `ApiService`:

```typescript
import { ApiService } from './services/api';

// Process measurements
const result = await ApiService.processMeasurements(
  frontImage,
  sideImage,
  heightCm,
  gender,
  age
);
```

## 🎨 Styling

### Tailwind CSS

The project uses Tailwind CSS for styling with custom extensions:

- **Primary Colors**: Blue gradient (primary-50 to primary-900)
- **Custom Animations**: Float, pulse-soft, slide-in
- **Responsive**: Mobile-first approach
- **Accessibility**: WCAG compliant

### Framer Motion

Smooth animations for:
- Page transitions
- Component entrance
- Interactive elements
- Loading states

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: 1024px+

## 🔒 Security

- CORS configured on backend
- File size validation (10MB max)
- File type validation (images only)
- Input sanitization
- Secure API endpoints

## 🚀 Deployment

### Build the Project

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm run build
# Drag build/ folder to Netlify
```

### Deploy to AWS S3 + CloudFront

```bash
npm run build
aws s3 sync build/ s3://your-bucket-name/
```

## 🐛 Troubleshooting

### API Connection Failed

```
❌ Unable to connect to backend API
```

**Solution**: Make sure FastAPI is running:

```bash
cd ..
python api/app.py
```

### npm install fails

**Solution**: Clear cache and reinstall:

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 already in use

**Solution**: Use a different port:

```bash
PORT=3001 npm start
```

## 📦 Dependencies

- **react**: UI library
- **react-dom**: React rendering
- **framer-motion**: Animations
- **tailwindcss**: Styling
- **axios**: HTTP client
- **lucide-react**: Icons
- **recharts**: Charts
- **react-hot-toast**: Notifications
- **zustand**: State management
- **typescript**: Type safety

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [FastAPI](https://fastapi.tiangolo.com/)

## 💡 Tips

1. **For Development**: Use `npm start` to get hot-reload
2. **For Testing**: Use `npm test` to run tests
3. **For Production**: Use `npm run build` and serve the `build/` directory
4. **API Debugging**: Open browser DevTools Network tab to inspect API calls

## 📄 License

Same as parent project

## 🤝 Support

For issues or questions, refer to the main project README or documentation.

