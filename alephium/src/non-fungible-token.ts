const express = require('express');
const cors = require('cors');
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

const app = express();

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

const PORT = 3000;
app.listen(PORT, async () => {
  const initialized = await initialize();
  if (initialized) {
    console.log(`Server running on port ${PORT}`);
  } else {
    console.error('Server started but contract initialization failed');
  }
});