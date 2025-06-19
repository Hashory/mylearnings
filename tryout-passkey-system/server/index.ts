import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type {
  VerifiedRegistrationResponse,
  VerifiedAuthenticationResponse,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/server";
import Database from "better-sqlite3";
import crypto from "crypto";

const db = new Database("passkey-demo.db");

// Database Setup
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('teacher', 'student'))
  );
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS authenticators (
    credentialID BLOB PRIMARY KEY,
    user_id TEXT NOT NULL,
    credentialPublicKey BLOB NOT NULL,
    counter INTEGER NOT NULL,
    transports TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS registration_tokens (
    token TEXT PRIMARY KEY,
    role TEXT NOT NULL CHECK(role IN ('teacher', 'student')),
    expires_at INTEGER NOT NULL
  );
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS challenges (
    id TEXT PRIMARY KEY,
    challenge TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  );
`);

const app = new Hono();

const rpId = "localhost";
const origin = `http://${rpId}:5173`;
const appName = "Passkey Demo";

type User = {
  id: string;
  username: string;
  role: "teacher" | "student";
};

type Authenticator = {
  credentialID: Buffer;
  user_id: string;
  credentialPublicKey: Buffer;
  counter: number;
  transports: string;
};

// --- Registration ---

app.post("/api/generate-registration-link", async (c) => {
  const { role } = await c.req.json<{ role: "teacher" | "student" }>();
  if (role !== "teacher" && role !== "student") {
    return c.json({ error: "Invalid role" }, 400);
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires_at = Date.now() + 1000 * 60 * 15; // 15 minutes

  db.prepare(
    "INSERT INTO registration_tokens (token, role, expires_at) VALUES (?, ?, ?)"
  ).run(token, role, expires_at);

  const registrationUrl = `${origin}/?key=${token}`;
  console.log(`Registration URL for ${role}: ${registrationUrl}`);

  return c.json({ success: true, url: registrationUrl });
});

app.post("/api/generate-registration-options", async (c) => {
    const { key } = await c.req.json<{ key: string }>();

    const tokenInfo = db.prepare("SELECT * FROM registration_tokens WHERE token = ?").get(key) as { token: string; role: 'teacher' | 'student'; expires_at: number } | undefined;

    if (!tokenInfo || tokenInfo.expires_at < Date.now()) {
        return c.json({ error: "Invalid or expired registration key" }, 400);
    }

    const existingAuthenticators = db.prepare("SELECT credentialID, transports FROM authenticators").all() as {credentialID: Buffer, transports: string}[];

    const username = `${tokenInfo.role}-${crypto.randomBytes(4).toString('hex')}`;
    const userId = crypto.randomUUID();

    const options = await generateRegistrationOptions({
        rpName: appName,
        rpID: rpId,
        userID: Buffer.from(userId, "utf-8"), // FIX: userID must be a Buffer
        userName: username,
        attestationType: "none",
        excludeCredentials: existingAuthenticators.map(auth => ({
            id: auth.credentialID.toString('base64url'),
            type: 'public-key',
            transports: auth.transports ? JSON.parse(auth.transports) : undefined,
        })),
        authenticatorSelection: {
            residentKey: 'required',
            userVerification: 'preferred',
        },
    });

    const challengeId = crypto.randomUUID();
    const expires_at = Date.now() + 1000 * 60 * 5; // 5 minutes
    db.prepare("INSERT INTO challenges (id, challenge, expires_at) VALUES (?, ?, ?)").run(challengeId, options.challenge, expires_at);

    setCookie(c, "challengeId", challengeId, { path: "/", httpOnly: true, sameSite: "Lax" });
    setCookie(c, "registrationInfo", JSON.stringify({ key, userId, username }), { path: "/", httpOnly: true, sameSite: "Lax" });

    return c.json(options);
});

app.post("/api/verify-registration", async (c) => {
    const body: RegistrationResponseJSON = await c.req.json();
    const challengeId = getCookie(c, "challengeId");
    const registrationInfoCookie = getCookie(c, "registrationInfo");

    if (!challengeId || !registrationInfoCookie) {
        return c.json({ error: "Missing challenge or registration info" }, 400);
    }

    const { key, userId, username } = JSON.parse(registrationInfoCookie);

    const challengeInfo = db.prepare("SELECT * FROM challenges WHERE id = ?").get(challengeId) as { id: string; challenge: string; expires_at: number } | undefined;
    const tokenInfo = db.prepare("SELECT * FROM registration_tokens WHERE token = ?").get(key) as { token: string; role: 'teacher' | 'student'; expires_at: number } | undefined;

    if (!challengeInfo || challengeInfo.expires_at < Date.now()) {
        db.prepare("DELETE FROM challenges WHERE id = ?").run(challengeId);
        return c.json({ error: "Invalid or expired challenge" }, 400);
    }
    if (!tokenInfo || tokenInfo.expires_at < Date.now()) {
        db.prepare("DELETE FROM registration_tokens WHERE token = ?").run(key);
        return c.json({ error: "Invalid or expired registration key" }, 400);
    }

    let verification: VerifiedRegistrationResponse;
    try {
        verification = await verifyRegistrationResponse({
            response: body,
            expectedChallenge: challengeInfo.challenge,
            expectedOrigin: origin,
            expectedRPID: rpId,
            requireUserVerification: true,
        });
    } catch (error) {
        console.error(error);
        return c.json({ error: (error as Error).message }, 400);
    }

    const { verified, registrationInfo: regInfo } = verification;

    if (verified && regInfo) {
        // The credential data is in `regInfo.credential` with properties `id` and `publicKey`.
        const { id: credentialID, publicKey: credentialPublicKey, counter } = regInfo.credential;

        // Runtime checks remain crucial to prevent crashes from unexpected missing data.
        if (!credentialID || !credentialPublicKey) {
            console.error("Verification successful, but credentialID or credentialPublicKey is missing.", regInfo);
            return c.json({ error: "Registration verification failed: missing credential data." }, 400);
        }

        // The `credentialID` from the client is base64url, but the DB stores it as a raw Buffer.
        const credentialIDBuffer = Buffer.from(credentialID, 'base64url');

        const userCheck = db.prepare("SELECT * FROM authenticators WHERE credentialID = ?").get(credentialIDBuffer) as Authenticator | undefined;
        if (userCheck) {
            return c.json({ error: "Authenticator already registered" }, 400);
        }

        db.prepare("INSERT INTO users (id, username, role) VALUES (?, ?, ?)").run(userId, username, tokenInfo.role);
        db.prepare(
            "INSERT INTO authenticators (user_id, credentialID, credentialPublicKey, counter, transports) VALUES (?, ?, ?, ?, ?)"
        ).run(userId, credentialIDBuffer, Buffer.from(credentialPublicKey), counter, JSON.stringify(body.response.transports ?? []));

        db.prepare("DELETE FROM registration_tokens WHERE token = ?").run(key);
        db.prepare("DELETE FROM challenges WHERE id = ?").run(challengeId);
    }

    return c.json({ verified });
});

// --- Authentication ---

app.get("/api/generate-authentication-options", async (c) => {
    const options = await generateAuthenticationOptions({
        rpID: rpId,
        userVerification: 'preferred',
    });

    const challengeId = crypto.randomUUID();
    const expires_at = Date.now() + 1000 * 60 * 5; // 5 minutes
    db.prepare("INSERT INTO challenges (id, challenge, expires_at) VALUES (?, ?, ?)").run(challengeId, options.challenge, expires_at);

    setCookie(c, "challengeId", challengeId, { path: "/", httpOnly: true, sameSite: "Lax" });

    return c.json(options);
});

app.post("/api/verify-authentication", async (c) => {
    const body: AuthenticationResponseJSON = await c.req.json();
    const challengeId = getCookie(c, "challengeId");

    if (!challengeId) {
        return c.json({ error: "Missing challenge" }, 400);
    }

    const challengeInfo = db.prepare("SELECT * FROM challenges WHERE id = ?").get(challengeId) as { id: string; challenge: string; expires_at: number } | undefined;
    if (!challengeInfo || challengeInfo.expires_at < Date.now()) {
        db.prepare("DELETE FROM challenges WHERE id = ?").run(challengeId);
        return c.json({ error: "Invalid or expired challenge" }, 400);
    }

    const authenticatorFromDB = db.prepare("SELECT * FROM authenticators WHERE credentialID = ?").get(Buffer.from(body.id, 'base64url')) as Authenticator | undefined;
    if (!authenticatorFromDB) {
        return c.json({ error: "Authenticator not found" }, 404);
    }

    let verification: VerifiedAuthenticationResponse;
    try {
        // Construct the object for the library, ensuring it matches the `WebAuthnCredential` interface.
        const credentialForVerification = {
            id: authenticatorFromDB.credentialID, // Map from DB column `credentialID` to `id`
            publicKey: authenticatorFromDB.credentialPublicKey, // Map from DB column `credentialPublicKey` to `publicKey`
            counter: authenticatorFromDB.counter,
            transports: authenticatorFromDB.transports ? JSON.parse(authenticatorFromDB.transports) : [],
        };

        verification = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge: challengeInfo.challenge,
            expectedOrigin: origin,
            expectedRPID: rpId,
            // Pass the correctly structured object with the correct property name `credential`.
            credential: credentialForVerification,
            requireUserVerification: true,
        });
    } catch (error) {
        console.error(error);
        return c.json({ error: (error as Error).message }, 400);
    }

    const { verified, authenticationInfo } = verification;

    if (verified) {
        db.prepare("UPDATE authenticators SET counter = ? WHERE credentialID = ?").run(authenticationInfo.newCounter, authenticatorFromDB.credentialID);

        const user = db.prepare("SELECT * FROM users WHERE id = ?").get(authenticatorFromDB.user_id) as User;

        setCookie(c, "session", JSON.stringify({ userId: user.id, username: user.username, role: user.role }), { path: "/", httpOnly: true, sameSite: "Lax", maxAge: 60 * 60 * 24 }); // 1 day
        db.prepare("DELETE FROM challenges WHERE id = ?").run(challengeId);

        return c.json({ verified: true, role: user.role });
    }

    return c.json({ verified: false });
});

// --- User/Data Endpoints ---

// Helper function to get logged-in user
async function getLoggedInUser(c: any): Promise<{ loggedIn: boolean; user?: User }> {
    const sessionCookie = getCookie(c, "session");
    if (!sessionCookie) {
        return { loggedIn: false };
    }
    try {
        const session = JSON.parse(sessionCookie);
        const user = db.prepare("SELECT * FROM users WHERE id = ?").get(session.userId) as User | undefined;
        if (!user) {
            setCookie(c, "session", "", { expires: new Date(0) });
            return { loggedIn: false };
        }
        return { loggedIn: true, user };
    } catch {
        return { loggedIn: false };
    }
}

app.get("/api/me", async (c) => {
    const { loggedIn, user } = await getLoggedInUser(c);
    if (!loggedIn || !user) {
        return c.json({ loggedIn: false });
    }
    return c.json({ loggedIn: true, ...user });
});

app.post("/api/logout", (c) => {
    setCookie(c, "session", "", { path: "/", expires: new Date(0) });
    return c.json({ success: true });
});

app.get("/api/content", (c) => {
    const sessionCookie = getCookie(c, "session");
    if (!sessionCookie) {
        return c.json({ error: "Unauthorized" }, 401);
    }
    return c.json({ data: "This is the secret content for logged in users." });
});

app.get('/api/students-passkeys', async (c) => {
  const { loggedIn, user } = await getLoggedInUser(c);
  if (!loggedIn || user?.role !== 'teacher') {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const studentPasskeys = db.prepare('SELECT credentialID FROM authenticators LEFT JOIN users ON authenticators.user_id = users.id WHERE users.role = ?')
    .all('student')
    .map((row: any) => {
      if (row && row.credentialID) {
        const credIDBuffer = Buffer.isBuffer(row.credentialID) ? row.credentialID : Buffer.from(row.credentialID, 'base64');
        return {
          credentialID: credIDBuffer.toString('base64url'),
        };
      }
      return null;
    }).filter(Boolean);

  return c.json(studentPasskeys);
});

console.log("Server is running on port 3000");

serve({
  fetch: app.fetch,
  port: 3000,
});

