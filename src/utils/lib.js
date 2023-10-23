export const combineBounties = (subgraphBounties, githubIssues, metadata) => {
    const fullBounties = [];
    metadata.forEach((contract) => {
      const relatedIssue = githubIssues.find((issue) => issue?.id === contract.bountyId);
      const subgraphBounty = subgraphBounties.find((bounty) => {
        return contract.address?.toLowerCase() === bounty.bountyAddress;
      });
      if (relatedIssue && subgraphBounty && !contract.blacklisted) {
        let mergedBounty = {
          alternativeName: '',
          alternativeLogo: '',
          ...relatedIssue,
          ...subgraphBounty,
          ...contract,
        };
        fullBounties.push(mergedBounty);
      }
    });
    return fullBounties;
  };

export const fetchBountiesWithServiceArg = async (appState, oldCursor, batch, ordering, filters) => {
    try {
      let { sortOrder, field } = ordering;
      if (!sortOrder) {
        sortOrder = 'desc';
      }
      if (!field) {
        field = 'createdAt';
      }
      const { types, organizationId, repositoryId, title } = filters;
      const { openQSubgraphClient, githubRepository, openQPrismaClient } = appState;
      let newCursor;
      let prismaContracts;
  
      const prismaContractsResult = await openQPrismaClient.getContractPage(
        oldCursor,
        batch,
        sortOrder,
        field,
        types,
        organizationId,
        null,
        repositoryId,
        title
      );
      prismaContracts =
        prismaContractsResult.nodes.filter((contract) => !contract.blacklisted && !contract.organization.blacklisted) ||
        [];
      newCursor = prismaContractsResult.cursor;
  
      const bountyAddresses = prismaContracts.map((bounty) => bounty.address.toLowerCase());
      const bountyIds = prismaContracts.map((contract) => contract.bountyId);
  
      let subgraphContracts = [];
      try {
        subgraphContracts = await openQSubgraphClient.getBountiesByContractAddresses(bountyAddresses);
      } catch (err) {
        throw err;
      }
      let githubIssues = [];
      try {
        githubIssues = await githubRepository.getIssueData(bountyIds);
      } catch (err) {
        githubIssues = [];
      }
      const complete = prismaContracts.length === 0;
      const fullBounties = combineBounties(subgraphContracts, githubIssues, prismaContracts);
      return {
        nodes: fullBounties,
        cursor: newCursor,
        complete,
      };
    } catch (err) {
      appState.logger.error(err);
      return { nodes: [], cursor: null, complete: true };
    }
  };

  export const formatCurrency = (input) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });
    return formatter.format(input);
  };