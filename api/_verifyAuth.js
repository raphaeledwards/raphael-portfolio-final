import { jwtVerify, createRemoteJWKSet } from 'jose';

// Google's public signing keys for Firebase Auth ID tokens. This is the
// third-party verification endpoint Firebase itself documents as the
// alternative to the Admin SDK (which would need a service-account secret
// this project doesn't otherwise require). `jose` caches the key set per
// its own Cache-Control headers, so this is one network fetch per cold
// start, not per request.
const JWKS = createRemoteJWKSet(
    new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

// Verifies a Firebase Auth ID token (anonymous sessions included — anything
// the client SDK considers "signed in") sent as `Authorization: Bearer <token>`.
// Throws on a missing, malformed, expired, or wrong-project token.
export async function requireFirebaseAuth(req) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new Error('Missing bearer token');

    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
    if (!projectId) throw new Error('Server auth not configured');

    const { payload } = await jwtVerify(token, JWKS, {
        issuer: `https://securetoken.google.com/${projectId}`,
        audience: projectId,
    });

    return payload; // payload.sub is the Firebase UID
}
