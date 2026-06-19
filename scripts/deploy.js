const { ethers } = require("hardhat");

async function main() {
    const signers = await ethers.getSigners();
    const deployer = signers[0]; // Pakai akun 0 agar user tetap jadi Admin

    // Burn nonce dengan mengirim transaksi kosong ke diri sendiri
    await deployer.sendTransaction({
        to: deployer.address,
        value: 0
    });

    console.log("Deploying contracts with the account:", deployer.address);

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
                value: ethers.parseEther("10")
            }
        );

    await contract.waitForDeployment();

    console.log(
        "Contract deployed at:",
        await contract.getAddress()
    );

    console.log(
        "Owner:",
        await contract.owner()
    );

    console.log(
        "Balance:",
        ethers.formatEther(
            await contract.getBalance()
        ),
        "ETH"
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
