function normalizePhoneNumber(phone) {
    if (!phone) return phone;
    return String(phone)
        .replace(/\s+/g, '')       // remove spaces
        .replace(/^\+/, '')        // remove +
        .replace(/^234/, '0')      // convert 234 to 0 (Nigeria standard)
        .trim();
}

module.exports = { normalizePhoneNumber };
