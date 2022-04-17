const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AKDigitalCoin Unit Tests",function(){
  let AKDCContract;
  let akdcObj;
  let owner;
  let spender;
  let intermediary;
  let receipient;

  let ownerAKDCstartbal;
  let spenderAKDCstartbal;
  let intermediaryAKDCstartbal;
  let receipientAKDCstartbal;

  const pool_balance = 250000*10^2;

  beforeEach(async function(){
      AKDCContract = await ethers.getContractFactory("AKDigitalCoin");
      [owner,spender,intermediary,receipient,...addrs] = await ethers.getSigners();

      akdcObj = await AKDCContract.deploy();
      ownerAKDCstartbal = await akdcObj.balanceOf(owner.address);
      spenderAKDCstartbal = await akdcObj.balanceOf(spender.address);
      intermediaryAKDCstartbal = await akdcObj.balanceOf(intermediary.address);
      receipientAKDCstartbal = await akdcObj.balanceOf(receipient.address);

      console.log("Owner %s Spender %s Int %s Recip %s",
      ownerAKDCstartbal,
      spenderAKDCstartbal,
      intermediaryAKDCstartbal,
      receipientAKDCstartbal);
  });

  describe("Deployment", function(){
      it("Should have the right owner",async function(){
          expect(await akdcObj.owner()).to.equal(owner.address);
      });

      it("Should assign all initial tokens",async function(){
          const ownerBalance = await akdcObj.balanceOf(owner.address);
          expect(ownerBalance).to.equal(pool_balance);
      });
  });

  describe("Transfer",function(){
      it("Should allow a transfer",async function(){
        const txHash = await akdcObj.connect(owner).transfer(spender.address,1000);
      
        const spenderBal = await akdcObj.balanceOf(spender.address);
        const ownerBal = await akdcObj.balanceOf(owner.address);
        const totalSupply = await akdcObj.totalSupply();
        
        expect(spenderBal).to.equal(1000);
        expect(ownerBal).to.equal(pool_balance - 1000);
        expect(totalSupply).to.equal(1000);
      });
  });

  describe("Downstream Transfer",function(){
      it("Should allow a downstream transfer",async function(){
        const txHash = await akdcObj.connect(owner).transfer(spender.address,1000);
        const txHash2 = await akdcObj.connect(spender).transfer(receipient.address,100);

        console.log("Transfer Tx Hash %s",txHash);
        console.log("Transfer Tx Hash2 %s",txHash2);

        const spenderBal = await akdcObj.balanceOf(spender.address);
        const ownerBal = await akdcObj.balanceOf(owner.address);
        const receipientBal = await akdcObj.balanceOf(receipient.address);

        const totalSupply = await akdcObj.totalSupply();

        expect(spenderBal).to.equal(900);
        expect(receipientBal).to.equal(100);
        expect(ownerBal).to.equal(pool_balance - 1000);
        expect(totalSupply).to.equal(1000);
      });
  });

  describe("Intermediary Allowance",function(){
      it("Should allow an intermediary",async function(){
        const txHash = await akdcObj.connect(owner).transfer(spender.address,1000);
        const txHash2 = await akdcObj.connect(spender).approve(intermediary.address,100);

        console.log("Transfer Tx Hash %s",txHash);
        console.log("Transfer Tx Hash2 %s",txHash2);

        const spenderBal1 = await akdcObj.balanceOf(spender.address);
        const intermediaryBal1 = await akdcObj.balanceOf(intermediary.address);
        const receipientBal1 = await akdcObj.balanceOf(receipient.address);
        const unspentEarmarked1 = await akdcObj.connect(intermediary).unspentEarmarked(spender.address);
        const intAllowance1 = await akdcObj.connect(receipient).allowance(spender.address,intermediary.address);

        const txHash3 = await akdcObj.connect(intermediary).transferFrom(spender.address,receipient.address,100);

        const spenderBal2 = await akdcObj.balanceOf(spender.address);
        const intermediaryBal2 = await akdcObj.balanceOf(intermediary.address);
        const receipientBal2 = await akdcObj.balanceOf(receipient.address);
        const unspentEarmarked2 = await akdcObj.connect(intermediary).unspentEarmarked(spender.address);
        const intAllowance2 = await akdcObj.connect(receipient).allowance(spender.address,intermediary.address);


        expect(spenderBal1).to.equal(1000);
        expect(intermediaryBal1).to.equal(0);
        expect(receipientBal1).to.equal(0);
        expect(unspentEarmarked1).to.equal(100);
        expect(intAllowance1).to.equal(unspentEarmarked1);
        
        expect(spenderBal2).to.equal(900);
        expect(intermediaryBal2).to.equal(0);
        expect(receipientBal2).to.equal(100);
        expect(unspentEarmarked2).to.equal(0);
        expect(intAllowance2).to.equal(unspentEarmarked2);        
      });
  });
  
  describe("Intermediary Revoke",function(){
      it("Should allow an intermediary but then revoke",async function(){
        const txHash = await akdcObj.connect(owner).transfer(spender.address,1000);
        const txHash2 = await akdcObj.connect(spender).approve(intermediary.address,100);

        console.log("Transfer Tx Hash %s",txHash);
        console.log("Transfer Tx Hash2 %s",txHash2);

        const spenderBal1 = await akdcObj.balanceOf(spender.address);
        const unspentEarmarked1 = await akdcObj.connect(intermediary).unspentEarmarked(spender.address);
        const intAllowance1 = await akdcObj.connect(receipient).allowance(spender.address,intermediary.address);

        const txHash3 = await akdcObj.connect(spender).revoke(intermediary.address,90);

        console.log("Transfer Tx Hash3 %s",txHash3);

        const unspentEarmarked2 = await akdcObj.connect(intermediary).unspentEarmarked(spender.address);
        const intAllowance2 = await akdcObj.connect(receipient).allowance(spender.address,intermediary.address);


        expect(spenderBal1).to.equal(1000);
        expect(unspentEarmarked1).to.equal(100);
        expect(intAllowance1).to.equal(unspentEarmarked1);
        
        expect(unspentEarmarked2).to.equal(10);
        expect(intAllowance2).to.equal(unspentEarmarked2);        
      });
  });
  
});