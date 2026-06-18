import { useState, useCallback, useEffect, useRef } from "react";
import { MOCK_ADDRESS, MOCK_STATE, MOCK_HISTORY, sleep } from "../utils/mockData";
// import { ethers } from "ethers"; // TODO(Web3): aktifkan saat integrasi
// import { CONTRACT_ADDRESS, CONTRACT_ABI, EXPECTED_CHAIN_ID } from "../utils/contract";
// import { friendlyError } from "../utils/helpers";

let toastId = 0;

/**
 * Hook ini membungkus semua logika wallet + kontrak.
 * Saat ini memakai MOCK. Tiap fungsi diberi tanda TODO(Web3)
 * agar tinggal diganti dengan panggilan ethers.js asli.
 */
export function useContract() {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [history, setHistory] = useState([]);

  const [loadingRead, setLoadingRead] = useState(false);
  const [txStatus, setTxStatus] = useState("idle"); // idle | pending | success | failed
  const [grantStatus, setGrantStatus] = useState("idle");
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

  // Tambah satu baris ke riwayat (dipanggil dari handler event).
  const addHistory = useCallback((entry) => {
    setHistory((h) => [entry, ...h]);
  }, []);

  // ---- READ OPERATIONS (2) ----
  const readData = useCallback(async (addr) => {
    setLoadingRead(true);
    setError(null);
    try {
      await sleep(900); // TODO(Web3): hapus; ganti dengan kontrak asli:
      // const provider = new ethers.BrowserProvider(window.ethereum);
      // const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      // const amount = await contract.getRewardAmount(addr);   // read #1
      // const did = await contract.hasClaimed(addr);           // read #2
      // setRewardAmount(Number(amount));
      // setClaimed(did);
      setRewardAmount(MOCK_STATE.rewardAmount);
      setClaimed(MOCK_STATE.claimed);
      setHistory(MOCK_HISTORY);
    } catch (e) {
      setError("Gagal membaca data dari blockchain.");
    } finally {
      setLoadingRead(false);
    }
  }, []);

  // ---- WALLET CONNECTION ----
  const connect = useCallback(async () => {
    setError(null);
    // TODO(Web3): ganti blok mock di bawah dengan kode asli:
    // if (!window.ethereum) { setError("MetaMask tidak ditemukan."); return; }
    // const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    // const addr = accounts[0];
    // setAccount(addr);
    // const provider = new ethers.BrowserProvider(window.ethereum);
    // const net = await provider.getNetwork();
    // setWrongNetwork(net.chainId !== EXPECTED_CHAIN_ID);
    // const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    // const owner = await contract.owner();              // cek admin/dosen
    // setIsAdmin(owner.toLowerCase() === addr.toLowerCase());
    const addr = MOCK_ADDRESS;
    setAccount(addr);
    setWrongNetwork(MOCK_STATE.wrongNetwork);
    setIsAdmin(MOCK_STATE.isAdmin);
    await readData(addr);
  }, [readData]);

  // ---- WRITE #1: CLAIM (mahasiswa) ----
  const claim = useCallback(async () => {
    setError(null);
    setTxStatus("pending");
    try {
      await sleep(1600); // TODO(Web3): ganti dengan kontrak asli:
      // const provider = new ethers.BrowserProvider(window.ethereum);
      // const signer = await provider.getSigner();
      // const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      // const tx = await contract.claimReward();
      // await tx.wait();
      if (Math.random() < 0.12) throw { code: 4001 }; // simulasi user reject
      setClaimed(true);
      setTxStatus("success");
      // Di dunia nyata baris ini TIDAK perlu — event listener yang akan
      // menambah riwayat + toast saat event RewardClaimed masuk.
      addHistory({ type: "Reward claimed", amount: rewardAmount, by: "Kamu", time: "baru saja" });
      pushToast(`Reward ${rewardAmount} CRT berhasil diklaim`, "success");
    } catch (e) {
      setTxStatus("failed");
      // setError(friendlyError(e)); // TODO(Web3): pakai ini
      setError("Transaksi ditolak di MetaMask. Coba lagi.");
    }
  }, [rewardAmount, addHistory, pushToast]);

  // ---- WRITE #2: GRANT REWARD (dosen/admin) ----
  const grantReward = useCallback(async (studentAddr, amount) => {
    setError(null);
    setGrantStatus("pending");
    try {
      await sleep(1500); // TODO(Web3): ganti dengan kontrak asli:
      // const provider = new ethers.BrowserProvider(window.ethereum);
      // const signer = await provider.getSigner();
      // const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      // const tx = await contract.grantReward(studentAddr, amount);  // hanya owner
      // await tx.wait();
      setGrantStatus("success");
      addHistory({ type: "Reward granted", amount: Number(amount), by: "Dosen", time: "baru saja" });
      pushToast(`Memberi ${amount} CRT ke ${studentAddr.slice(0, 6)}…`, "success");
      setTimeout(() => setGrantStatus("idle"), 2500);
    } catch (e) {
      setGrantStatus("failed");
      setError("Gagal memberi reward. Pastikan kamu admin & input benar.");
    }
  }, [addHistory, pushToast]);

  // ---- EVENT LISTENING (real-time) ----
  // TODO(Web3): ganti seluruh efek mock ini dengan listener kontrak asli:
  //   useEffect(() => {
  //     if (!account) return;
  //     const provider = new ethers.BrowserProvider(window.ethereum);
  //     const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  //     const onGranted = (user, amount) => {
  //       addHistory({ type: "Reward granted", amount: Number(amount), by: "Dosen", time: "baru saja" });
  //       pushToast(`Reward baru: ${Number(amount)} CRT`, "info");
  //     };
  //     const onClaimed = (user, amount) => {
  //       addHistory({ type: "Reward claimed", amount: Number(amount), by: "Mahasiswa", time: "baru saja" });
  //       pushToast(`Klaim terkonfirmasi: ${Number(amount)} CRT`, "success");
  //     };
  //     contract.on("RewardGranted", onGranted);
  //     contract.on("RewardClaimed", onClaimed);
  //     return () => { contract.off("RewardGranted", onGranted); contract.off("RewardClaimed", onClaimed); };
  //   }, [account]);
  //
  // --- Mock: simulasikan satu event masuk dari "user lain" setelah connect ---
  const ticked = useRef(false);
  useEffect(() => {
    if (!account || ticked.current) return;
    ticked.current = true;
    const t = setTimeout(() => {
      addHistory({ type: "Reward granted", amount: 50, by: "Dosen", time: "baru saja" });
      pushToast("Reward baru masuk: 50 CRT dari Dosen", "info");
    }, 5000);
    return () => clearTimeout(t);
  }, [account, addHistory, pushToast]);

  return {
    account, isAdmin, rewardAmount, claimed, wrongNetwork, history,
    loadingRead, txStatus, grantStatus, error, toasts,
    connect, claim, grantReward, dismissToast,
  };
}
