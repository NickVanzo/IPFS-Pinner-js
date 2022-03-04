require('dotenv').config();

const fs = require('fs');
const pinataSDK = require('@pinata/sdk');
const pinata = pinataSDK(process.env.PINATA_KEY, process.env.PINATA_SECRET);

async function main() {
    if(await checkConnectionWithPinata()) {
        await pinFileToIpfs();
    }
}

async function checkConnectionWithPinata() {
    try {
        let result = await pinata.testAuthentication();
        return result;
    } catch(err) {
        console.log(err);
    }    
}

async function pinFileToIpfs() {
    let names = getNamesOfFilesPics();
    let readableStreamForFile = undefined;

    for(var i = 1; i < names.length; i++) {
        readableStreamForFile = fs.createReadStream(`/Users/nick/Documents/Tesi/Blockchain/NFT/images/${names[i]}`);
        let nameOfSingleFile = names[i].slice(0, names[i].length - 5);

        const options = {
            pinataMetadata: {
                name: nameOfSingleFile
            },
            pinataOptions: {
                cidVersion: 0
            }
        };

        try {
            let result = await pinata.pinFileToIPFS(readableStreamForFile, options);
            console.log(`Link of the image for ${nameOfSingleFile}: ipfs://${result.IpfsHash}`);
            await pinJSONAndSaveToDisk(result.IpfsHash, nameOfSingleFile);
        } catch(err) {
            console.log(err);
        }
    }
    
}

async function pinJSONAndSaveToDisk(cidOfImage, name) {
    let rawdata = fs.readFileSync('/Users/nick/Documents/Tesi/Blockchain/NFT/attributes_nft/attributes.json');
    let jsonArray = JSON.parse(rawdata);
    for(let obj in jsonArray) {
        
        if(jsonArray[obj].name === name) {
            jsonArray[obj].image = `ipfs://${cidOfImage}`
            const options = {
                pintataMetadata: {
                    name: name
                },
                pinataOptions: {
                    cidVersion: 0
                }
            };
            try {
                let result = await pinata.pinJSONToIPFS(jsonArray[obj], options);
                console.log(`Link of the json file ${name}: ipfs://${result.IpfsHash}`);
            } catch(err) {
                console.log(err);
            }
        }     
    }
    let data = JSON.stringify(jsonArray);
    fs.writeFileSync('/Users/nick/Documents/Tesi/Blockchain/NFT/attributes_nft/attributes.json', data);
}

function getNamesOfFilesPics() {
    const testFolder = "/Users/nick/Documents/Tesi/Blockchain/NFT/images/";
    let names = [];
    fs.readdirSync(testFolder).forEach(file => {
        names.push(file);
      });
    return names;
}


main();