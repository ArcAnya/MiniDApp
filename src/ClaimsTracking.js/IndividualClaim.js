import React, { useEffect, useRef, useState } from 'react';
import { LinkIcon } from '@primer/octicons-react';
import useWeb3 from '../hooks/useWeb3';
import CopyAddressToClipboard from '../copyAddressToClipboard';
import useIsOnCorrectNetwork from '../hooks/useIsOnCorrectNetwork';
import OpenQSubgraphClient from '../utils/OpenQSubgraphClient';
import OpenQPrismaClient from '../utils/OpenQPrismaClient';
import OpenQClient from '../utils/OpenQClient';

const openQClient = new OpenQClient();
const openQSubgraphClient = new OpenQSubgraphClient();
const openQPrismaClient = new OpenQPrismaClient();

const IndividualClaim = ({
  payout,
  bounty,
  index,
  gridFormat,
  setFilteredTiers,
  filteredTiers,
  setFilteredInfo,
  filteredInfo,
  filters,
  winnersInfo,
  setCsvData,
  csvData
}) => {
  const modalRef = useRef();
  const buttonRef = useRef();
  const [showAccountModal, setShowAccountModal] = useState();
  const { chainId, library, account, error } = useWeb3();
  const [isOnCorrectNetwork] = useIsOnCorrectNetwork({
    chainId: chainId,
    error: error,
    account: account,
  });

  const formattedToken = payout / 1000000;
  const githubUserId = bounty.tierWinners?.[index];
  const githubUser = winnersInfo && winnersInfo?.find((winner) => winner.id === githubUserId);
  const [associatedAddress, setAssociatedAddress] = useState('');
  const [requested, setRequested] = useState(false);
  const [message, setMessage] = useState('');
  const [KYC, setKYC] = useState(false);
  const zeroAddress = '0x0000000000000000000000000000000000000000';
  const githubFilter = filters?.github;
  const claimFilter = filters?.claimed;
  const w8Filter = filters?.w8 || 'all';
  const kycFilter = filters?.kyc || 'all';
  const walletFilter = filters?.walletAddress;
  const [w8Status, setW8Status] = useState('NOT SENT');
  const [walletCondition, setWalletCondition] = useState(true);
  const githubCondition =
    githubFilter && !githubUserId?.includes(githubFilter) && !githubUser?.login.includes(githubFilter);
  const [claimed, setClaimed] = useState(bounty?.claims?.some((claim) => claim.tier === index));
  const [claimCondition, setClaimCondition] = useState(true);
  const w8Condition = w8Filter !== 'all' && w8Filter !== w8Status.toLowerCase();
  const kycCondition = (kycFilter === 'true' && !KYC) || (kycFilter === 'false' && KYC);
  const [hide, setHide] = useState('');


  useEffect(() => {
    let handler = (event) => {
      if (!modalRef.current?.contains(event.target) && !buttonRef.current?.contains(event.target)) {
        setShowAccountModal(false);
      }
    };
    window.addEventListener('mousedown', handler);

    return () => {
      window.removeEventListener('mousedown', handler);
    };
  });
  useEffect(() => {
    const claimCondition = (claimFilter === 'true' && !claimed) || (claimFilter === 'false' && claimed);
    setClaimCondition(claimCondition);
  }, [claimFilter, claimed]);
  useEffect(() => {
    const checkRequested = async () => {
      if (githubUserId) {
        try {
          const user = await openQPrismaClient.getPublicUser(githubUserId);
          if (user) {
            const request = bounty.requests?.nodes?.find((node) => node.requestingUser.id === user.id);
            setRequested(request);
            if (request) {
              const privateRequest = await openQPrismaClient.getPrivateRequest(request.id);
              setMessage(privateRequest?.message);
            }
          }
        } catch (err) {
          console.log(err, 'IndividualClaim.js1');
        }
      }
    };
    const checkAssociatedAddress = async () => {
      if (githubUserId) {
        try {
          const associatedAddressSubgraph = await openQSubgraphClient.getUserByGithubId(githubUserId);
          const associatedAddress = associatedAddressSubgraph?.id;
          if (associatedAddress !== zeroAddress) {
            setAssociatedAddress(associatedAddress);
          }
        } catch (err) {
          console.log(err, 'IndividualClaim.js2');
        }
      }
    };
    checkRequested();
    checkAssociatedAddress();
  }, [githubUserId]);
  useEffect(() => {
    setClaimed(bounty?.claims?.some((claim) => claim.tier === index));
    const currentW8Status = bounty.supportingDocumentsCompleted?.[index]
      ? 'APPROVED'
      : requested
      ? 'PENDING'
      : 'NOT SENT';
    setW8Status(currentW8Status);
  }, [bounty, requested, w8Filter]);
  useEffect(() => {
    checkWallet();
  }, [walletFilter, associatedAddress]);
  useEffect(() => {
    let newFilteredTiers = filteredTiers;
    let newCount = 0;
    let newFilteredInfo = filteredInfo;
    if (githubCondition || claimCondition || w8Condition || kycCondition || !walletCondition) {
      newFilteredTiers[index] = false;
      newCount = newFilteredTiers?.filter((value) => value === true)?.length || 0;
      setHide('hidden');
    } else {
      newFilteredTiers[index] = true;
      newCount = newFilteredTiers?.filter((value) => value === true)?.length || 0;
      setHide('');
    }
    setFilteredTiers(newFilteredTiers);
    newFilteredInfo[bounty.id] = { filteredCount: newCount };
    setFilteredInfo({ ...filteredInfo, ...newFilteredInfo });
  }, [filters, githubCondition, claimCondition, w8Condition, kycCondition, walletCondition]);
  useEffect(() => {
    if (associatedAddress && chainId === 137) hasKYC();
  }, [chainId, associatedAddress]);
  const checkWallet = () => {
    if (walletFilter?.length > 0) {
      setWalletCondition(associatedAddress?.toLowerCase().includes(walletFilter.toLowerCase()));
    } else {
      setWalletCondition(true);
    }
  };
  const hasKYC = async () => {
    try {
      const transaction = await openQClient.hasKYC(library, associatedAddress);
      if (transaction) {
        setKYC(true);
      }
    } catch (err) {
      console.log(err, 'IndividualClaim.js3');
    }
  };
  const newCsvData = { 
    orgName: bounty.alternativeName,
    bountyTitle: bounty.title,
    bountyId: bounty.bountyId,
    bountyAddress: bounty.bountyAddress,
    issueGithubUrl: bounty.url,
    githubLogin: githubUser.login,
    githubId: githubUserId,
    githubUrl: githubUser.url,
    planned: `${formattedToken} USD`,
    w8w9: bounty.supportingDocumentsCompleted?.[index] ? 'APPROVED' : requested ? 'PENDING' : 'NOT SENT',
    kyc: KYC ? 'TRUE' : 'FALSE',
    wallet: associatedAddress,
    walletLink: `https://polygonscan.com/address/${associatedAddress}`,
    claimed: claimed ? 'TRUE' : 'FALSE',
    claimedAmount: 0,
    claimedDate: 'n/a'
  }
  /* useEffect(() => {
  setCsvData([...csvData, newCsvData])
  }, [newCsvData]) */
  console.log("csvReady", csvData);
  return (
    <div className={`${hide} text-sm items-center gap-4 ${gridFormat}`}>
      {githubUserId ? (
        <div className='flex gap-2 '>
          {githubUser?.url ? (
            <a href={githubUser?.url} target='_blank' rel='noreferrer' className=' text-link-colour hover:underline '>
              {githubUser.login}
            </a>
          ) : (
            'Loading...'
          )}{' '}
          ({githubUserId})
        </div>
      ) : (
        <div className='text-gray-500'> Not Yet Assigned</div>
      )}
      <div className='flex justify-center'>
        {formattedToken} USD
      </div>
      <div
        className={`flex justify-center ${
          bounty.supportingDocumentsCompleted?.[index]
            ? 'font-bold text-green'
            : requested
            ? 'text-red-400'
            : 'text-gray-500'
        }`}
      >
        {!bounty.supportingDocumentsCompleted?.[index] && message ? (
          <div>
            <button
              ref={buttonRef}
              onClick={() => {
                setShowAccountModal(!showAccountModal);
              }}
              className='group flex items-center gap-x-1 whitespace-nowrap font-semibold cursor-pointer'
            >
              <div>{w8Status}</div>
              <div className='cursor-pointer p-0 rounded-full border border-[#c9d1d9] aspect-square leading-3 h-3 box-content text-center font-bold text-primary text-xs'>
                i
              </div>
            </button>
            {showAccountModal && (
              <div className='flex mr-4 flex-col items-center'>
                <div className='flex -mt-1 tooltip-triangle absolute'></div>
                <div className='flex z-10 -mt-1 tooltip-triangle absolute'></div>

                <div ref={modalRef} className='flex absolute  max-w-[960px] flex-col mt-0 z-[5] tooltip rounded-sm p-0'>
                  <div className='flex whitespace-normal text-[#c9d1d9] items-center w-full p-2'>
                    Requested changes: {message}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>{w8Status}</>
        )}
      </div>
      <div className={`flex justify-center ${KYC && 'font-bold text-green'}`}>
        {isOnCorrectNetwork ? KYC.toString().toUpperCase() : 'n.a.*'}
      </div>
      <div className={`flex justify-center`}>
        {associatedAddress ? (
          <div className='flex items-center gap-1'>
            <CopyAddressToClipboard clipping={[3, 39]} data={associatedAddress} styles={''} />
            <a href={`https://polygonscan.com/address/${associatedAddress}`} target='_blank' rel='noreferrer'  className='text-link-colour hover:underline'>
              <LinkIcon />
            </a>
          </div>
        ) : (
          <span className='text-gray-500'>---</span>
        )}
      </div>
      <div className={`flex justify-center ${claimed && 'font-bold text-green'}`}>{claimed ? 'TRUE' : 'FALSE'}</div>
    </div>
  );
};

export default IndividualClaim;
