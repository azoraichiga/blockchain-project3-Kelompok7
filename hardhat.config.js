require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    // Hardhat Network bawaan (untuk testing)
    hardhat: {
      chainId: 1337,
    },

    // Local node (npx hardhat node)
    localhost: {
      url: "http://127.0.0.1:8546",
      chainId: 1337,
    },

    // Ganache (alternatif GUI)
    ganache: {
      url: "http://127.0.0.1:7545",
      chainId: 1337,
    },
  },

  // Gas reporter (opsional, muncul saat npx hardhat test)
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
};
