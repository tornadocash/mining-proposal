//SPDX-License-Identifier: MIT

import "@nomiclabs/hardhat-waffle";
import { expect } from "chai";
import { ethers } from "hardhat";
import GovernanceAbi from "../contracts/external/governance";
import TornAbi from "../contracts/external/torn";
import { advanceTime, getSignerFromAddress } from "./utils";
const tornadoProxyAbi = require("../abi/tornadoProxy.json");
const minerAbi = require("../abi/miner.json");

const rates = {
  "0xD4B88Df4D29F5CedD6857912842cff3b20C8Cfa3": 2, // dai-100.tornadocash.eth
  "0xFD8610d20aA15b7B2E3Be39B396a1bC3516c7144": 10, // dai-1000.tornadocash.eth
  "0x07687e702b410Fa43f4cB4Af7FA097918ffD2730": 40, // dai-10000.tornadocash.eth
  "0x23773E65ed146A459791799d01336DB287f25334": 250, // dai-100000.tornadocash.eth
  "0x22aaA7720ddd5388A3c0A3333430953C68f1849b": 2, // cdai-5000.tornadocash.eth
  "0x03893a7c7463AE47D46bc7f091665f1893656003": 10, // cdai-50000.tornadocash.eth
  "0x2717c5e28cf931547B621a5dddb772Ab6A35B701": 40, // cdai-500000.tornadocash.eth
  "0xD21be7248e0197Ee08E0c20D4a96DEBdaC3D20Af": 250, // cdai-5000000.tornadocash.eth
  "0x178169B423a011fff22B9e3F3abeA13414dDD0F1": 15, // wbtc-01.tornadocash.eth
  "0x610B717796ad172B316836AC95a2ffad065CeaB4": 120, // wbtc-1.tornadocash.eth
  "0xbB93e510BbCD0B7beb5A853875f9eC60275CF498": 1000, // wbtc-10.tornadocash.eth
  "0x12D66f87A04A9E220743712cE6d9bB1B5616B8Fc": 4, // eth-01.tornadocash.eth
  "0x47CE0C6eD5B0Ce3d3A51fdb1C52DC66a7c3c2936": 20, // eth-1.tornadocash.eth
  "0x910Cbd523D972eb0a6f4cAe4618aD62622b39DbF": 50, // eth-10.tornadocash.eth
  "0xA160cdAB225685dA1d56aa342Ad8841c3b53f291": 400, // eth-100.tornadocash.eth
};

const enabled = {
  "0xd96f2B1c14Db8458374d9Aca76E26c3D18364307": 0, // usdc-100.tornadocash.eth
  "0x4736dCf1b7A3d580672CcE6E7c65cd5cc9cFBa9D": 0, // usdc-1000.tornadocash.eth
  "0x169AD27A470D064DEDE56a2D3ff727986b15D52B": 0, // usdt-100.tornadocash.eth
  "0x0836222F2B2B24A3F36f98668Ed8F0B38D1a872f": 0, // usdt-1000.tornadocash.eth
};

const state = Object.freeze({ DISABLED: 0, ENABLED: 1, MINEABLE: 2 });

describe("Enable proposal", () => {
  // Live TORN contract
  const tornToken = "0x77777FeDdddFfC19Ff86DB637967013e6C6A116C";
  // Live governance contract
  const governanceAddress = "0x5efda50f22d34F262c29268506C5Fa42cB56A1Ce";
  // TORN whale to vote with 25k votes
  const tornWhale = "0x5f48c2a71b2cc96e3f0ccae4e39318ff0dc375b2";

  let tornadoProxy, miner;
  const proxyStateBefore = {};

  const torn25k = ethers.utils.parseEther("25000");

  before(async () => {
    tornadoProxy = await ethers.getContractAt(
      tornadoProxyAbi,
      "0x722122dF12D4e14e13Ac3b6895a86e84145b6967"
    );
    miner = await ethers.getContractAt(
      minerAbi,
      "0x746Aebc06D2aE31B71ac51429A19D54E797878E9"
    );

    for (let [instance] of Object.entries(rates)) {
      proxyStateBefore[instance] = await tornadoProxy.instances(instance);
    }
    for (let [instance] of Object.entries(enabled)) {
      proxyStateBefore[instance] = await tornadoProxy.instances(instance);
    }

    // Proposal contract
    const Proposal = await ethers.getContractFactory("ProposalSetMiningRates");

    // Get Tornado governance contract
    let governance = await ethers.getContractAt(
      GovernanceAbi,
      governanceAddress
    );

    // Get TORN token contract
    let torn = await ethers.getContractAt(TornAbi, tornToken);

    // Impersonate a TORN address with more than 25k tokens
    const tornWhaleSigner = await getSignerFromAddress(tornWhale);
    torn = torn.connect(tornWhaleSigner);
    governance = governance.connect(tornWhaleSigner);

    // Deploy the proposal
    const proposal = await Proposal.deploy();

    // Lock 25k TORN in governance
    await torn.approve(governance.address, torn25k);
    await governance.lockWithApproval(torn25k);

    // Propose
    await governance.propose(proposal.address, "Enable anonymity mining");
    const proposalId = await governance.proposalCount();

    // Wait the voting delay and vote for the proposal
    await advanceTime((await governance.VOTING_DELAY()).toNumber() + 1);
    await governance.castVote(proposalId, true);

    // Wait voting period + execution delay
    await advanceTime(
      (await governance.VOTING_PERIOD()).toNumber() +
        (await governance.EXECUTION_DELAY()).toNumber()
    );

    // Execute the proposal
    await governance.execute(proposalId);
  });

  it("should set new rates", async () => {
    for (let [instance, rate] of Object.entries(rates)) {
      const rateFromContract = await miner.rates(instance);
      expect(rateFromContract).to.be.equal(rate);

      const instanceStateFromContact = await tornadoProxy.instances(instance);
      const instanceStateBefore = proxyStateBefore[instance];
      expect(instanceStateFromContact.isERC20).to.be.equal(
        instanceStateBefore.isERC20
      );
      expect(instanceStateFromContact.token).to.be.equal(
        instanceStateBefore.token
      );
      expect(instanceStateFromContact.state).to.be.equal(state.MINEABLE);
    }

    for (let [instance, rate] of Object.entries(enabled)) {
      const rateFromContract = await miner.rates(instance);
      expect(rateFromContract).to.be.equal(rate);

      const instanceStateFromContact = await tornadoProxy.instances(instance);
      const instanceStateBefore = proxyStateBefore[instance];
      expect(instanceStateFromContact.isERC20).to.be.equal(
        instanceStateBefore.isERC20
      );
      expect(instanceStateFromContact.token).to.be.equal(
        instanceStateBefore.token
      );
      expect(instanceStateFromContact.state).to.be.equal(state.ENABLED);
    }
  });
});
