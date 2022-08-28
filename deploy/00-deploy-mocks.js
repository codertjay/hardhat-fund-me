const {network} = require("hardhat");
const {developmentChains, networkConfig, DECIMALS, INITIAL_ANSWER} = require("../helper-hardhat-config");


module.exports = async ({getNamedAccounts, deployments}) => {

    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts()
    const chainId = network.config.chainId

    if (developmentChains.includes(network.name)) {

        console.log("Local network detected deploying mocks")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER]
        })
        console.log("Mocks Deployed ....")
        console.log("========================================")

    }

}

module.exports.tags = ["all", "mocks"]