// =============================================================
// Diisi oleh anggota Smart Contract / Web3.
// Setelah deploy: salin address & ABI hasil compile ke sini.
// =============================================================

export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

// Contoh bentuk ABI yang diharapkan frontend.
// Sesuaikan dengan smart contract final.
export const CONTRACT_ABI = [
  // --- READ ---
  "function getRewardAmount(address user) view returns (uint256)",
  "function hasClaimed(address user) view returns (bool)",
  // --- WRITE ---
  "function claimReward()",
  // --- EVENTS ---
  "event RewardGranted(address indexed user, uint256 amount)",
  "event RewardClaimed(address indexed user, uint256 amount)",
];

// Network yang diharapkan (Hardhat localhost). Ganti ke Sepolia (11155111) jadi bonus.
export const EXPECTED_CHAIN_ID = 31337n;
