export const UNLOCK_KEY = "ia.unlock.f83c6f91ec";
export const UNLOCK_VALUE = "02d878484b03b5c642b4d795";

export function isUnlocked(): boolean {
  try {
    return localStorage.getItem(UNLOCK_KEY) === UNLOCK_VALUE;
  } catch {
    return false;
  }
}
