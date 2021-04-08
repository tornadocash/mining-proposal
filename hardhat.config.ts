import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.6.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      gasPrice: 0,
      chainId: 1,
      forking: {
        url: process.env.ETH_RPC_MAINNET,
        blockNumber: 12197930,
      },
    },
  },
  mocha: {
    timeout: 600000000,
  },
};

export default config;
