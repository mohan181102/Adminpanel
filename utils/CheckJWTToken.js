const checkIstJWTornot = function isJWT(token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
        return false;
    }

    try {
        // Decode header
        const header = JSON.parse(Buffer.from(parts[0], 'base64').toString('utf8'));
        return header.typ === 'JWT'; // Checks the token type in the header
    } catch (e) {
        return false; // If there's an error in parsing, it's not a valid JWT
    }
}

module.exports = checkIstJWTornot;