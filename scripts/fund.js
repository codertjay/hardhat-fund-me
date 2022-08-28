const {getNamedAccounts} = require("hardhat")

async function main() {
    const {deployer} = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    const transactionResponse = await fundMe.fund({
        value: ethers.utils.parseEther("0.1")
    })
    await transactionResponse.wait(1)
    console.log("Funding Contract .......")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
