const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);
    console.log(
        "Account balance:",
        ethers.formatEther(await deployer.provider.getBalance(deployer.address)),
        "ETH"
    );

    const DURATION_DAYS = 30;

    const CourseReward =
        await ethers.getContractFactory(
            "CourseReward",
            deployer
        );

    const contract =
        await CourseReward.deploy(
            DURATION_DAYS,
            {
                value: ethers.parseEther("0.01") // 0.01 SepETH cukup untuk demo
            }
        );

    await contract.waitForDeployment();

    const address = await contract.getAddress();

    console.log("Contract deployed at:", address);
    console.log("Owner:", await contract.owner());
    console.log(
        "Balance:",
        ethers.formatEther(await contract.getBalance()),
        "ETH"
    );

    console.log("\n✅ Update CONTRACT_ADDRESS di frontend/src/utils/contract.js:");
    console.log(`   export const CONTRACT_ADDRESS = "${address}";`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
