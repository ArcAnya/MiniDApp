import { gql } from "@apollo/client";

const GET_USERS_BY_IDS = gql`
  query GetUsers($ids: [ID!]!) {
    nodes(ids: $ids) {
      __typename
      ... on User {
        name
        login
        bio
        id
        url
        avatarUrl
      }
    }
  }
`;

export async function fetchUsersByIds(ids) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        const result = await fetch("https://api.github.com/graphql", {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_PAT}`,
            "Content-Type": "application/json",
          },
            method: "POST",
            body: JSON.stringify({
              query: GET_USERS_BY_IDS.loc.source.body,
              variables: {
                ids,
              },
              errorPolicy: 'all',
            }),
        });
        /* const result = await this.client.query({
          query: GET_USERS_BY_IDS,
          variables: {
            ids,
          },
          errorPolicy: 'all',
        }); */
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
    return promise;
  }