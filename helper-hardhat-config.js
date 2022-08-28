const networkConfig = {
    4: {
        name : "rinkeby",
        ethUsdPriceFeed: "0x0c15Ab9A0DB086e062194c273CC79f41597Bbf13",
    },
    137:{
        name: "polygon",
        ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945"
    },
    42:{
        name: "kovan",
        ethUsdPriceFeed: "0x0c15Ab9A0DB086e062194c273CC79f41597Bbf13"
    },
    // 31337:{
    //     name: "hardhat",
    // }
}

const developmentChains = ["hardhat","localhost"]
const DECIMALS = 8
const INITIAL_ANSWER = 200000000000
module.exports= {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
}