export function getApplicationId() {
    const appId = process.env.APP_ID;
    if (!appId) {
        throw new Error('FATAL: APP_ID is not set');
    }
    return appId;
}

export function getJWKSUrl() {
    const jwksUrl = process.env.JWKS_URL;
    if (!jwksUrl) {
        return 'https://forge.cdn.prod.atlassian-dev.net/.well-known/jwks.json';
    }
    return jwksUrl;
}