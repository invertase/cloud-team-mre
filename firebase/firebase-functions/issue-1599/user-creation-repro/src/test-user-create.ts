import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import * as dotenv from 'dotenv';
dotenv.config(); 

const {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_APP_ID,
} = process.env

if (!FIREBASE_API_KEY || !FIREBASE_AUTH_DOMAIN || !FIREBASE_PROJECT_ID || !FIREBASE_APP_ID) {
  throw new Error('Missing Firebase environment variables.');
}

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  appId: FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function testCreateUser(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User created:', userCredential.user.uid);
  } catch (error: any) {
    console.error('Error creating user:', error.code, error.message);
    console.log(error)
  }
}

const email = `testuser${Date.now()}@example.com`;
const password = 'TestPassword123';

testCreateUser(email, password);
