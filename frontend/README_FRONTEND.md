# Course Reward dApp — Frontend

Tampilan frontend (React + Vite + Tailwind) untuk Course Reward dApp.
Saat ini berjalan dengan **MOCK data** sehingga bisa di-demo tanpa smart contract.

## Cara jalankan
```bash
cd frontend
npm install
npm run dev
```
Buka http://localhost:5173

## Yang sudah ada
- ConnectWallet, RewardCard, ClaimAction, RewardHistory (4 komponen)
- 2 read ops: reward amount + status klaim
- 1 write op: claim reward (tambah 1 lagi nanti, mis. admin grant)
- Loading states: skeleton (read) + spinner (write pending)
- Error handling user-friendly + network warning + account display
- Responsive (mobile-friendly)

## Titik integrasi Web3 (untuk Anggota 3)
Semua logika ada di `src/hooks/useContract.js`. Cari komentar `TODO(Web3)`:
1. `connect()` — request akun + cek network
2. `readData()` — panggil `getRewardAmount` & `hasClaimed`
3. `claim()` — kirim tx `claimReward()` lalu `tx.wait()`

Isi `src/utils/contract.js` dengan CONTRACT_ADDRESS & ABI hasil deploy.
Hapus `src/utils/mockData.js` setelah read/write asli jalan.
`ethers` sudah masuk dependency, tinggal di-uncomment importnya.
