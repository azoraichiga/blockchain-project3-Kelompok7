import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, EXPECTED_CHAIN_ID } from "../utils/contract";
import { friendlyError } from "../utils/helpers";

let toastId = 0;

/**
 * Hook ini membungkus semua logika wallet + kontrak.
 * SUDAH terhubung sungguhan ke contracts/CourseReward.sol via ethers.js
 * (bukan mock lagi) — diuji terhadap kontrak yang di-deploy di
 * Hardhat localhost, address di utils/contract.js.
 *
 * Catatan penting soal kontrak (dibuat oleh anggota Smart Contract):
 *   - claimReward() mentransfer ETH SUNGGUHAN ke mahasiswa, bukan
 *     cuma menandai poin. amount dalam satuan wei.
 *   - Tidak ada getRewardAmount()/getClaimStatus() terpisah.
 *     Gunakan getStudentInfo(address) yang mengembalikan
 *     (hasClaimed, isWhitelisted, rewardAmount) sekaligus.
 *   - Ada isActive (status program) dan claimDeadline (batas waktu)
 *     yang bisa membuat claim gagal walau reward tersedia.
 *   - claimReward() butuh saldo ETH di kontrak (lihat fundContract).
 */
export function useContract() {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [wrongNetwork, setWrongNetwork] = useState(false);

  // ---- Data dari getStudentInfo() + state kontrak lain ----
  const [rewardAmount, setRewardAmount] = useState(0);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [claimDeadline, setClaimDeadline] = useState(0);
  const [contractBalance, setContractBalance] = useState(0);

  const [history, setHistory] = useState([]);

  const [loadingRead, setLoadingRead] = useState(false);
  const [txStatus, setTxStatus] = useState("idle"); // idle | pending | success | failed
  const [grantStatus, setGrantStatus] = useState("idle");
  const [fundStatus, setFundStatus] = useState("idle");
  const [error, setError] = useState(null);

  // ---- TOAST NOTIFICATIONS (untuk event real-time) ----
  const [toasts, setToasts] = useState([]);
  const pushToast = useCallback((message, kind = "info") => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4000);
  }, []);
  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const addHistory = useCallback((entry) => {
    setHistory((h) => [entry, ...h]);
  }, []);

  // ---- READ OPERATIONS ----
  // Membaca getStudentInfo (gabungan 3 nilai), isActive, claimDeadline,
  // dan getBalance() kontrak — semua dipakai untuk menentukan apakah
  // tombol claim boleh aktif dan kenapa kalau tidak.
  const readData = useCallback(async (addr) => {
    setLoadingRead(true);
    setError(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const [claimed, whitelisted, amount] = await contract.getStudentInfo(addr);
      const active = await contract.isActive();
      const deadline = await contract.claimDeadline();
      const balance = await contract.getBalance();
      setHasClaimed(claimed);
      setIsWhitelisted(whitelisted);
      setRewardAmount(Number(ethers.formatEther(amount)));
      setIsActive(active);
      setClaimDeadline(Number(deadline));
      setContractBalance(Number(ethers.formatEther(balance)));
      // Riwayat TIDAK direset di sini — diisi murni dari event listener
      // (RewardGranted/RewardClaimed) di bagian bawah hook ini, supaya
      // tidak menimpa riwayat yang sudah terkumpul selama sesi berjalan.
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoadingRead(false);
    }
  }, []);

  // ---- WALLET CONNECTION ----
  const connect = useCallback(async () => {
    setError(null);
    if (!window.ethereum) {
      setError("MetaMask tidak ditemukan. Pastikan extension terinstall.");
      return;
    }
    try {
      // Minta MetaMask membuka popup connect & mengembalikan akun yang dipilih user.
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const addr = accounts[0];
      setAccount(addr);

      // provider = "jendela baca" ke blockchain (tidak butuh tanda tangan).
      const provider = new ethers.BrowserProvider(window.ethereum);
      const net = await provider.getNetwork();
      setWrongNetwork(net.chainId !== EXPECTED_CHAIN_ID);

      // Cek apakah akun yang connect adalah owner (dosen) kontrak.
      // Dibungkus try-catch terpisah supaya kegagalan di sini tidak
      // menghentikan readData() — admin check adalah nice-to-have,
      // bukan syarat untuk menampilkan data mahasiswa.
      try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        const ownerAddr = await contract.owner();
        setIsAdmin(ownerAddr.toLowerCase() === addr.toLowerCase());
      } catch (ownerErr) {
        console.warn("[useContract] owner() check failed, defaulting isAdmin=false:", ownerErr?.message);
        setIsAdmin(false);
      }

      // Selalu panggil readData, bahkan kalau owner() gagal.
      await readData(addr);
    } catch (e) {
      console.error("[useContract] connect() error:", e);
      setError(friendlyError(e));
    }
  }, [readData]);

  // ---- WRITE #1: CLAIM (mahasiswa) ----
  // Kontrak akan menolak (revert) kalau: !isActive, lewat deadline,
  // belum di-whitelist, sudah pernah claim, atau saldo kontrak kurang.
  // Semua pesan itu sudah dipetakan di helpers.friendlyError().
  const claim = useCallback(async () => {
    setError(null);
    setTxStatus("pending");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.claimReward();
      pushToast("Transaksi dikirim, menunggu konfirmasi…", "info");
      await tx.wait();

      setHasClaimed(true);
      setTxStatus("success");
      pushToast(`Reward ${rewardAmount} ETH berhasil diklaim`, "success");

      // Refresh saldo kontrak juga, karena claim mengurangi address(this).balance.
      if (account) await readData(account);
    } catch (e) {
      setTxStatus("failed");
      setError(friendlyError(e)); // kontrak punya banyak require() spesifik (deadline, whitelist, dst)
    }
  }, [rewardAmount, addHistory, pushToast, account, readData]);

  // ---- WRITE #2: GRANT REWARD (dosen/admin) ----
  // amount yang dikirim ke kontrak harus dalam WEI, bukan ETH biasa.
  const grantReward = useCallback(async (studentAddr, amountEth) => {
    setError(null);
    setGrantStatus("pending");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      // Kontrak menyimpan amount dalam wei, jadi angka ETH dari form
      // (misal "0.05") harus dikonversi dulu.
      const amountWei = ethers.parseEther(String(amountEth));
      const tx = await contract.grantReward(studentAddr, amountWei);
      pushToast("Transaksi dikirim, menunggu konfirmasi…", "info");
      await tx.wait(); // tunggu transaksi benar-benar masuk blok & terkonfirmasi

      setGrantStatus("success");
      pushToast(`Memberi ${amountEth} ETH ke ${studentAddr.slice(0, 6)}…`, "success");
      setTimeout(() => setGrantStatus("idle"), 2500);

      // Refresh data kalau yang diberi reward adalah akun yang sedang connect
      // (mis. dosen sedang mengetes dengan akun sendiri).
      if (account && studentAddr.toLowerCase() === account.toLowerCase()) {
        await readData(account);
      }
    } catch (e) {
      setGrantStatus("failed");
      setError(friendlyError(e));
    }
  }, [addHistory, pushToast, account, readData]);

  // ---- WRITE #3 (admin): FUND CONTRACT ----
  // Kontrak menyimpan saldo ETH-nya sendiri untuk membayar klaim
  // (lihat claimReward -> payable transfer). Tanpa ini, semua klaim
  // akan gagal dengan "Insufficient contract balance".
  const fundContract = useCallback(async (amountEth) => {
    setError(null);
    setFundStatus("pending");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      // fund() adalah fungsi payable: ETH dikirim lewat { value: ... },
      // bukan lewat parameter biasa.
      const tx = await contract.fund({ value: ethers.parseEther(String(amountEth)) });
      pushToast("Transaksi dikirim, menunggu konfirmasi…", "info");
      await tx.wait();

      setFundStatus("success");
      pushToast(`Kontrak ditambah dana ${amountEth} ETH`, "success");
      setTimeout(() => setFundStatus("idle"), 2500);

      // Refresh saldo kontrak supaya panel admin langsung akurat.
      if (account) await readData(account);
    } catch (e) {
      setFundStatus("failed");
      setError(friendlyError(e));
    }
  }, [pushToast, account, readData]);

  // ---- EVENT LISTENING (real-time) ----
  // Mendengarkan event RewardGranted & RewardClaimed langsung dari kontrak.
  // pollingInterval diset 4000ms (default terlalu cepat untuk Hardhat localhost
  // dan menyebabkan MetaMask rate-limit dirinya sendiri, menolak semua call
  // termasuk owner() dan readData()).
  useEffect(() => {
    if (!account) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    provider.pollingInterval = 4000; // kurangi eth_newFilter spam ke MetaMask
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    const onGranted = (student, amount) => {
      addHistory({
        type: "Reward granted",
        amount: Number(ethers.formatEther(amount)),
        by: "Dosen",
        time: "baru saja",
      });
      pushToast(`Reward baru: ${ethers.formatEther(amount)} ETH untuk ${student.slice(0, 6)}…`, "info");
    };
    const onClaimed = (student, amount) => {
      addHistory({
        type: "Reward claimed",
        amount: Number(ethers.formatEther(amount)),
        by: student.toLowerCase() === account.toLowerCase() ? "Kamu" : "Mahasiswa",
        time: "baru saja",
      });
      pushToast(`Klaim terkonfirmasi: ${ethers.formatEther(amount)} ETH`, "success");
    };

    contract.on("RewardGranted", onGranted);
    contract.on("RewardClaimed", onClaimed);

    // Cleanup WAJIB: kalau tidak dilepas, setiap kali komponen re-render
    // listener lama menumpuk dan event yang sama bisa terdengar berkali-kali.
    return () => {
      contract.off("RewardGranted", onGranted);
      contract.off("RewardClaimed", onClaimed);
    };
  }, [account, addHistory, pushToast]);

  // ---- HANDLE PERUBAHAN AKUN/NETWORK LANGSUNG DARI METAMASK ----
  // Tanpa ini, kalau user ganti akun atau ganti network lewat MetaMask
  // (bukan lewat tombol Connect di UI kita), state di aplikasi jadi basi
  // — masih menampilkan data akun lama padahal MetaMask sudah pindah.
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // User disconnect semua akun dari MetaMask untuk situs ini.
        setAccount(null);
        setIsAdmin(false);
        setRewardAmount(0);
        setHasClaimed(false);
        setIsWhitelisted(false);
        setHistory([]);
        setError(null);
      } else {
        // User ganti ke akun lain — sinkronkan ulang.
        setAccount(accounts[0]);
        readData(accounts[0]);
      }
    };

    const handleChainChanged = () => {
      // Reload halaman saat network berubah — ini rekomendasi resmi
      // MetaMask sendiri, karena provider/signer lama bisa jadi tidak
      // valid lagi setelah pindah network.
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [readData]);

  return {
    account, isAdmin, wrongNetwork,
    rewardAmount, hasClaimed, isWhitelisted, isActive, claimDeadline, contractBalance,
    history,
    loadingRead, txStatus, grantStatus, fundStatus, error, toasts,
    connect, claim, grantReward, fundContract, dismissToast,
  };
}
