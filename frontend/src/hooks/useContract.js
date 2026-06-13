import { useState, useCallback } from "react";
import { MOCK_ADDRESS, MOCK_STATE } from "../utils/mockData";

export function useContract() {
  const [account, setAccount] = useState(null);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [error, setError] = useState(null);

  // TODO(Web3): ganti dengan window.ethereum.request + ethers
  const connect = useCallback(async () => {
    setError(null);
    setAccount(MOCK_ADDRESS);
    setWrongNetwork(MOCK_STATE.wrongNetwork);
  }, []);

  return { account, wrongNetwork, error, connect };
}
