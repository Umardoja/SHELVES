// Helper to normalize Nigerian phone numbers to E.164 (+234XXXXXXXXXX)
function normalizePhoneNumber(phone) {
  if (phone === undefined || phone === null) return phone;
  let s = String(phone).trim();
  if (s.length === 0) return s;

  // Remove all whitespace
  s = s.replace(/\s+/g, "");

  // If starts with +, keep the + and strip non-digits from the rest
  if (s.startsWith("+")) {
    const rest = s.slice(1).replace(/\D/g, "");
    s = "+" + rest;
  } else {
    // Otherwise strip all non-digits
    s = s.replace(/\D/g, "");
  }

  // Normalization rules (priority order):
  // 1. If already +234... -> return as-is
  if (s.startsWith("+234")) return s;

  // 2. If starts with 0 -> replace leading 0 with +234
  if (s.startsWith("0")) return "+234" + s.slice(1);

  // 3. If starts with 234 (without +) -> add +
  if (s.startsWith("234")) return "+" + s;

  // 4. If starts with + but not +234 (other country) -> return as-is
  if (s.startsWith("+")) return s;

  // 5. Fallback: return digits unchanged (caller may decide what to do)
  return s;
}

// Convert E.164 (+234...) to local 090... format for CRM
function toLocalPhone(phone) {
  let s = normalizePhoneNumber(phone);
  if (!s) return s;

  if (s.startsWith("+234")) {
    return "0" + s.substring(4);
  }
  return s;
}

module.exports = { normalizePhoneNumber, toLocalPhone };
