const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const {
  DUST_AMOUNT,
  ONE_ALPH,
  binToHex,
  codec,
  stringToHex,
  subContractId,
  web3,
  Address
} = require('@alephium/web3');
const { testNodeWallet } = require('@alephium/web3-test');
const { AwesomeNFT, AwesomeNFTCollection } = require('../artifacts/ts');
const fs = require('fs');
const path = require('path');
const app = express();
const certificatesDir = path.join(__dirname, 'certificates');
if (!fs.existsSync(certificatesDir)) {
  fs.mkdirSync(certificatesDir);
}
// CORS configuration
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

let nftCollection;
let awesomeNFTTemplate;

async function initialize() {
  try {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch);
    const signer = await testNodeWallet();

    const { contractInstance: nftTemplate } = await AwesomeNFT.deploy(
      signer,
      { initialFields: { collectionId: '', nftIndex: 0n, uri: '' } }
    );
    awesomeNFTTemplate = nftTemplate;

    const { contractInstance: collection } = await AwesomeNFTCollection.deploy(
      signer,
      {
        initialFields: {
          nftTemplateId: nftTemplate.contractId,
          collectionUri: stringToHex('https://alephium-nft.infura-ipfs.io/ipfs/QmdobfsES5tx6tdgiyiXiC5pqwyd7WQRZ8gJcM3eMHenYJ'),
          totalSupply: 0n
        },
      }
    );
    nftCollection = collection;

    console.log('Contracts deployed successfully');
    console.log('Collection Contract ID:', collection.contractId);
    return true;
  } catch (error) {
    console.error('Initialization failed:', error);
    return false;
  }
}

// Modified mint_nft endpoint to include recipient wallet address
app.post('/mint_nft', async (req, res) => {
  try {
    console.log(req.body);
    var { certificate_url, walletAddress } = req.body;

    if (!certificate_url || !walletAddress) {
      return res.status(400).json({ error: 'Image URL and wallet address are required' });
    }
    walletAddress = '1EC6JTYSYH7K6ybjzNHZsw8SMcy53mH8VFQXAiWRkM1kD'
    // Validate wallet address
    // try {
    //   Address.from(walletAddress);
    // } catch (error) {
    //   return res.status(400).json({ error: 'Invalid wallet address format' });
    // }

    if (!nftCollection) {
      return res.status(500).json({ error: 'NFT Collection not initialized' });
    }

    const signer = await testNodeWallet();

    // Mint the NFT with recipient address
    const mintTx = await nftCollection.transact.mint({
      signer,
      args: {
        nftUri: stringToHex(certificate_url),
        to: walletAddress  // Specify the recipient address
      },
      attoAlphAmount: ONE_ALPH / 10n + DUST_AMOUNT
    });

    const collectionMetadata = await web3.getCurrentNodeProvider()
      .fetchNFTCollectionMetaData(nftCollection.contractId);

    const nftIndex = Number(collectionMetadata.totalSupply) - 1;
    const nftContractId = subContractId(
      nftCollection.contractId,
      binToHex(codec.u256Codec.encode(BigInt(nftIndex))),
      0
    );
    console.log(mintTx)
    res.json({
      success: true,
      nftContractId,
      nftIndex,
      transactionId: mintTx.txId,
      certificate_url,
      owner: walletAddress
    });

  } catch (error: any) {
    console.error('Minting error:', error);
    res.status(500).json({ error: 'Failed to mint NFT', details: error.message });
  }
});
app.get('/bchain_metadata', async (req, res) => {
  return res.json({ contract_id: nftCollection?.contractId });
})
// Modified list_nft endpoint to filter by owner address
app.get('/list_nft', async (req, res) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ error: 'Wallet address is required as a query parameter' });
    }


    if (!nftCollection) {
      return res.status(500).json({ error: 'NFT Collection not initialized' });
    }

    const provider = web3.getCurrentNodeProvider();
    const collectionMetadata = await provider.fetchNFTCollectionMetaData(nftCollection.contractId);

    const nfts: { index: number; contractId: string; tokenUri: string; collectionId: string }[] = [];
    const totalSupply = Number(collectionMetadata.totalSupply);

    for (let i = 0; i < totalSupply; i++) {
      const nftContractId = subContractId(
        nftCollection.contractId,
        binToHex(codec.u256Codec.encode(BigInt(i))),
        0
      );

      try {
        const nftMetadata = await provider.fetchNFTMetaData(nftContractId);
        console.log(nftMetadata)
        nfts.push({
          index: i,
          contractId: nftContractId,
          tokenUri: nftMetadata.tokenUri,
          collectionId: nftMetadata.collectionId,
        });

      } catch (error) {
        console.error(`Error fetching NFT #${i}:`, error);
      }
    }

    res.json({
      collection: {
        contractId: nftCollection.contractId,
        uri: collectionMetadata.collectionUri,
        totalSupply: collectionMetadata.totalSupply
      },
      nfts
    });

  } catch (error: any) {
    console.error('Error listing NFTs:', error);
    res.status(500).json({ error: 'Failed to list NFTs', details: error.message });
  }
});


function htmlParser(realPercentage, fakePercentage, fileHash, issuedFor, collectionId, date) {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>

    <style>
      @import url("https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");
      :root {
        --primary: #7879F1;
        --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      body {
        font-family: "Poppins", sans-serif;
        padding: 0;
        margin: 0;
      }

      .certi-wrapper {
        width: 100%;
        height: 100vh;
        padding: 20px;
        display: flex;
        gap: 10px;
        justify-content: center;
        align-items: center;
      }
      .certificate {
        width: 100%;
        min-height: 100vh;
        background-color: #000;
        box-shadow: var(--shadow);
        display: flex;
      }

      .left-bar {
        min-width: 120px;
        min-height: 100%;
        background: var(--primary);
      }

      .right-side {
        width: 100%;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .certi-head {
        font-size: 28px;
        font-weight: 600;
        color: var(--primary);
      }

      .certi-head span {
        color: #fff;
      }

      .divider {
        width: 100%;
        height: 2px;
        background-color: #ccd9fb91;
      }

      .certi-flex {
        width: 100%;
        display: flex;
        justify-content: space-between;
        gap: 20px;
        margin-top: 20px;
        align-items: center;
      }

      .certi-flex-left {
        margin-top: -60px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        color: #fff;
        width: 100%;
      }

      .certi-grp {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .grp-title {
        font-weight: 300;
        font-size: 14px;
      }

      .grp-name {
        font-weight: 500;
        font-size: 20px;
      }

      .certi-id {
        font-size: 16px;
      }

      .certi-flex-right {
        display: flex;
        color: #fff;
        flex-direction: column;
        align-items: flex-end;
        gap: 10px;
        font-weight: 600;
      }

      .certi-flex-right img {
        margin-right: -25px;
      }

      .qr-sec {
        display: flex;
        color: #fff;
        font-size: 14px;
        align-items: flex-end;
        gap: 10px;
        margin-top: 20px;
      }
      .cert-img {
        padding-block: 40px;
      }
      .img-container {
        width: 100%;
        display: flex;
        align-items: center;
      }
      .prediction {
        color: #007bff;
        display: flex;
        align-items: center;
        gap: 40px;
      }
      .content {
        display: flex;
        align-items: center;
        gap: 40px;
        font-size: 30px;
      }
      .fake {
        color: #fd3992;
      }
    </style>
  </head>
  <body>
    <div class="certificate">
      <div class="left-bar"></div>
      <div class="right-side">
        <h1 class="certi-head">Un<span>Mask</span></h1>
        <div class="divider"></div>
        <div class="img-container">
          <img
            src="https://i.ibb.co/MCn5NHL/head.png"
            width="900px"
            alt="img"
            class="cert-img"
          />
          <div class="prediction">
            <div class="content">
              <div class="real">Real : ${realPercentage}%</div>
            </div>
            <div class="content">
              <div class="fake">Fake : ${fakePercentage}%</div>
            </div>
          </div>
        </div>

        <div class="certi-flex">
          <div class="certi-flex-left">
            <div class="certi-grp">
              <div class="grp-title">Issued for</div>
              <div class="grp-name">${issuedFor}</div>
              <div class="divider"></div>
            </div>
            <div class="certi-grp">
              <div class="grp-title">File Hash</div>
              <div class="grp-name certi-id">#${fileHash}</div>
              <div class="divider"></div>
            </div>
            <div class="certi-grp">
              <div class="grp-title">Collection ID & Token ID</div>
              <div class="grp-name certi-id">${collectionId}</div>
              <div class="divider"></div>
            </div>
          </div>
          <div class="certi-flex-right">
            <div class="certi-date">${date}</div>
            <img
              src="https://i.ibb.co/47CcZvw/Medallionss.png"
              width="200"
              alt=""
            />
          </div>
        </div>
        <div class="qr-sec">
          <img
            src="https://i.ibb.co/7jQhnvM/qr-code-xxl.png"
            width="80"
            alt=""
          />
          <div class="verify">Verified by unmask.com</div>
        </div>
      </div>
    </div>
  </body>
</html>
  `;
}
app.get('/create_certificate', async (req, res) => {
  try {
    const { realPercentage, fakePercentage, fileHash, issuedFor, collectionId, date } = req.query;

    // Launch Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Generate HTML content for the certificate
    var htmlString = htmlParser(realPercentage, fakePercentage, fileHash, issuedFor, collectionId, date);

    // Set the content of the page
    await page.setContent(htmlString, { waitUntil: 'networkidle0' });
    await page.setViewport({
      width: 1400,  // Width in pixels
      height: 900   // Height in pixels
    });
    // Take a screenshot
    const imageBuffer = await page.screenshot({ type: 'png' });

    // Save the image to the /certificates directory
    const fileName = `certificate_${Date.now()}.png`;
    const filePath = path.join(__dirname, 'certificates', fileName);

    // Ensure the directory exists
    if (!fs.existsSync(path.join(__dirname, 'certificates'))) {
      fs.mkdirSync(path.join(__dirname, 'certificates'));
    }

    // Write the file to disk
    fs.writeFileSync(filePath, imageBuffer);

    // Close the browser
    await browser.close();

    // Respond with both the image and file path
    res.json({
      message: 'Certificate created successfully',
      filePath: `/certificates/${fileName}`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to convert HTML to image' });
  }
});


const PORT = 3000;


app.use('/certificates', express.static(path.join(__dirname, 'certificates')));

app.listen(PORT, async () => {
  const initialized = await initialize();
  if (initialized) {
    console.log(`Server running on port ${PORT}`);
  } else {
    console.error('Server started but contract initialization failed');
  }
});