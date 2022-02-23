/*eslint no-process-env: "error"*/

const {
    AccountId,
    PrivateKey,
    Client,
    FileCreateTransaction,
    FileAppendTransaction,
    FileContentsQuery,
    ContractCreateTransaction,
} = require("@hashgraph/sdk");

require("dotenv").config();

// Grab the OPERATOR_ID and OPERATOR_KEY from the .env file
const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
const operatorKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

// Build Hedera testnet and mirror node client
const client = Client.forTestnet();

client.setOperator(operatorId, operatorKey);

async function main(){    // Instantiate the contract instance
    const contractTx = await new ContractCreateTransaction()
        //Set the file ID of the Hedera file storing the bytecode
        .setBytecodeFileId('0.0.30782677') 
        //Set the gas to instantiate the contract
        .setGas(100000)
        //Provide the constructor parameters for the contract
        //.setConstructorParameters(new ContractFunctionParameters().addString("Hello from Hedera!x"));

    //Submit the transaction to the Hedera test network
    const contractResponse = await contractTx.execute(client);

    //Get the receipt of the file create transaction
    const contractReceipt = await contractResponse.getReceipt(client);

    //Get the smart contract ID
    const newContractId = contractReceipt.contractId;

    //Log the smart contract ID
    console.log("The smart contract ID is " + newContractId); //HTS:  0.0.30768772 == 0.0.30768776
    //LP Token is 0.0.30782678

    //v2 JavaScript SDK
};
main();