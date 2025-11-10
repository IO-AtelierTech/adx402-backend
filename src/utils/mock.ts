export async function getWalletInfo(wallet: string) {
  const knownWallets = ["9XyZt...123", "4fGpq...888"];
  return knownWallets.includes(wallet) ? { wallet } : null;
}
