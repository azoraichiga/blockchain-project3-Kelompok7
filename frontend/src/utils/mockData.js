// =============================================================
// MOCK DATA — sementara, sampai smart contract & Web3 siap.
// Anggota Web3: hapus file ini saat read/write asli sudah jalan.
// =============================================================

export const MOCK_ADDRESS = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

export const MOCK_STATE = {
  rewardAmount: 250, // dalam CRT (Course Reward Token)
  claimed: false,
  wrongNetwork: false,
  isAdmin: true, // set true untuk men-demo panel dosen; nanti dicek via contract.owner()
};

export const MOCK_HISTORY = [
  { type: "Reward granted", amount: 100, by: "Dosen", time: "2 hari lalu" },
  { type: "Reward granted", amount: 150, by: "Dosen", time: "kemarin" },
];

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
