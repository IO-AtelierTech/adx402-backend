export async function getWalletInfo(wallet: string) {
  const knownWallets = ["BE7HBKq9wrtvoJu8uKyEtvbynqosvnzLniMAHA1n9Mz8"];
  return knownWallets.includes(wallet) ? { wallet } : null;
}
