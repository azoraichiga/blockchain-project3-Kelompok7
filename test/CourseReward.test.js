const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CourseReward", function () {

    let contract;
    let owner;
    let student1;
    let student2;
    let stranger;

    const DURATION = 30;
    const REWARD = ethers.parseEther("0.1");

    beforeEach(async function () {

        [owner, student1, student2, stranger] =
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

    // ==================================================
    // DEPLOYMENT
    // ==================================================

    describe("Deployment", function () {

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

        it("has initial balance", async function () {
            expect(
                await contract.getBalance()
            ).to.equal(
                ethers.parseEther("10")
            );
        });

    });

    // ==================================================
    // GRANT REWARD
    // ==================================================

    describe("Grant Reward", function () {

        it("owner can grant reward", async function () {

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

        it("supports different reward amounts", async function () {

            const reward1 =
                ethers.parseEther("0.1");

            const reward2 =
                ethers.parseEther("0.2");

            await contract.grantReward(
                student1.address,
                reward1
            );

            await contract.grantReward(
                student2.address,
                reward2
            );

            expect(
                await contract.rewardAmount(
                    student1.address
                )
            ).to.equal(reward1);

            expect(
                await contract.rewardAmount(
                    student2.address
                )
            ).to.equal(reward2);
        });

        it("rejects non-owner grant reward", async function () {

            await expect(
                contract
                .connect(student1)
                .grantReward(
                    student2.address,
                    REWARD
                )
            ).to.be.reverted;
        });

    });

    // ==================================================
    // CLAIM REWARD
    // ==================================================

    describe("Claim Reward", function () {

        beforeEach(async function () {

            await contract.grantReward(
                student1.address,
                REWARD
            );

        });

        it("student can claim reward", async function () {

            await contract
                .connect(student1)
                .claimReward();

            expect(
                await contract.hasClaimed(
                    student1.address
                )
            ).to.equal(true);
        });

        it("rejects double claim", async function () {

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

        it("rejects non-whitelisted student", async function () {

            await expect(
                contract
                .connect(student2)
                .claimReward()
            ).to.be.reverted;
        });

        it("reduces contract balance after claim", async function () {

            const before =
                await contract.getBalance();

            await contract
                .connect(student1)
                .claimReward();

            const after =
                await contract.getBalance();

            expect(after)
                .to.equal(
                    before - REWARD
                );
        });

    });

    // ==================================================
    // PAUSE CONTRACT
    // ==================================================

    describe("Pause Contract", function () {

        it("owner can pause contract", async function () {

            await contract
                .setContractActive(false);

            expect(
                await contract.isActive()
            ).to.equal(false);
        });

        it("non-owner cannot pause contract", async function () {

            await expect(
                contract
                .connect(student1)
                .setContractActive(false)
            ).to.be.reverted;
        });

    });

    // ==================================================
    // DEADLINE
    // ==================================================

describe("Deadline", function () {

    it("owner can update deadline", async function () {

        const oldDeadline =
            await contract.claimDeadline();

        await contract.setDeadline(60);

        const newDeadline =
            await contract.claimDeadline();

        expect(newDeadline)
            .to.be.gt(oldDeadline);
    });

    it("non-owner cannot update deadline", async function () {

        await expect(
            contract
                .connect(student1)
                .setDeadline(60)
        ).to.be.reverted;
    });

});

    // ==================================================
    // FUND
    // ==================================================

describe("Fund", function () {

    it("accepts ETH funding", async function () {

        const before =
            await contract.getBalance();

        await contract
            .connect(student1)
            .fund({
                value:
                ethers.parseEther("1")
            });

        const after =
            await contract.getBalance();

        expect(after)
            .to.equal(
                before +
                ethers.parseEther("1")
            );
    });

    it("rejects zero ETH funding", async function () {

        await expect(
            contract
                .connect(student1)
                .fund({
                    value: 0
                })
        ).to.be.revertedWith(
            "Must send ETH to fund"
        );
    });

});

    // ==================================================
    // WITHDRAW
    // ==================================================

    describe("Withdraw", function () {

        it("owner can withdraw", async function () {

            await contract.withdraw();

            expect(
                await contract.getBalance()
            ).to.equal(0);
        });

        it("non-owner cannot withdraw", async function () {

            await expect(
                contract
                .connect(student1)
                .withdraw()
            ).to.be.reverted;
        });

    });

    // ==================================================
    // DEADLINE
    // ==================================================

describe("Deadline", function () {

    it("owner can update deadline", async function () {

        const oldDeadline =
            await contract.claimDeadline();

        await contract.setDeadline(60);

        const newDeadline =
            await contract.claimDeadline();

        expect(newDeadline)
            .to.be.gt(oldDeadline);
    });

    it("non-owner cannot update deadline", async function () {

        await expect(
            contract
                .connect(student1)
                .setDeadline(60)
        ).to.be.reverted;
    });

});

    //claimers count
    it("tracks claimers count", async function () {

    await contract.grantReward(
        student1.address,
        REWARD
    );

    await contract
        .connect(student1)
        .claimReward();

    expect(
        await contract.getClaimersCount()
    ).to.equal(1);
});

    //getallclaimers
    it("stores claimer addresses", async function () {

    await contract.grantReward(
        student1.address,
        REWARD
    );

    await contract
        .connect(student1)
        .claimReward();

    const claimers =
        await contract.getAllClaimers();

    expect(
        claimers[0]
    ).to.equal(
        student1.address
    );
});

    //getstudent info
    //info[0] = hasClaimed
//info[1] = whitelist
//info[2] = rewardAmount
    describe("Student Info", function () {

    it("returns correct student info", async function () {

        await contract.grantReward(
            student1.address,
            REWARD
        );

        const info =
            await contract.getStudentInfo(
                student1.address
            );

        expect(info[0])
            .to.equal(false);

        expect(info[1])
            .to.equal(true);

        expect(info[2])
            .to.equal(REWARD);
    });

});

    //is deadline passed
    describe("Deadline Check", function () {

    it("returns true after deadline", async function () {

        await ethers.provider.send(
            "evm_increaseTime",
            [31 * 24 * 60 * 60]
        );

        await ethers.provider.send(
            "evm_mine",
            []
        );

        expect(
            await contract.isDeadlinePassed()
        ).to.equal(true);
    });

});

    //reject claims after deadline
    it("rejects claim after deadline", async function () {

    await contract.grantReward(
        student1.address,
        REWARD
    );

    await ethers.provider.send(
        "evm_increaseTime",
        [31 * 24 * 60 * 60]
    );

    await ethers.provider.send(
        "evm_mine",
        []
    );

    await expect(
        contract
            .connect(student1)
            .claimReward()
    ).to.be.revertedWith(
        "Claim deadline has passed"
    );
});

});
