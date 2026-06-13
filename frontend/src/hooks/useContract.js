import { useState, useCallback } from "react";
import { MOCK_ADDRESS, MOCK_STATE, MOCK_HISTORY, sleep } from "../utils/mockData";

export function useContract() {
  const [account, setAccount] = useState(null);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [loadingRead, setLoadingRead] = useState(false);
  const [txStatus, setTxStatus] = useState("idle");
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  // ---- READ OPERATIONS (2) ----
  const readData = useCallback(async () => {
    setLoadingRead(true);
    setError(null);
    try {
      await sleep(900); // TODO(Web3): ganti dengan contract.getRewardAmount + hasClaimed
      setRewardAmount(MOCK_STATE.rewardAmount);
      setClaimed(MOCK_STATE.claimed);
      setHistory(MOCK_HISTORY);
    } catch (e) {
      setError("Gagal membaca data dari blockchain.");
    } finally {
      setLoadingRead(false);
    }
  }, []);

  const addHistory = useCallback((entry) => setHistory((h) => [entry, ...h]), []);

  // ---- WRITE #1: CLAIM ----
  const claim = useCallback(async () => {
    setError(null);
    setTxStatus("pending");
    try {
      await sleep(1600); // TODO(Web3): contract.claimReward() lalu tx.wait()
      if (Math.random() < 0.12) throw { code: 4001 }; // simulasi user reject
      setClaimed(true);
      setTxStatus("success");
      addHistory({ type: "Reward claimed", amount: rewardAmount, by: "Kamu", time: "baru saja" });
    } catch (e) {
      setTxStatus("failed");
      setError("Transaksi ditolak di MetaMask. Coba lagi.");
    }
  }, [rewardAmount, addHistory]);

  const connect = useCallback(async () => {
    setError(null);
    setAccount(MOCK_ADDRESS);
    setWrongNetwork(MOCK_STATE.wrongNetwork);
    await readData();
  }, [readData]);

  return { account, rewardAmount, claimed, wrongNetwork, loadingRead, txStatus, error, history, connect, claim };
}
