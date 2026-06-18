// =============================================================
// Diisi oleh anggota Smart Contract / Web3.
// Setelah deploy ke localhost: salin address dari output
// `npx hardhat run scripts/deploy.js --network localhost`
// ke CONTRACT_ADDRESS di bawah ini.
//
// ABI ini disinkronkan dengan contracts/CourseReward.sol versi
// dari anggota Smart Contract (bukan versi draft sebelumnya).
// Kontrak ini BERBEDA dari draft awal — reward berupa ETH
// sungguhan (lewat transfer), bukan poin. Catatan penting:
//   - amount di grantReward() dan rewardAmount dalam satuan WEI.
//   - claimReward() akan GAGAL kalau kontrak belum diisi saldo
//     lewat fund() atau saat deploy (constructor payable).
//   - Ada deadline (claimDeadline) dan status aktif (isActive)
//     yang bisa membuat claim gagal walau reward tersedia.
// =============================================================

export const CONTRACT_ADDRESS = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";

export const CONTRACT_ABI = [
  // --- READ ---
  "function owner() view returns (address)",
  "function isActive() view returns (bool)",
  "function claimDeadline() view returns (uint256)",
  "function rewardAmount(address) view returns (uint256)",
  "function hasClaimed(address) view returns (bool)",
  "function whitelist(address) view returns (bool)",
  // mengembalikan (hasClaimed, isWhitelisted, rewardAmount) sekaligus
  "function getStudentInfo(address student) view returns (bool, bool, uint256)",
  "function getBalance() view returns (uint256)",
  "function getClaimersCount() view returns (uint256)",
  "function getAllClaimers() view returns (address[])",
  "function isDeadlinePassed() view returns (bool)",
  // --- WRITE ---
  "function claimReward()",
  "function grantReward(address student, uint256 amount)",
  "function fund() payable",
  "function withdraw()",
  "function setContractActive(bool status)",
  "function setDeadline(uint256 durationDays)",
  // --- EVENTS ---
  "event RewardGranted(address indexed student, uint256 amount)",
  "event RewardClaimed(address indexed student, uint256 amount)",
  "event ContractStatusChanged(bool status)",
  "event FundReceived(address indexed sender, uint256 amount)",
  "event Withdrawn(address indexed owner, uint256 amount)",
];

// Network yang diharapkan (Hardhat localhost). Ganti ke Sepolia (11155111) jadi bonus.
export const EXPECTED_CHAIN_ID = 31337n;
