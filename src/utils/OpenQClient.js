import { ethers } from 'ethers';
import ClaimManagerAbi from '../artifacts/ClaimManagerV1.json';

class OpenQClient {
  constructor() {
    const url = "<PLACE-INFURA-LINK>";
    const customHttpProvider = new ethers.providers.JsonRpcProvider(url);
    customHttpProvider.getBlockNumber().then((result) => {
      console.log("Current block number: " + result);
  });

    const wallet = new ethers.Wallet("<PLACE_TEST_WALLET_PRIVATE_KEY>", customHttpProvider); 
    this.signer = wallet.provider.getSigner(wallet.address); 
  }

  /**
   *
   * @param {Web3Provider} signer An ethers.js signer
   * @returns Web3Contract
   */

  ClaimManager = () => {
    const contract = new ethers.Contract(
      "0xB37e642Cb97D02CbEDBd4Cc83b52d06B0A2F1E7c",
      ClaimManagerAbi.abi,
      this.signer
    );
    return contract;
  };
  
  hasKYC = async (_address) => {
    return new Promise(async (resolve, reject) => {
      const contract = this.ClaimManager(this.signer);
      try {
        const hasKYC = await contract.hasKYC(_address);
        resolve(hasKYC);
      } catch (error) {
        reject(error);
      }
    });
  };

}

export default OpenQClient;
