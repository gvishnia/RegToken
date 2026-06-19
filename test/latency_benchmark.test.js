const fs = require('fs');
const { expect } = require('chai');

describe('Latency benchmark: mint / transfer / match', function () {
  this.timeout(0);

  let RegToken;
  let reg;
  let owner, brokerA, brokerB, exchangeA;
  const iterations = parseInt(process.env.LATENCY_ITERATIONS || '100', 10);
  const outFile = 'latency-report.csv';

  before(async () => {
    const ethers = require('ethers');
    const hre = require('hardhat');
    [owner, brokerA, brokerB, exchangeA] = await hre.ethers.getSigners();

    RegToken = await hre.ethers.getContractFactory('RegToken');
    reg = await RegToken.deploy();
    await reg.deployed();

    // CSV header
    fs.writeFileSync(outFile, 'op,iteration,ms,gasUsed,txHash\n');
  });

  it('runs latency benchmark', async () => {
    const hre = require('hardhat');

    for (let i = 0; i < iterations; i++) {
      // MINT
      const name = `Test${i}`;
      const symbol = `T${i}`;
      const desc = 'Latency test';
      const size = 1;

      const startMint = Date.now();
      // createRegToken is owner-restricted; owner mints to brokerA
      const txMint = await reg.connect(owner).createRegToken(brokerA.address, name, symbol, desc, size);
      const receiptMint = await txMint.wait();
      const elapsedMint = Date.now() - startMint;
      fs.appendFileSync(outFile, `mint,${i},${elapsedMint},${receiptMint.gasUsed.toString()},${txMint.hash}\n`);

      // TRANSFER: minted token id is GetTokenCount() - 1
      const tokenId = (await reg.GetTokenCount()).toNumber() - 1;
      const startTx = Date.now();
      const txTransfer = await reg.connect(brokerA)['safeTransferFrom(address,address,uint256)'](brokerA.address, exchangeA.address, tokenId);
      const receiptTransfer = await txTransfer.wait();
      const elapsedTransfer = Date.now() - startTx;
      fs.appendFileSync(outFile, `transfer,${i},${elapsedTransfer},${receiptTransfer.gasUsed.toString()},${txTransfer.hash}\n`);

      // update metadata so owner field reflects new owner
      await reg.updateMetaData(tokenId, name, symbol, desc, size);

      // For match: create a counter-party token, transfer it to the same exchange, then call matchOrders
      // owner mints counterparty token to brokerB
      const txMintB = await reg.connect(owner).createRegToken(brokerB.address, name, symbol, desc, size);
      const receiptMintB = await txMintB.wait();
      const tokenIdB = (await reg.GetTokenCount()).toNumber() - 1;

      // transfer brokerB -> exchangeA so both tokens share owner
      const startTransferB = Date.now();
      const txTransferB = await reg.connect(brokerB)['safeTransferFrom(address,address,uint256)'](brokerB.address, exchangeA.address, tokenIdB);
      const receiptTransferB = await txTransferB.wait();
      const elapsedTransferB = Date.now() - startTransferB;
      fs.appendFileSync(outFile, `transferB,${i},${elapsedTransferB},${receiptTransferB.gasUsed.toString()},${txTransferB.hash}\n`);

      // update metadata for tokenB so owner field reflects new owner
      await reg.updateMetaData(tokenIdB, name, symbol, desc, size);

      const startMatch = Date.now();
      const txMatch = await reg.connect(exchangeA).matchOrders(brokerA.address, tokenId, brokerB.address, tokenIdB);
      const receiptMatch = await txMatch.wait();
      const elapsedMatch = Date.now() - startMatch;
      fs.appendFileSync(outFile, `match,${i},${elapsedMatch},${receiptMatch.gasUsed.toString()},${txMatch.hash}\n`);

      // optional small delay to avoid tight loop
      await new Promise(r => setTimeout(r, 5));
    }

    const content = fs.readFileSync(outFile, 'utf8');
    expect(content.split('\n').length).to.be.greaterThan(2);
  });
});
