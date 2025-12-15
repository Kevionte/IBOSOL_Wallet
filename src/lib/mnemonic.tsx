import { generateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";

export function generateSecureRecoveryPhrase(words: 12 | 24 = 12) {
  const strength = words === 24 ? 256 : 128;
  return generateMnemonic(wordlist, strength);
}