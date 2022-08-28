const {assert, expect} = require("chai")
const {deployments, ethers, getNamedAccounts, network} = require("hardhat")
const {developmentChains} = require("../../helper-hardhat-config")


!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1")
    beforeEach(async function () {
        //    deploy our fundme
        //    using hardhat deploy
        //    const accounts = await ethers.getSigners()
        //    const accountZero = accounts[0]

        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])

        fundMe = await ethers.getContract(
            "FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator", deployer)

    })

    describe('constructor', async function () {
        it("sets the aggregator address correctly ", async function () {
            const response = await fundMe.getPriceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    });

    describe("fund", async function () {
        it("Fails if you don't send enough ETH", async function () {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })
        it("Updated the amount funded data structure ", async function () {
            await fundMe.fund({value: sendValue})
            const response = await fundMe.getAddressToAmountFunded(
                deployer
            )
            assert.equal(response.toString(), sendValue.toString())
        })
        it("Adds funder to array of funders", async function () {
            await fundMe.fund({value: sendValue})
            const funder = await fundMe.getFunder(0)
            assert.equal(funder, deployer)
        })
    })


    describe("withdraw", async function () {
        beforeEach(async function () {
            await fundMe.fund({value: sendValue})
        })
        it("withdraw ETH from a single founder", async function () {
            // Arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            // Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            const {gasUsed, effectiveGasPrice} = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // Assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString()
                , endingDeployerBalance.add(gasCost).toString())

        })

        it("allow us to withdraw with multiple funders", async function () {
            const accounts = await ethers.getSigners()
            for (let i = 0; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({value: sendValue})
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            const {gasUsed, effectiveGasPrice} = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            // Assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString()
                , endingDeployerBalance.add(gasCost).toString())

            // Make sure that the funders are reset properly
            // await expect(fundMe.getFunder(0)).to.be.reverted

            for (let i = 0; i < 6; i++) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0)
            }

        })

        it("only allow the owner to withdraw", async function () {
            const accounts = ethers.getSigners()
            const attacker = accounts[1]
            const attackerConnectedContract = await fundMe.connect(attacker)
            await expect(attackerConnectedContract.withdraw()).to.be.reverted
        })

        it("cheaper withdraw testing", async function () {
            const accounts = await ethers.getSigners()
            for (let i = 0; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({value: sendValue})
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // Act
            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            const {gasUsed, effectiveGasPrice} = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            // Assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString()
                , endingDeployerBalance.add(gasCost).toString())

            // Make sure that the funders are reset properly
            // await expect(fundMe.getFunder(0)).to.be.reverted

            for (let i = 0; i < 6; i++) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0)
            }

        })


    })


})