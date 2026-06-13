# Course Reward dApp

Aplikasi web (dApp) untuk sistem reward mahasiswa berbasis blockchain. Mahasiswa dapat menghubungkan wallet MetaMask, melihat jumlah reward, dan melakukan klaim. Dosen dapat memberikan reward ke alamat mahasiswa melalui panel admin.

## Anggota Kelompok

| NRP        | Nama                | Kontribusi     |
| ---------- | ------------------- | -------------- |
| 5002221162 | Brigitta Lucia O H  | Smart Contract |
| 5025221100 | Riyanda C Sinambela | Frontend UI/UX |
|            |                     | Integrasi Web3 |

## Tech Stack

- Frontend: React + Vite
- Smart Contract: Solidity + Hardhat
- Web3 Library: ethers.js
- Wallet: MetaMask
- Styling: Tailwind CSS

## Fitur

- [ ] Connect Wallet (MetaMask)
- [ ] Lihat reward amount (read)
- [ ] Lihat status klaim (read)
- [ ] Claim reward (write)
- [ ] Grant reward via panel dosen (write)
- [ ] Notifikasi real-time via events
- [ ] Riwayat transaksi

## Cara Menjalankan

### Prerequisites

- Node.js v18+
- MetaMask browser extension
- Git

### 1. Clone Repository

```bash
git clone https://github.com/azoraichiga/blockchainFP
cd blockchainFP
```

### 2. Install Dependencies

```bash
npm install

cd frontend
npm install
```

### 3. Jalankan Local Blockchain

```bash
npx hardhat node
```

### 4. Deploy Smart Contract

```bash
# Di terminal baru
npx hardhat run scripts/deploy.js --network localhost
```

### 5. Update Contract Address

Salin address dari output deploy, lalu tempel ke `frontend/src/utils/contract.js`.

### 6. Import Account ke MetaMask

Salin private key dari output Hardhat node, import ke MetaMask, lalu ganti network ke Localhost 8545.

### 7. Jalankan Frontend

```bash
cd frontend
npm run dev
```

### 8. Buka Browser

http://localhost:5173

## Contract Address

- Local:
- Testnet (opsional):

## Demo

<!-- Link video demo  -->

## Screenshot

<!-- Screenshot aplikasi -->
