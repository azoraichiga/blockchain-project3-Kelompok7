import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, EXPECTED_CHAIN_ID } from "../utils/contract";
import { friendlyError } from "../utils/helpers";

let toastId = 0;

/**
 * useContract — hook utama Web3 integration (Anggota 3)
 *
 * Membungkus semua logika:
 *   - Wallet connection (MetaMask)
 *   - Network detection
 *   - Read operations  : rewardAmount(addr), hasClaimed(addr)
 *   - Write operations : claim(), grantReward(addr, amount)
 *   - Event listening  : RewardGranted, RewardClaimed (real-time)
 *   - Toast notifications
 */
export function useContract() {
  const [account, setAccount]           = useState(null);
  const [isAdmin, setIsAdmin]           = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [claimed, setClaimed]           = useState(false);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [history, setHistory]           = useState([]);

  const [loadingRead, setLoadingRead]   = useState(false);
  const [txStatus, setTxStatus]         = useState("idle"); // idle | pending | success | failed
  const [grantStatus, setGrantStatus]   = useState("idle");
  const [error, setError]               = useState(null);

  // ── Toast ────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((message, kind = "info") => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  // ── Helper: dapatkan provider (read-only) ────────────────────
  const getProvider = () => new ethers.BrowserProvider(window.ethereum);

  // ── Helper: dapatkan contract instance ──────────────────────
  const getContract = async (withSigner = false) => {
    const provider = getProvider();
    if (withSigner) {
      const signer = await provider.getSigner();
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  };

  // ── READ OPERATIONS ──────────────────────────────────────────
  // Read #1: rewardAmount(addr)  — berapa ETH yang bisa diklaim student
  // Read #2: hasClaimed(addr)    — sudah klaim atau belum
  const readData = useCallback(async (addr) => {
    setLoadingRead(true);
    setError(null);
    try {
      const contract = await getContract();

      const [amount, did] = await Promise.all([
        contract.rewardAmount(addr),   // Read #1
        contract.hasClaimed(addr),     // Read #2
      ]);

      setRewardAmount(Number(ethers.formatEther(amount)));
      setClaimed(did);
    } catch (e) {
      console.error("readData error:", e);
      setError("Gagal membaca data dari blockchain.");
    } finally {
      setLoadingRead(false);
    }
  }, []);

  // ── WALLET CONNECTION ────────────────────────────────────────
  const connect = useCallback(async () => {
    setError(null);

    if (!window.ethereum) {
      setError("MetaMask tidak ditemukan. Silakan install MetaMask terlebih dahulu.");
      return;
    }

    try {
      // Minta akses akun
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const addr = accounts[0];

      // Cek network
      const provider = getProvider();
      const network  = await provider.getNetwork();
      const isWrong  = network.chainId !== EXPECTED_CHAIN_ID;
      setWrongNetwork(isWrong);

      if (isWrong) {
        setAccount(addr);
        setError("Jaringan salah! Ganti ke Hardhat Localhost (chainId 31337) di MetaMask.");
        return;
      }

      // Cek apakah user adalah owner/admin (dosen)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const ownerAddr = await contract.owner();
      setIsAdmin(ownerAddr.toLowerCase() === addr.toLowerCase());

      setAccount(addr);

      // Baca data awal
      await readData(addr);
    } catch (e) {
      console.error("connect error:", e);
      setError(friendlyError(e));
    }
  }, [readData]);

  // ── WRITE #1: CLAIM (mahasiswa) ──────────────────────────────
  const claim = useCallback(async () => {
    setError(null);
    setTxStatus("pending");
    try {
      const contract = await getContract(true); // butuh signer
      const tx = await contract.claim();

      pushToast("Transaksi dikirim, menunggu konfirmasi...", "info");
      await tx.wait(); // tunggu 1 konfirmasi block

      setClaimed(true);
      setTxStatus("success");
      pushToast(`Reward berhasil diklaim! 🎉`, "success");

      // Refresh data setelah claim
      if (account) await readData(account);
    } catch (e) {
      console.error("claim error:", e);
      setTxStatus("failed");
      setError(friendlyError(e));
    }
  }, [account, readData, pushToast]);

  // ── WRITE #2: GRANT REWARD (dosen/admin) ────────────────────
  const grantReward = useCallback(async (studentAddr, amount) => {
    setError(null);
    setGrantStatus("pending");
    try {
      // Validasi input
      if (!ethers.isAddress(studentAddr)) {
        throw new Error("Alamat mahasiswa tidak valid.");
      }
      if (Number(amount) <= 0) {
        throw new Error("Jumlah reward harus lebih dari 0.");
      }

      const contract  = await getContract(true); // butuh signer
      const amountWei = ethers.parseEther(String(amount));
      const tx        = await contract.grantReward(studentAddr, amountWei);

      pushToast("Transaksi grant reward dikirim...", "info");
      await tx.wait();

      setGrantStatus("success");
      pushToast(`Reward ${amount} ETH diberikan ke ${studentAddr.slice(0, 6)}…`, "success");

      // Tambah ke history lokal sambil nunggu event
      setHistory((h) => [
        { type: "Reward granted", amount: Number(amount), by: "Dosen", time: "baru saja" },
        ...h,
      ]);

      setTimeout(() => setGrantStatus("idle"), 3000);
    } catch (e) {
      console.error("grantReward error:", e);
      setGrantStatus("failed");
      setError(friendlyError(e));
    }
  }, [pushToast]);

  // ── EVENT LISTENING (real-time / Bonus) ─────────────────────
  // Dengarkan event dari contract; update history + toast otomatis
  useEffect(() => {
    if (!account) return;

    let contract;
    (async () => {
      try {
        contract = await getContract(); // read-only provider cukup untuk events

        const onGranted = (student, amount) => {
          const eth = Number(ethers.formatEther(amount));
          setHistory((h) => [
            { type: "Reward granted", amount: eth, by: "Dosen", time: "baru saja" },
            ...h,
          ]);
          pushToast(`Reward baru: ${eth} ETH untuk ${student.slice(0, 6)}…`, "info");
        };

        const onClaimed = (student, amount) => {
          const eth = Number(ethers.formatEther(amount));
          setHistory((h) => [
            { type: "Reward claimed", amount: eth, by: student.slice(0, 6), time: "baru saja" },
            ...h,
          ]);
          if (student.toLowerCase() !== account.toLowerCase()) {
            // Notifikasi hanya untuk klaim dari user lain
            pushToast(`Mahasiswa ${student.slice(0, 6)}… klaim ${eth} ETH`, "info");
          }
        };

        contract.on("RewardGranted", onGranted);
        contract.on("RewardClaimed", onClaimed);
      } catch (e) {
        console.error("Event listener error:", e);
      }
    })();

    // Cleanup: hapus listener saat component unmount atau account berubah
    return () => {
      if (contract) {
        contract.removeAllListeners("RewardGranted");
        contract.removeAllListeners("RewardClaimed");
      }
    };
  }, [account, pushToast]);

  // ── HANDLE ACCOUNT/NETWORK CHANGE dari MetaMask ─────────────
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // User disconnect wallet dari MetaMask
        setAccount(null);
        setIsAdmin(false);
        setRewardAmount(0);
        setClaimed(false);
        setHistory([]);
        setError(null);
      } else {
        // User ganti akun
        setAccount(accounts[0]);
        readData(accounts[0]);
      }
    };

    const handleChainChanged = () => {
      // Reload page saat network berubah (rekomendasi MetaMask)
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
    account,
    isAdmin,
    rewardAmount,
    claimed,
    wrongNetwork,
    history,
    loadingRead,
    txStatus,
    grantStatus,
    error,
    toasts,
    connect,
    claim,
    grantReward,
    dismissToast,
  };
}
