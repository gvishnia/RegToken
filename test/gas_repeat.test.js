const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Gas repeat workload", function () {
  async function deployRegTokenFixture() {
    const RegToken = await ethers.getContractFactory("RegToken");
    const regToken = await RegToken.deploy();
    const [brokerA, exchangeA, brokerB, exchangeB ] = await ethers.getSigners();
    await regToken.deployed();
    return { regToken, brokerA, exchangeA, brokerB, exchangeB };
  }

  it("mixed workload: mint, transfer, update, periodic match", async function () {
    const { regToken, brokerA, exchangeA, brokerB } = await loadFixture(deployRegTokenFixture);
    const iterations = process.env.GAS_ITERATIONS ? parseInt(process.env.GAS_ITERATIONS, 10) : 100;

    for (let i = 0; i < iterations; i++) {
      const maker = (i % 2 === 0) ? brokerA : brokerB;
      const size = 1000 - (i % 250);

      await regToken.createRegToken(await maker.getAddress(), "Vodafone", "Vod.RGT", "Buy Vodafone RGT", size);
      const tokenCount = await regToken.GetTokenCount();
      const tokenId = tokenCount.toNumber() - 1;

      // transfer token from maker to exchangeA (connect when maker !== default signer)
      if ((await maker.getAddress()) === (await (await ethers.getSigner()).getAddress())) {
        await regToken.transferFrom(await maker.getAddress(), await exchangeA.getAddress(), tokenId);
      } else {
        await regToken.connect(maker).transferFrom(await maker.getAddress(), await exchangeA.getAddress(), tokenId);
      }

      // update metadata after transfer so metadata.owner reflects exchange
      await regToken.updateMetaData(tokenId, "Vodafone", "Vod.RGT", "Buy Vodafone RGT", size);

      // every 10 iterations create a second token and attempt a match on the exchange
      if (i % 10 === 0) {
        const otherMaker = (maker === brokerA) ? brokerB : brokerA;
        await regToken.createRegToken(await otherMaker.getAddress(), "Vodafone", "Vod.RGT", "Sell Vodafone RGT", Math.max(1, size - 100));
        const tokenCount2 = await regToken.GetTokenCount();
        const tokenId2 = tokenCount2.toNumber() - 1;
        if ((await otherMaker.getAddress()) === (await (await ethers.getSigner()).getAddress())) {
          await regToken.transferFrom(await otherMaker.getAddress(), await exchangeA.getAddress(), tokenId2);
        } else {
          await regToken.connect(otherMaker).transferFrom(await otherMaker.getAddress(), await exchangeA.getAddress(), tokenId2);
        }
        await regToken.updateMetaData(tokenId2, "Vodafone", "Vod.RGT", "Sell Vodafone RGT", Math.max(1, size - 100));

        // attempt match; no assertion — we only want gas profiling
        await regToken.matchOrders(await exchangeA.getAddress(), tokenId, await exchangeA.getAddress(), tokenId2);
      }
    }

    const finalCount = await regToken.GetTokenCount();
    expect(finalCount.toNumber()).to.be.greaterThanOrEqual(iterations + 1);
  }).timeout(0);
});
