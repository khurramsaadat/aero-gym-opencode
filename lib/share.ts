// Aero Gym - sharing helpers (PRD §4.7): Web Share API with clipboard
// fallback and textarea fallback for old browsers.

export async function shareText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && "share" in navigator) {
    try {
      await navigator.share({ text });
      return true;
    } catch {
      /* user cancelled or failed - fall through */
    }
  }
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* fall through */
    }
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } catch {
    /* ignore */
  }
  document.body.removeChild(ta);
  return true;
}
