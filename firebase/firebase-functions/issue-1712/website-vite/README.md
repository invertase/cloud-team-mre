# Firebase Analytics Test - Vite App

A modern Vite-based web application that demonstrates Firebase Analytics integration and triggers the "app_remove" event.

## Features

- 🚀 Built with Vite for fast development
- 🔥 Firebase Analytics integration
- 📊 Automatic "app_remove" event triggering
- 🎨 Modern, responsive UI
- 📝 Real-time logging and status updates

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

Update the Firebase configuration in `src/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

## How It Works

1. **Initialization**: The app initializes Firebase Analytics when loaded
2. **Auto-Trigger**: Automatically triggers the "app_remove" event after 1 second
3. **Manual Control**: Provides a button to manually trigger the event
4. **Event Data**: Sends timestamp, user agent, and page URL with each event
5. **Firebase Function**: Your `onAppRemoveEvent` function will receive and process these events

## Project Structure

```
website-vite/
├── src/
│   ├── main.js          # Main application logic
│   ├── firebase.js      # Firebase configuration and analytics
│   ├── style.css        # Application styles
│   └── counter.js       # (Unused - from Vite template)
├── public/              # Static assets
├── index.html           # HTML entry point
└── package.json         # Dependencies and scripts
```

## Firebase Integration

The app uses Firebase v9+ modular SDK:

- **Analytics**: Tracks user interactions and custom events
- **Event Logging**: Sends structured data with each event
- **Error Handling**: Graceful error handling for failed events

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Customization

You can modify the event parameters in `src/firebase.js`:

```javascript
logEvent(analytics, 'app_remove', {
  timestamp: new Date().toISOString(),
  user_agent: navigator.userAgent,
  page_url: window.location.href,
  // Add your custom parameters here
  custom_param: 'value'
});
```

## Deployment

### Firebase Hosting

1. Build the app:
   ```bash
   npm run build
   ```

2. Update `firebase.json` to include the dist folder:
   ```json
   {
     "hosting": {
       "public": "dist",
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

3. Deploy:
   ```bash
   firebase deploy --only hosting
   ```

### Other Platforms

The built app in the `dist` folder can be deployed to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- etc.

## Testing

1. Load the app in your browser
2. Check the status message - should show "App Remove event triggered!"
3. Check browser console for event confirmation
4. Check Firebase Functions logs for event processing
5. Use the manual trigger button for additional testing

## Troubleshooting

- **"Firebase not yet initialized"**: Wait for the page to fully load
- **Analytics not working**: Verify Firebase configuration
- **Function not receiving events**: Check Firebase Function deployment
- **Build errors**: Ensure all dependencies are installed

## Dependencies

- **Vite**: Build tool and dev server
- **Firebase**: Analytics and app services
- **Vanilla JS**: No framework dependencies 