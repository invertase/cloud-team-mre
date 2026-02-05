import { useState, useEffect } from "react";
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  const signInWithProvider = async (
    provider: GoogleAuthProvider | OAuthProvider
  ) => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignInWithMicrosoft = () =>
    signInWithProvider(new OAuthProvider("microsoft.com"));
  const handleSignInWithGoogle = () =>
    signInWithProvider(new GoogleAuthProvider());
  const handleSignInWithGitHub = () =>
    signInWithProvider(new OAuthProvider("github.com"));

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center", maxWidth: 400 }}>
      <h1>MRE #1592</h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Compare <code>emailVerified</code> across Microsoft, Google, and GitHub
        in auth.user().onCreate()
      </p>
      {user ? (
        <div>
          <p>
            <strong>Signed in</strong>
          </p>
          <p>UID: {user.uid}</p>
          <p>Email: {user.email ?? "(none)"}</p>
          <p>
            Provider:{" "}
            {user.providerData?.map((p) => p.providerId).join(", ") ?? "(none)"}
          </p>
          <button onClick={handleSignOut}>Sign out</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <button
            onClick={handleSignInWithMicrosoft}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in with Microsoft"}
          </button>
          <button
            onClick={handleSignInWithGoogle}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in with Google"}
          </button>
          <button
            onClick={handleSignInWithGitHub}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in with GitHub"}
          </button>
        </div>
      )}
      {error && (
        <p style={{ color: "#c00", marginTop: "1rem" }}>{error}</p>
      )}
    </div>
  );
}

export default App;
