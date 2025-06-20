import { useEffect, useState } from 'react';
import './App.css'
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'

type User = {
  loggedIn: boolean;
  username?: string;
  role?: 'teacher' | 'student';
}

type StudentPasskey = {
  username: string;
  credentialID: string;
  transports: string;
}

function App() {
  const [user, setUser] = useState<User>({ loggedIn: false });
  const [content, setContent] = useState('');
  const [studentPasskeys, setStudentPasskeys] = useState<StudentPasskey[]>([]);

  // Check user session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/me');
        const data = await res.json();
        if (data.loggedIn) {
          setUser(data);
          fetchContent();
          if (data.role === 'teacher') {
            fetchStudentPasskeys();
          }
        }
      } catch (error) {
        console.error("Session check failed:", error);
      }
    };
    checkSession();
  }, []);

  // Handle registration flow if key is in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const key = urlParams.get('key');
    if (key) {
      handleRegister(key);
      // Clean up URL
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/content');
      if (res.ok) {
        const data = await res.json();
        setContent(data.data);
      } else {
        console.error("Failed to fetch content");
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    }
  };

  const fetchStudentPasskeys = async () => {
    try {
      const res = await fetch('/api/students-passkeys');
      if (res.ok) {
        const data = await res.json();
        setStudentPasskeys(data);
      } else {
        console.error("Failed to fetch student passkeys");
      }
    } catch (error) {
      console.error("Error fetching student passkeys:", error);
    }
  };

  const handleGenerateRegistrationLink = async (role: 'teacher' | 'student') => {
    try {
      await fetch('/api/generate-registration-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      alert(`Registration link for ${role} generated. Check the server console.`);
    } catch (error) {
      console.error(`Failed to generate registration link for ${role}:`, error);
      alert('Failed to generate registration link. See console for details.');
    }
  };

  const handleRegister = async (key: string) => {
    try {
      // 1. Get registration options from server
      const optionsRes = await fetch('/api/generate-registration-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      const options = await optionsRes.json();
      if (options.error) throw new Error(options.error);

      // 2. Start registration with browser
      const regResp = await startRegistration(options);

      // 3. Verify registration with server
      const verificationRes = await fetch('/api/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regResp),
      });
      const verificationJSON = await verificationRes.json();

      if (verificationJSON && verificationJSON.verified) {
        alert('Registration successful! You can now log in.');
      } else {
        throw new Error(`Registration failed: ${verificationJSON.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Registration failed:", error);
      alert(`Registration failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleLogin = async () => {
    try {
      // 1. Get authentication options from server
      const optionsRes = await fetch('/api/generate-authentication-options');
      const options = await optionsRes.json();
      if (options.error) throw new Error(options.error);

      // 2. Start authentication with browser
      const authResp = await startAuthentication(options);

      // 3. Verify authentication with server
      const verificationRes = await fetch('/api/verify-authentication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authResp),
      });
      const verificationJSON = await verificationRes.json();

      if (verificationJSON && verificationJSON.verified) {
        alert('Login successful!');
        // Refetch user info
        const userRes = await fetch('/api/me');
        const userData = await userRes.json();
        setUser(userData);
        fetchContent();
        if (userData.role === 'teacher') {
          fetchStudentPasskeys();
        }
      } else {
        throw new Error(`Login failed: ${verificationJSON.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert(`Login failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      setUser({ loggedIn: false });
      setContent('');
      setStudentPasskeys([]);
      alert('Logged out successfully.');
    } catch (error) {
      console.error("Logout failed:", error);
      alert('Logout failed. See console for details.');
    }
  };

  return (
    <>
      <h1>Passkey System</h1>
      {user.loggedIn ? (
        <div>
          <p>Welcome, {user.username} ({user.role})!</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login with Passkey</button>
      )}
      <hr />
      <h2>Content</h2>
      <p>(you can show this only if you are logged in)</p>
      <code>
        <pre>
          {content ? <p>{content}</p> : <p>(Content is not available)</p>}
        </pre>
      </code>
      <hr />
      <h2>Students Passkeys</h2>
      <p>(visible only to teachers)</p>
      <code>
        <pre>
          {
            studentPasskeys.length > 0 ? (
              <ul>
                {studentPasskeys.map((key) => (
                  <li key={key.credentialID}>
                    <strong>User:</strong> {key.username}, <strong>CredentialID:</strong> {key.credentialID}, <strong>Transports:</strong> {key.transports}
                  </li>
                ))}
              </ul>
            ) : (
              <p>(No student passkeys found or you are not a teacher)</p>
            )
          }
        </pre>
      </code>

      <hr />
      <button onClick={() => handleGenerateRegistrationLink('teacher')}>Send Email and Register with Passkey for Teacher</button>
      <button onClick={() => handleGenerateRegistrationLink('student')}>Send Email and Register with Passkey for Student</button>
    </>
  )
}

export default App
