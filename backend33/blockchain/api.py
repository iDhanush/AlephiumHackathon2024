import json
import requests
import datetime
from PIL import Image
from fastapi import APIRouter
from pydantic import BaseModel

from global_var import Var
from utils import file_to_sha256
from unmask.unmasker import unmask_image
from blockchain.certificate import create_certificate

bchain_router = APIRouter(tags=['bchain'])


class PostData(BaseModel):
    user_address: str
    file_uid: str
    transction_id: str = 'xxx'


nft_url = "https://cardona-zkevm.polygonscan.com/nft/{}/{}"


@bchain_router.post('/mint_certificate')
async def mint_certificate(post_data: PostData):
    prediction = unmask_image(Image.open(f'assets/{post_data.file_uid}'))
    file_hash = file_to_sha256(f'assets/{post_data.file_uid}')
    client_address = post_data.user_address

    contract_address = requests.get(f'{Var.bchainrl}/bchain_metadata')
    contract_address = contract_address.json()
    contract_address = contract_address['contract_id']

    certificate_id = create_certificate(
        round(prediction.get('real') * 100, 2),
        round(prediction.get('fake') * 100, 2),
        file_hash,
        client_address,
        contract_address, datetime.datetime.now().date())
    certificate_url = f'{Var.base_url}/certificate/' + certificate_id
    uri = {
        "certificate_url": certificate_url,
    }

    nft_meta = requests.post(f'{Var.bchainrl}/mint_nft',
                             json={
                                 'certificate_url': certificate_url,
                                 'walletAddress': client_address
                             })
    nft_meta = nft_meta.json()
    return nft_meta


@bchain_router.get('/cert/{user_address}')
async def get_user_nfts(user_address: str):
    nfts = requests.get(f'{Var.bchainrl}/list_nft?address={user_address}')
    nfts = nfts.json()
    print(nfts['nfts'])
    nfts = [{'nfts': [{'uri': {'image': nft['tokenUri']}, 'polygon_url': '#'}]} for nft in nfts['nfts']]
    return nfts[0]
