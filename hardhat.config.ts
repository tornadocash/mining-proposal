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
        url: process.env.ETH_RPC,
        blockNumber: 12197930,
      },
    },
    goerli: {
      url: process.env.ETH_RPC,
      accounts: process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY]
        : {
            mnemonic:
              "test test test test test test test test test test test junk",
          },
    },
  },
  mocha: {
    timeout: 600000000,
  },
};

export default config;
