// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v9.0.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAStGKBNfpNKqyc3JmW0VRY73tV_IZH4l0",
  authDomain: "dev-extensions-testing.firebaseapp.com",
  databaseURL: "https://dev-extensions-testing-default-rtdb.firebaseio.com",
  projectId: "dev-extensions-testing",
  storageBucket: "dev-extensions-testing.firebasestorage.app",
  messagingSenderId: "794622217280",
  appId: "1:794622217280:web:b8140262a39d1a2f9aa3a5",
  measurementId: "G-MXS3C3NN26",
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const triggerEvent = () => {
  try {
    logEvent(analytics, 'first_visit', {
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      page_url: window.location.href
    });
    console.log('✅ analytics event triggered successfully');
    return true;
  } catch (error) {
    console.error('❌ Error triggering analytics event:', error);
    return false;
  }
};

export { analytics }; 