export const shortAddress = (addr) =>
  addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

export const formatCRT = (amount) => `${amount} CRT`;
