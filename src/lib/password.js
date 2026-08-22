// Password quality scoring + generation — shared by the Roles reset modal
// and the Profile security panel.
export const scorePassword = (pw) => {
  const v = String(pw || "");
  if (!v) return { score: 0, label: "", tone: "" };
  let score = 0;
  if (v.length >= 8) score += 1;
  if (v.length >= 12) score += 1;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score += 1;
  if (/\d/.test(v)) score += 1;
  if (/[^A-Za-z0-9]/.test(v)) score += 1;
  score = Math.min(4, score);
  const labels = ["Very weak", "Weak", "Fair", "Strong", "Very strong"];
  const tones = ["danger", "danger", "warning", "success", "success"];
  return { score, label: labels[score], tone: tones[score] };
};

// Cryptographically-random 16-char password with all character classes.
export const generatePasswordValue = () => {
  const sets = [
    "abcdefghijkmnpqrstuvwxyz",
    "ABCDEFGHJKLMNPQRSTUVWXYZ",
    "23456789",
    "!@#$%^&*-_=+",
  ];
  const all = sets.join("");
  const rand = (n) => {
    if (window.crypto?.getRandomValues) {
      const a = new Uint32Array(1);
      window.crypto.getRandomValues(a);
      return a[0] % n;
    }
    return Math.floor(Math.random() * n);
  };
  let chars = sets.map((s) => s[rand(s.length)]);
  while (chars.length < 16) chars.push(all[rand(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
};
