import "@nomiclabs/hardhat-waffle";
import { ethers } from "hardhat";

const main = async () => {
  const Proposal = await ethers.getContractFactory("ProposalSetMiningRates");
  const proposal = await Proposal.deploy({
    gasPrice: Number(process.env.GAS_PRICE) * 10 ** 9,
  });
  console.log(`Deployed to ${proposal.address}`);
};

main();
