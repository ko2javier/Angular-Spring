export const authConfig = {
    domain: 'dev-hn6ws7o3ayfpoqpa.eu.auth0.com', // Tu dominio Auth0
    clientId: '9uPAyIP7nQuyolzea0KLQ0XyDVy0t3QN', // Tu Client ID
    audience: 'https://dev-hn6ws7o3ayfpoqpa.eu.auth0.com/api/v2/', // API Audience
    redirectUri: window.location.origin, // Redirección después del login
    //redirectUri: `${window.location.origin}/workbench`, // Redirección después del login
    scope: 'openid profile email', // Scopes básicos
  };
  