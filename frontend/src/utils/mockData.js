export const MOCK_ADDRESS = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

export const MOCK_STATE = {
  rewardAmount: 250,
  claimed: false,
  wrongNetwork: false,
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
