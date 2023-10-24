import { ethers } from 'ethers';
import OpenQABI from '../artifacts/OpenQV1.json';
import ClaimManagerAbi from '../artifacts/ClaimManagerV1.json';
import KYCABI from '../artifacts/MockKyc.json';

import ERC20ABI from '../artifacts/ERC20.json';

class OpenQClient {
  constructor() {}

  /**
   *
   * @param {Web3Provider} signer An ethers.js signer
   * @returns Web3Contract
   */
  OpenQ = (signer) => {
    const contract = new ethers.Contract(process.env.OPENQ_PROXY_ADDRESS, OpenQABI.abi, signer);
    return contract;
  };

  ClaimManager = (signer) => {
    const contract = new ethers.Contract(
      process.env.CLAIM_MANAGER_PROXY_ADDRESS,
      ClaimManagerAbi.abi,
      signer
    );
    return contract;
  };

  /**
   *
   * @param {string} tokenAddress Contract address of an ERC20 token
   * @param {Web3Provider} signer An ethers.js signer
   * @returns Web3Contract
   */
  ERC20 = (tokenAddress, signer) => {
    const contract = new ethers.Contract(tokenAddress, ERC20ABI.abi, signer);
    return contract;
  };

  KYC = (signer) => {
    const contract = new ethers.Contract(process.env.KYC_ADDRESS, KYCABI.abi, signer);
    return contract;
  };

  hasKYC = async (library, _address) => {
    return new Promise(async (resolve, reject) => {
      const signer = library.getSigner();
      const contract = this.ClaimManager(signer);
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
