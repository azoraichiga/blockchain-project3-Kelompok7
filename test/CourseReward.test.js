const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CourseReward", function () {

    let contract;
    let owner;
    let student1;
    let student2;

    const DURATION = 30;
    const REWARD =
        ethers.parseEther("0.1");

    beforeEach(async function () {

        [owner, student1, student2] =
            await ethers.getSigners();

        const Factory =
            await ethers.getContractFactory(
                "CourseReward"
            );

        contract =
            await Factory.deploy(
                DURATION,
                {
                    value:
                    ethers.parseEther("10")
                }
            );

        await contract.waitForDeployment();
    });

    it("sets owner correctly", async function () {
        expect(
            await contract.owner()
        ).to.equal(owner.address);
    });

    it("is active by default", async function () {
        expect(
            await contract.isActive()
        ).to.equal(true);
    });

    it("grant reward", async function () {

        await contract.grantReward(
            student1.address,
            REWARD
        );

        expect(
            await contract.whitelist(
                student1.address
            )
        ).to.equal(true);

        expect(
            await contract.rewardAmount(
                student1.address
            )
        ).to.equal(REWARD);
    });

    it("student can claim reward",
        async function () {

        await contract.grantReward(
            student1.address,
            REWARD
        );

        await contract
            .connect(student1)
            .claimReward();

        expect(
            await contract.hasClaimed(
                student1.address
            )
        ).to.equal(true);
    });

    it("rejects double claim",
        async function () {

        await contract.grantReward(
            student1.address,
            REWARD
        );

        await contract
            .connect(student1)
            .claimReward();

        await expect(
            contract
            .connect(student1)
            .claimReward()
        ).to.be.revertedWith(
            "Reward already claimed"
        );
    });

    it("owner can pause contract",
        async function () {

        await contract
            .setContractActive(false);

        expect(
            await contract.isActive()
        ).to.equal(false);
    });

    it("owner can withdraw",
        async function () {

        await contract.withdraw();

        expect(
            await contract.getBalance()
        ).to.equal(0);
    });

});
