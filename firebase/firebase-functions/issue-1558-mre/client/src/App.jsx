import { useState } from "react";
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const testEmail = "user@example.com";
const testPassword = "testPassword";

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setResult(null);
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        testEmail,
        testPassword
      );
      setResult({
        success: true,
        message: `Created test user ${userCredential.user.uid} with email ${testEmail}`,
      });
    } catch (err) {
      const code = err.code || "";
      const isOperationNotAllowed = code === "auth/operation-not-allowed";
      setResult({
        success: false,
        message: err.code || err.message,
        full: String(err),
        hint: isOperationNotAllowed
          ? "Enable Email/Password sign-in: Firebase Console → your project → Authentication → Sign-in method → Email/Password → Enable."
          : null,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: "2rem", textAlign: "center", maxWidth: 420 }}>
      <h1 style={{ marginTop: 0 }}>Issue #1558 MRE</h1>
      <p style={{ color: "#666" }}>
        Registers <code>{testEmail}</code> with a fixed password. Click twice:
        first run succeeds, second should fail with{" "}
        <code>auth/email-already-in-use</code>. Check Functions logs for
        blocking function invocations on the second run.
      </p>
      <button
        onClick={handleRegister}
        disabled={loading}
        style={{
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Registering…" : "Register user"}
      </button>
      {result && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            borderRadius: 8,
            background: result.success ? "#e8f5e9" : "#ffebee",
            color: result.success ? "#1b5e20" : "#b71c1c",
            textAlign: "left",
            wordBreak: "break-word",
          }}
        >
          <strong>{result.success ? "Success" : "Error"}</strong>
          <p style={{ margin: "0.5rem 0 0" }}>{result.message}</p>
          {!result.success && result.hint && (
            <p style={{ margin: "0.5rem 0 0", fontSize: 14 }}>
              {result.hint}
            </p>
          )}
          {!result.success && result.full && (
            <pre
              style={{
                marginTop: "0.5rem",
                fontSize: 12,
                overflow: "auto",
              }}
            >
              {result.full}
            </pre>
          )}
        </div>
      )}
    </main>
  );
}
