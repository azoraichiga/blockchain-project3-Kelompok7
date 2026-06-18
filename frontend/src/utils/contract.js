// =============================================================
// contract.js — Konfigurasi integrasi Web3 (Anggota 3)
//
// Setelah Anggota 1 deploy:
//   1. Copy address dari output `npx hardhat run scripts/deploy.js`
//   2. Paste ke CONTRACT_ADDRESS di bawah
// =============================================================

// Ganti dengan address hasil deploy Anggota 1
export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

// ABI disesuaikan dengan CourseReward.sol (versi Project-3 yang dimodifikasi)
// Mapping: public state variable otomatis generate getter dengan signature yang sama
export const CONTRACT_ABI = [
  // ── READ ──────────────────────────────────────────────────────
  // rewardAmount(address) → per-student reward dalam wei
  "function rewardAmount(address user) view returns (uint256)",
  // hasClaimed(address) → sudah klaim atau belum
  "function hasClaimed(address user) view returns (bool)",
  // whitelist(address) → terdaftar atau belum
  "function whitelist(address user) view returns (bool)",
  // deadline() → unix timestamp batas klaim
  "function deadline() view returns (uint256)",
  // owner() → address dosen/admin
  "function owner() view returns (address)",
  // getBalance() → sisa ETH di contract
  "function getBalance() view returns (uint256)",

  // ── WRITE (mahasiswa) ─────────────────────────────────────────
  // claim() → klaim reward ETH; revert jika: not whitelisted,
  //           already claimed, deadline passed, insufficient balance
  "function claim()",

  // ── WRITE (dosen/admin, onlyOwner) ───────────────────────────
  // grantReward(student, amount) → whitelist + set amount dalam 1 tx
  "function grantReward(address student, uint256 amount)",
  // withdraw() → tarik sisa ETH ke owner
  "function withdraw()",

  // ── EVENTS ───────────────────────────────────────────────────
  "event RewardGranted(address indexed student, uint256 amount)",
  "event RewardClaimed(address indexed student, uint256 amount)",
];

// Chain ID jaringan yang diharapkan.
// 31337n = Hardhat localhost  |  11155111n = Sepolia testnet
export const EXPECTED_CHAIN_ID = 31337n;
