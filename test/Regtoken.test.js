const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { hre } = require("hardhat");
//const { osehre } = require("././contracts/Enums.sol");

describe("RegToken Contract", function () {
    async function deployRegTokenFixture() {
        const RegToken = await ethers.getContractFactory("RegToken");
        const regToken = await RegToken.deploy();
        const [owner, addr1, addr2] = await ethers.getSigners();
        await regToken.deployed();
        const mintRgt = await  regToken.createRegToken(owner.address,"RegToken_0","RGT","First RegToken in collection",-1)
        await mintRgt.wait();
        return { regToken, owner, addr1, addr2 };
    }
    it("Should have ne order status", async function () {
        const { regToken, owner } = await loadFixture(deployRegTokenFixture);
        //console.log("regToken:  %s",regToken);
        const rr = await regToken.orderStatus();
        const dd = await regToken.side();
        console.log("res: %s --> %s, %s, %s", rr,dd,await regToken.side(), await regToken.metaData(1));
        await  regToken.updateMetaData(1,"name","symbol","description",444);
        console.log("res: %s --> %s, %s, %s", rr,dd,await regToken.side(), await regToken.metaData(1));
        expect(await regToken.side()).to.equal("Buy");        

        //expect(await uint16(regToken.orderStatus())).to.equal(0);        
    });
   /* it('should return the correct owner', async function () {
        // Perform the contract function call and test the result
        const { gameItem, owner } = await loadFixture(deployTokenFixture); 
        const ma = await ethers.provider.getSigner(0).getAddress();
        console.log("ma");
        console.log(ma);
        console.log(owner.getAddress());
        console.log("end ma");
        expect(owner.getAddress()).to.equal(await ethers.provider.getSigner(0).getAddress());
    });*/
    /*it("Should Mint a new token", async function () {
        const { regToken, owner } = await loadFixture(deployRegTokenFixture);
        expect(await regToken.balanceOf(owner.address)).to.equal(1);
        const ta = await regToken.GetName(owner.address);
        const val = await regToken.TestStr();
        console.log("-------------------");
        console.log(ta);
        console.log("-------------------");
        console.log(val);
        console.log("-------------------");

        expect(await regToken.GetName(owner.address)).to.equal("RegToken_0");    
    });*/
    /*it("Should test int", async function () {
        const { gameItem, owner } = await loadFixture(deployTokenFixture);
        const val = await gameItem.TestTest(owner.address);
        ///expect(await gameItem.balanceOf(owner.address)).to.equal(1);
        console.log(val);
        //assert.equal(uint16 (val), 1);
        
    });
    it("Should test str", async function () {
        const { gameItem, owner } = await loadFixture(deployTokenFixture);
        const val = await gameItem.TestStr();
        expect(await gameItem.TestStr()).to.equal("hello");
        console.log(val);
        //assert.equal(uint16 (val), 1);
        
    });*/
})