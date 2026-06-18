export const shortAddress = (addr) =>
  addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

// Reward sekarang ETH sungguhan (lihat CourseReward.sol: claimReward
// memakai payable transfer). Format sebagai ETH, bukan token kustom.
// amountWei bisa berupa BigInt (dari ethers v6) atau Number (dari mock).
export const formatETH = (amountWei) => {
  if (amountWei === null || amountWei === undefined) return "0 ETH";
  // TODO(Web3): kalau amountWei berupa BigInt asli dari kontrak, pakai:
  //   import { formatEther } from "ethers";
  //   return `${formatEther(amountWei)} ETH`;
  // Saat ini (mock) amountWei adalah angka kecil biasa, jadi tampilkan apa adanya.
  return `${amountWei} ETH`;
};

// Format epoch (detik) jadi tanggal yang gampang dibaca.
export const formatDeadline = (epochSeconds) => {
  if (!epochSeconds || Number(epochSeconds) === 0) return "Tidak ada batas waktu";
  const d = new Date(Number(epochSeconds) * 1000);
  return d.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
};

// Ubah error mentah dari MetaMask/ethers jadi pesan ramah user.
// Pesan-pesan di bawah disesuaikan dengan require() yang ADA di
// CourseReward.sol milik anggota Smart Contract — bukan tebakan generik.
export function friendlyError(error) {
  const msg = (error?.reason || error?.message || "").toLowerCase();

  if (error?.code === 4001 || msg.includes("user rejected")) {
    return "Transaksi ditolak di MetaMask. Coba lagi.";
  }
  if (msg.includes("insufficient funds")) {
    return "Saldo ETH kamu tidak cukup untuk membayar gas.";
  }
  if (msg.includes("insufficient contract balance")) {
    return "Saldo kontrak belum cukup untuk membayar reward. Hubungi dosen untuk top-up.";
  }
  if (msg.includes("reward already claimed") || msg.includes("already claimed")) {
    return "Reward sudah pernah diklaim.";
  }
  if (msg.includes("claim deadline has passed")) {
    return "Batas waktu klaim sudah lewat.";
  }
  if (msg.includes("not whitelisted")) {
    return "Alamat kamu belum terdaftar untuk menerima reward. Hubungi dosen.";
  }
  if (msg.includes("contract is not active")) {
    return "Program reward sedang dinonaktifkan oleh dosen.";
  }
  if (msg.includes("invalid student address")) {
    return "Alamat mahasiswa tidak valid.";
  }
  if (msg.includes("amount must be greater than 0")) {
    return "Jumlah reward harus lebih dari 0.";
  }
  return "Terjadi kesalahan. Periksa koneksi dan coba lagi.";
}
