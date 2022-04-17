const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const AKDCContract = await hre.ethers.getContractFactory("AKDigitalCoin");
  const akdccont = await AKDCContract.deploy();
  
  await akdccont.deployed();

  console.log("AK Digital Coin has been deployed. Env address is:", akdccont.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
