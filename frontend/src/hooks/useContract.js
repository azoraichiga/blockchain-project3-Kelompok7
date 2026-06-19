import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, EXPECTED_CHAIN_ID } from "../utils/contract";
import { friendlyError } from "../utils/helpers";

let toastId = 0;

/**
 * Hook ini membungkus semua logika wallet + kontrak.
 * Terhubung ke contracts/CourseReward.sol via ethers.js + MetaMask.
 *
 * Arsitektur:
 *   - READ  → BrowserProvider (MetaMask) untuk eth_call
 *   - WRITE → BrowserProvider + getSigner() untuk sign & send
 *   - Event listener DIHAPUS (contract.on menyebabkan eth_newFilter spam
 *     → MetaMask rate-limit dirinya → semua call gagal). Riwayat diisi
 *     secara manual setelah setiap transaksi berhasil dikonfirmasi.
 */
export function useContract() {
  const [account, setAccount]         = useState(null);
  const [isAdmin, setIsAdmin]         = useState(false);
  const [wrongNetwork, setWrongNetwork] = useState(false);

  // ---- Data dari kontrak ----
  const [rewardAmount, setRewardAmount]     = useState(0);
  const [hasClaimed, setHasClaimed]         = useState(false);
  const [isWhitelisted, setIsWhitelisted]   = useState(false);
  const [isActive, setIsActive]             = useState(true);
  const [claimDeadline, setClaimDeadline]   = useState(0);
  const [contractBalance, setContractBalance] = useState(0);

  const [history, setHistory] = useState([]);

  const [loadingRead, setLoadingRead]   = useState(false);
  const [txStatus, setTxStatus]         = useState("idle");
  const [grantStatus, setGrantStatus]   = useState("idle");
  const [fundStatus, setFundStatus]     = useState("idle");
  const [error, setError]               = useState(null);

  // ---- TOAST NOTIFICATIONS ----
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

  // ---- HELPER: buat provider + contract read-only ----
  // Kita bypass MetaMask untuk operasi BACA (read-only) dengan langsung tembak ke RPC node kita.
  // Ini mencegah bug MetaMask cache yang mengembalikan 0x (BAD_DATA) padahal kontraknya ada.
  const getProvider = useCallback(() => new ethers.JsonRpcProvider("http://127.0.0.1:8546"), []);
  
  // Provider untuk WRITE (transaksi) tetap harus lewat MetaMask
  const getSignerProvider = useCallback(() => new ethers.BrowserProvider(window.ethereum), []);

  // ---- READ OPERATIONS ----
  const readData = useCallback(async (addr) => {
    setLoadingRead(true);
    setError(null);
    try {
      const provider = getProvider();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const [claimed, whitelisted, amount] = await contract.getStudentInfo(addr);
      const active   = await contract.isActive();
      const deadline = await contract.claimDeadline();
      const balance  = await contract.getBalance();

      setHasClaimed(claimed);
      setIsWhitelisted(whitelisted);
      setRewardAmount(Number(ethers.formatEther(amount)));
      setIsActive(active);
      setClaimDeadline(Number(deadline));
      setContractBalance(Number(ethers.formatEther(balance)));
    } catch (e) {
      console.error("[useContract] readData() error:", e);
      setError(`readData Error: ${e.message}`);
    } finally {
      setLoadingRead(false);
    }
  }, [getProvider]);

  // ---- WALLET CONNECTION ----
  const connect = useCallback(async () => {
    setError(null);
    if (!window.ethereum) {
      setError("MetaMask tidak ditemukan. Pastikan extension terinstall.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const addr = accounts[0];
      setAccount(addr);

      const provider = getProvider();
      
      // Menggunakan request langsung ke MetaMask untuk menghindari bug ethers.js (NETWORK_ERROR)
      const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
      const currentChainId = BigInt(chainIdHex);
      setWrongNetwork(currentChainId !== EXPECTED_CHAIN_ID);

      // Cek admin — kalau gagal, lanjut saja (isAdmin tetap false)
      try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        const ownerAddr = await contract.owner();
        setIsAdmin(ownerAddr.toLowerCase() === addr.toLowerCase());
      } catch (ownerErr) {
        console.warn("[useContract] owner() failed:", ownerErr?.message);
        setIsAdmin(false);
      }

      await readData(addr);

      // Otomatis minta MetaMask untuk pindah ke Chain ID 1337 jika salah
      if (currentChainId !== EXPECTED_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x539' }], // 1337 dalam Hex
          });
        } catch (switchError) {
          console.warn("Gagal switch network otomatis:", switchError);
        }
      }

    } catch (e) {
      console.error("[useContract] connect() error:", e);
      setError(`Error connecting: ${e.message}. (Contract: ${CONTRACT_ADDRESS}, Chain: ${EXPECTED_CHAIN_ID})`);
    }
  }, [getProvider, readData]);

  // ---- WRITE #1: CLAIM (mahasiswa) ----
  const claim = useCallback(async () => {
    setError(null);
    setTxStatus("pending");
    try {
      const provider = getSignerProvider();
      const signer   = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.claimReward();
      pushToast("Transaksi dikirim, menunggu konfirmasi…", "info");
      await tx.wait();

      setHasClaimed(true);
      setTxStatus("success");
      pushToast(`Reward ${rewardAmount} ETH berhasil diklaim`, "success");
      addHistory({
        type: "Reward claimed",
        amount: rewardAmount,
        by: "Kamu",
        time: "baru saja",
      });

      if (account) await readData(account);
    } catch (e) {
      setTxStatus("failed");
      setError(friendlyError(e));
    }
  }, [getProvider, rewardAmount, pushToast, addHistory, account, readData]);

  // ---- WRITE #2: GRANT REWARD (dosen/admin) ----
  const grantReward = useCallback(async (studentAddr, amountEth) => {
    setError(null);
    setGrantStatus("pending");
    try {
      const provider   = getSignerProvider();
      const signer     = await provider.getSigner();
      const contract   = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const amountWei  = ethers.parseEther(String(amountEth));
      const tx = await contract.grantReward(studentAddr, amountWei);
      pushToast("Transaksi dikirim, menunggu konfirmasi…", "info");
      await tx.wait();

      setGrantStatus("success");
      pushToast(`Memberi ${amountEth} ETH ke ${studentAddr.slice(0, 6)}…`, "success");
      addHistory({
        type: "Reward granted",
        amount: Number(amountEth),
        by: "Dosen",
        time: "baru saja",
      });
      setTimeout(() => setGrantStatus("idle"), 2500);

      if (account && studentAddr.toLowerCase() === account.toLowerCase()) {
        await readData(account);
      }
    } catch (e) {
      setGrantStatus("failed");
      setError(friendlyError(e));
    }
  }, [getProvider, pushToast, addHistory, account, readData]);

  // ---- WRITE #3: FUND CONTRACT (admin) ----
  const fundContract = useCallback(async (amountEth) => {
    setError(null);
    setFundStatus("pending");
    try {
      const provider = getSignerProvider();
      const signer   = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.fund({ value: ethers.parseEther(String(amountEth)) });
      pushToast("Transaksi dikirim, menunggu konfirmasi…", "info");
      await tx.wait();

      setFundStatus("success");
      pushToast(`Kontrak ditambah dana ${amountEth} ETH`, "success");
      addHistory({
        type: "Contract funded",
        amount: Number(amountEth),
        by: "Dosen",
        time: "baru saja",
      });
      setTimeout(() => setFundStatus("idle"), 2500);

      if (account) await readData(account);
    } catch (e) {
      console.error("[useContract] fund() error:", e);
      setFundStatus("failed");
      setError(`Fund Error: ${e.message}`);
    }
  }, [getSignerProvider, pushToast, addHistory, account, readData]);

  // ---- HANDLE PERUBAHAN AKUN/NETWORK DARI METAMASK ----
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setIsAdmin(false);
        setRewardAmount(0);
        setHasClaimed(false);
        setIsWhitelisted(false);
        setHistory([]);
        setError(null);
      } else {
        setAccount(accounts[0]);
        readData(accounts[0]);
      }
    };

    const handleChainChanged = () => {
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
