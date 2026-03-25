// Shared Africa's Talking SDK singleton — lazy-initialised
// Do NOT call AfricasTalking() at module load. It throws if env vars are undefined.
// Use getSdk() wherever you need the AT client.

let _at = null;

function getSdk() {
    if (_at) return _at;

    const API_KEY = process.env.AT_API_KEY;
    const USERNAME = process.env.AT_USERNAME;

    if (!API_KEY || !USERNAME) {
        throw new Error(
            "AT_API_KEY or AT_USERNAME is not set. Add them in your Render Environment settings."
        );
    }

    const AfricasTalking = require("africastalking");
    _at = AfricasTalking({ apiKey: API_KEY, username: USERNAME });
    return _at;
}

module.exports = { getSdk };
