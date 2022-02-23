require("dotenv").config();
const {
    AccountId,
    PrivateKey,
    Client,
    FileCreateTransaction,
    FileAppendTransaction,
    FileContentsQuery,
    setMaxTransactionFee,
    Hbar,
} = require("@hashgraph/sdk");

// console.log(process.env);

// Grab the OPERATOR_ID and OPERATOR_KEY from the .env file
const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
const operatorKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

// Build Hedera testnet and mirror node client
const client = Client.forTestnet();

client.setOperator(operatorId, operatorKey);

//Import the compiled contract from the HelloHedera.json file
// let helloHedera = require("./artifacts/HelloHedera.json");
// let HTS = require("./artifacts/HTS.json");
let LPToken = require("../../contracts/artifacts/LPToken.json");

// const bytecode = helloHedera.data.bytecode.object; // // '0.0.29689647'
// const bytecode2 = HTS.data.bytecode.object; // contract byte code file ID 0.0.29691173

const bytecode = LPToken.data.bytecode.object;
const bytecode2 = [LPToken.data.bytecode.object.substring(0,2048)];

let n = Math.floor(bytecode.length / 2048);
let chunkPointer = 0;
// let chunks:Array<string> = [];
let chunks = [];
while (n>0) {
   chunks.push(bytecode.substring(chunkPointer, chunkPointer+2048));
   chunkPointer=chunkPointer+2048;
   n--;

};
chunks.push(bytecode.substring(chunkPointer))



// const bytecode = LPToken.data.bytecode.object.substring(0,2048);



async function main() {
    //Create a file on Hedera and store the hex-encoded bytecode
    const fileCreateTx = new FileCreateTransaction()
    .setKeys([client.operatorPublicKey])
    //Set the bytecode of the contract
    //.setContents(bytecode); 
    .setContents("");

    //Submit the file to the Hedera test network signing with the transaction fee payer key specified with the client
    const submitTx = await fileCreateTx.execute(client);
    const fileReceipt = await submitTx.getReceipt(client);
    const fileId = fileReceipt.fileId; // successfully compiled to 0.0.30782452 

    console.log(`file ID = ${fileId.toString()}`);
    // console.log(`file receipt ID = ${fileReceipt}`);
    // Object.keys(fileReceipt).forEach((prop)=> console.log(prop, fileReceipt[prop]));

    let appendTx;
    // await bytecode2.forEach(async(element) => {
    //     appendTx = await new FileAppendTransaction()
    //         .setFileId(fileId)
    //         .setContents(element)
    //         .setMaxTransactionFee(new Hbar(50))
    //         // .setChunkSize(1024)
    //         .freezeWith(client);

    //     let signTx = await appendTx.sign(PrivateKey.fromString(process.env.MY_PRIVATE_KEY));
    //     let submitAppendTx = await signTx.execute(client);
    // });

    for (let index = 0; index < chunks.length; index++) {
        const element = chunks[index];
        appendTx = await new FileAppendTransaction()
            .setFileId(fileId)
            .setContents(element)
            .setMaxTransactionFee(new Hbar(50))
            // .setChunkSize(1024)
            .freezeWith(client);

        let signTx = await appendTx.sign(PrivateKey.fromString(process.env.MY_PRIVATE_KEY));
        let submitAppendTx = await signTx.execute(client); 
    }
    

    
    
    

    


    // const appendReceipt = await submitAppendTx.getReceipt(client);
    // console.log(`append file ID = ${appendReceipt.fileId.toString()}`);


    //Get the receipt of the file create transaction
    


    //Get the file ID from the receipt
    // const bytecodeFileId = fileReceipt.fileId;

    //Log the file ID
    // console.log("The smart contract byte code file ID is " +bytecodeFileId)
    const contents = await new FileContentsQuery()
        .setFileId(fileId)
        .execute(client);

    console.log(
        `File content length according to \`FileInfoQuery\`: ${contents.length}`
    );
};
main();
