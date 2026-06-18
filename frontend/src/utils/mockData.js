// =============================================================
// MOCK DATA — sementara, sampai anggota Web3 menyambungkan ethers.js
// ke kontrak CourseReward.sol yang sebenarnya.
// Bentuk data di sini disesuaikan dengan getStudentInfo() kontrak:
// (hasClaimed, isWhitelisted, rewardAmount).
// =============================================================

export const MOCK_ADDRESS = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

export const MOCK_STATE = {
  rewardAmount: 0.05, // dalam ETH (kontrak asli pakai wei, lihat helpers.formatETH)
  hasClaimed: false,
  isWhitelisted: true,
  wrongNetwork: false,
  isAdmin: true,
  isActive: true,
  // epoch detik 7 hari dari sekarang, untuk simulasi claimDeadline
  claimDeadline: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  contractBalance: 1.2, // saldo ETH di kontrak, dipakai admin untuk cek cukup/tidak
};

export const MOCK_HISTORY = [
  { type: "Reward granted", amount: 0.02, by: "Dosen", time: "2 hari lalu" },
  { type: "Reward granted", amount: 0.03, by: "Dosen", time: "kemarin" },
];

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
