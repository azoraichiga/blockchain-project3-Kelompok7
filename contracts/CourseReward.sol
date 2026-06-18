// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CourseReward {
    address public owner;
    bool public isActive;

    uint256 public claimDeadline;

    mapping(address => bool) public whitelist;
    mapping(address => bool) public hasClaimed;
    mapping(address => uint256) public rewardAmount;

    address[] private claimers;

    event RewardGranted(address indexed student, uint256 amount);
    event RewardClaimed(address indexed student, uint256 amount);
    event ContractStatusChanged(bool status);
    event FundReceived(address indexed sender, uint256 amount);
    event Withdrawn(address indexed owner, uint256 amount);

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only owner can call this function"
        );
        _;
    }

    constructor(uint256 durationDays) payable {
        require(
            durationDays > 0,
            "Duration must be greater than 0"
        );

        owner = msg.sender;
        isActive = true;

        claimDeadline =
            block.timestamp +
            (durationDays * 1 days);
    }

    function grantReward(
        address student,
        uint256 amount
    ) external onlyOwner {
        require(
            student != address(0),
            "Invalid student address"
        );

        require(
            amount > 0,
            "Amount must be greater than 0"
        );

        whitelist[student] = true;
        rewardAmount[student] = amount;

        emit RewardGranted(student, amount);
    }

    function claimReward() external {
        require(
            isActive,
            "Contract is not active"
        );

        require(
            block.timestamp <= claimDeadline,
            "Claim deadline has passed"
        );

        require(
            whitelist[msg.sender],
            "You are not whitelisted"
        );

        require(
            !hasClaimed[msg.sender],
            "Reward already claimed"
        );

        uint256 amount = rewardAmount[msg.sender];

        require(
            address(this).balance >= amount,
            "Insufficient contract balance"
        );

        hasClaimed[msg.sender] = true;
        claimers.push(msg.sender);

        payable(msg.sender).transfer(amount);

        emit RewardClaimed(msg.sender, amount);
    }

    function setContractActive(
        bool status
    ) external onlyOwner {
        isActive = status;

        emit ContractStatusChanged(status);
    }

    function setDeadline(
        uint256 durationDays
    ) external onlyOwner {
        claimDeadline =
            block.timestamp +
            (durationDays * 1 days);
    }

    function fund() external payable {
        require(
            msg.value > 0,
            "Must send ETH to fund"
        );

        emit FundReceived(
            msg.sender,
            msg.value
        );
    }

    function withdraw()
        external
        onlyOwner
    {
        uint256 balance =
            address(this).balance;

        require(
            balance > 0,
            "Nothing to withdraw"
        );

        payable(owner).transfer(balance);

        emit Withdrawn(owner, balance);
    }

    function getBalance()
        public
        view
        returns (uint256)
    {
        return address(this).balance;
    }

    function getClaimersCount()
        external
        view
        returns (uint256)
    {
        return claimers.length;
    }

    function getAllClaimers()
        external
        view
        returns (address[] memory)
    {
        return claimers;
    }

    function getStudentInfo(
        address student
    )
        external
        view
        returns (
            bool,
            bool,
            uint256
        )
    {
        return (
            hasClaimed[student],
            whitelist[student],
            rewardAmount[student]
        );
    }

    function isDeadlinePassed()
        external
        view
        returns (bool)
    {
        return block.timestamp >
            claimDeadline;
    }

    receive() external payable {
        emit FundReceived(
            msg.sender,
            msg.value
        );
    }
}
