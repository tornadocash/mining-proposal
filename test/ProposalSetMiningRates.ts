//SPDX-License-Identifier: MIT

import "@nomiclabs/hardhat-waffle";
import { expect } from "chai";
import { ethers } from "hardhat";
import GovernanceAbi from "../contracts/external/governance";
import TornAbi from "../contracts/external/torn";
import { advanceTime, getSignerFromAddress } from "./utils";

describe("Enable proposal", () => {
  // Live TORN contract
  const tornToken = "0x77777FeDdddFfC19Ff86DB637967013e6C6A116C";
  // Live governance contract
  const governanceAddress = "0x5efda50f22d34F262c29268506C5Fa42cB56A1Ce";
  // TORN whale to vote with 25k votes
  const tornWhale = "0x5f48c2a71b2cc96e3f0ccae4e39318ff0dc375b2";

  const torn25k = ethers.utils.parseEther("25000");

  it("Should execute proposal and allow transfers", async () => {
    // This test is forking the mainnet state

    // Proposal contract
    const Proposal = await ethers.getContractFactory("ProposalSetMiningRates");

    // Get Tornado governance contract
    let governance = await ethers.getContractAt(GovernanceAbi, governanceAddress);

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

    // todo test mining
  });
});
