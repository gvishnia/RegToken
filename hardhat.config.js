try {
  require("dotenv").config();
} catch (e) {
  // dotenv not installed in this environment — continue without loading .env
}
require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-truffle4");
require("@nomicfoundation/hardhat-chai-matchers")
require("hardhat-gas-reporter");
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: false,
        runs: 200
      }
    }
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    gasPrice: 21,
    outputFile: 'gas-report.txt',
    noColors: true,
  }
  ,
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || process.env.RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    }
  }
};
