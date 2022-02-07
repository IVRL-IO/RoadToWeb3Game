import * as dotenv from "dotenv";

import {HardhatUserConfig, task} from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
// hardhat.config.ts
import '@openzeppelin/hardhat-upgrades';

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
    solidity:
       {compilers: [
               {
            version: "0.8.2",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200,
                }
            }
        },
            {
                version: "0.7.3",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    }
                }
            }]},
    defaultNetwork: "polygonMumbai",
    networks:{
    ropsten: {
        url: process.env.ROPSTEN_URL || "",
        accounts: "remote"

    }
,
        polygonMumbai: {
        url: "https://polygon-mumbai.infura.io/v3/",
        accounts: [""]
    }
}
,
gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
        currency:  "USD",
}
,
        etherscan: {
                apiKey: {
                    polygon: "",
                    polygonMumbai: ""
            }
        }
,
}
;

export default config;
