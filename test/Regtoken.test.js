const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { hre } = require("hardhat");

describe("RegToken Contract", function () {
    async function deployRegTokenFixture() {
        const RegToken = await ethers.getContractFactory("RegToken");
        const regToken = await RegToken.deploy();
        const [brokerA, exchangeA, brokerB, exchangeB ] = await ethers.getSigners();
        await regToken.deployed(); 
        console.log(regToken)      ;
      //  const mintRgt = await  regToken.createRegToken(brokerA.address,"RegToken_0","RGT","First RegToken in collection",-1)
       // await mintRgt.wait();
        return { regToken, brokerA, exchangeA, brokerB, exchangeB };
    }
    it("1. Should  create mint a token and move it to exchange A", async function () {
        const { regToken, brokerA ,exchangeA} = await loadFixture(deployRegTokenFixture);
        const mintRgt = await  regToken.createRegToken(brokerA.address,"Vodafone","Vod.RGT","Buy Vodafone RGT",1000);
        expect(await regToken.balanceOf(await brokerA.getAddress())).to.equal(1);
        expect(await regToken.balanceOf(await exchangeA.getAddress())).to.equal(0);
        //console.log("Balance of: brokerA=%s,  %s ",await regToken.balanceOf(await exchangeA.getAddress()), await regToken.balanceOf(brokerA.getAddress()));
        console.log("Balance after mint new reg token: brokerA=%s, exchangeA=%s ",await regToken.balanceOf(await brokerA.getAddress()), await regToken.balanceOf(exchangeA.getAddress()));
        await regToken.transferFrom( await brokerA.getAddress(),await  exchangeA.getAddress(),1);
        expect(await regToken.balanceOf(await brokerA.getAddress())).to.equal(0);
        expect(await regToken.balanceOf(await exchangeA.getAddress())).to.equal(1);
        console.log("Balance after transfer reg token: brokerA=%s, exchangeA=%s ",await regToken.balanceOf(await brokerA.getAddress()), await regToken.balanceOf(exchangeA.getAddress()));
    });
    
    it("2. Should create mint token and add to its meta data", async function () {
        const { regToken, brokerA } = await loadFixture(deployRegTokenFixture);
        const expectedMetadataPre = "name:Vodafone, symbol:Vod.RGT, description:Buy Vodafone RGT, size:1000";
        const expectedMetadataPost = "name:Vodafone, symbol:Vod.RGT, description:Buy Vodafone RGT, size:500";        
        const mintRgt = await  regToken.createRegToken(brokerA.address,"Vodafone","Vod.RGT","Buy Vodafone RGT",1000);
        rgMt = await regToken.RegMetaDataToString(await regToken.GetMetaData(1));
        expect(await rgMt).to.equal(expectedMetadataPre);
        await  regToken.updateMetaData(1,"Vodafone","Vod.RGT","Buy Vodafone RGT",500);        
        rgMt = await regToken.RegMetaDataToString(await regToken.GetMetaData(1));
        expect(await rgMt).to.equal(expectedMetadataPost);
    });
    it("3. Should create mint two reg tokens send to the excahnge and match them, adding full audit", async function () {
        const { regToken, brokerA ,exchangeA,brokerB,exchangeB} = await loadFixture(deployRegTokenFixture);
        const mintRgtA = await  regToken.createRegToken(brokerA.address,"Vodafone","Vod.RGT","Buy Vodafone RGT",1000);
        const mintRgtB = await  regToken.createRegToken(brokerB.address,"Vodafone","Vod.RGT","Sell Vodafone RGT",500);
       // console.log("newItemId %s", await mintRgtA);
        //console.log("newItemId mintRgtB %s", await mintRgtB);
        expect(await regToken.balanceOf(await brokerA.getAddress())).to.equal(1);
        expect(await regToken.balanceOf(await brokerB.getAddress())).to.equal(1);
        expect(await regToken.balanceOf(await exchangeA.getAddress())).to.equal(0);

        await regToken.transferFrom( await brokerA.getAddress(),await  exchangeA.getAddress(),1);
       // await regToken.transferFrom( await brokerB.getAddress(),await  exchangeA.getAddress(),2);
        //await regToken.transferFrom( await brokerA.getAddress(),await  exchangeA.getAddress(),1);
        //await regToken.transferFrom( await brokerB.getAddress(),await  exchangeA.getAddress(),2);
        await regToken.matchOrders(brokerA.getAddress(),1, exchangeA.getAddress(),2);
        //const rgMt = await regToken.RegMetaDataToString(await regToken.GetMetaData(1));
       /// const rgMt2= await regToken.RegMetaDataToString(await regToken.GetMetaData(2));
        //console.log(rgMt);
        //console.log(rgMt2);
    });
    /*it("4. Should have ne order status", async function () {
        const { regToken, brokerA ,exchangeA} = await loadFixture(deployRegTokenFixture);
        //console.log("regToken:  %s",regToken);
        const rr = await regToken.orderStatus();
        const dd = await regToken.side();
        // console.log("res: %s --> %s, %s, %s", rr,dd,await regToken.side(), await regToken.metaData(1));
        await  regToken.updateMetaData(1,"name","symbol","description",444);
        const mintRgt = await  regToken.createRegToken(brokerA.address,"Vodafone","Vod.RGT","Buy Vodafone RGT",1000);
       //// console.log("res: %s --> %s, %s, %s", rr,dd,await regToken.side(), await regToken.metaData(1));
        console.log("getAddress: %s --> %s, %s, %s",exchangeA.getAddress(),brokerA.getAddress(),await ethers.provider.getSigner(0).getAddress(),await ethers.provider.getSigner(1).getAddress() );
        console.log("Balance of: %s / %s ",await regToken.balanceOf(await exchangeA.getAddress()), await regToken.balanceOf(brokerA.getAddress()));
        //expect(await regToken.side()).to.equal("Buy");        
        expect(await exchangeA.getAddress()).to.equal(await ethers.provider.getSigner(1).getAddress());
        expect(await brokerA.getAddress()).to.equal(await ethers.provider.getSigner(0).getAddress());
        const fdsf  = await regToken.transferFrom( await brokerA.getAddress(),await  exchangeA.getAddress(),1);
        console.log("Balance of: %s / %s ",await regToken.balanceOf(await exchangeA.getAddress()), await regToken.balanceOf(brokerA.getAddress()));
        console.log(fdsf);
        //expect(await uint16(regToken.orderStatus())).to.equal(0);         
    });*/
   /* it("should mint new token by broker A", async function () {
        const { regToken, brokerA ,exchangeA} = await loadFixture(deployRegTokenFixture);
        const mintRgt = await  regToken.createRegToken(brokerA.address,"Vodafone","Vod.RGT","Buy Vodafone RGT",1000);
        await mintRgt.wait();
        console.log("Test2: %s",await mintRgt);
        console.log("regToken: %s",await regToken);
        expect(await brokerA.getAddress()).to.equal(await ethers.provider.getSigner(0).getAddress());
    });
    it("should mint new token by broker A", async function () {
        const { regToken, brokerA ,exchangeA} = await loadFixture(deployRegTokenFixture);
        const mintRgt = await  regToken.createRegToken(brokerA.address,"Vodafone","Vod.RGT","Buy Vodafone RGT",1000);
        console.log("Test2: %s",await regToken.GetTokenCount());
    });*/
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
        const { gameItem, owner } = await loadFixture(deployRegTokenFixture);
        const val = await gameItem.TestStr();
        expect(await gameItem.TestStr()).to.equal("hello");
        console.log(val);
        //assert.equal(uint16 (val), 1);
        
    });*/
})