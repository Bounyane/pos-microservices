const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying TransactionStore contract...");

    const TransactionStore = await ethers.getContractFactory("TransactionStore");
    const transactionStore = await TransactionStore.deploy();

    await transactionStore.waitForDeployment();

    const address = await transactionStore.getAddress();
    console.log(`TransactionStore deployed to: ${address}`);
    console.log(`Set this as CONTRACT_ADDRESS in your transaction-service environment.`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
