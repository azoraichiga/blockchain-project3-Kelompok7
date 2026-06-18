export const shortAddress = (addr) =>
  addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

export const formatCRT = (amount) => `${amount} CRT`;

// Ubah error mentah dari MetaMask/ethers jadi pesan ramah user.
export function friendlyError(error) {
  const msg = (error?.reason || error?.message || "").toLowerCase();
  if (error?.code === 4001 || msg.includes("user rejected")) {
    return "Transaksi ditolak di MetaMask. Coba lagi.";
  }
  if (msg.includes("insufficient funds")) {
    return "Saldo ETH tidak cukup untuk gas.";
  }
  if (msg.includes("already claimed")) {
    return "Reward sudah pernah diklaim.";
  }
  return "Terjadi kesalahan. Periksa koneksi dan coba lagi.";
}
