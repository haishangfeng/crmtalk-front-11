/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
import ApolloBoost from 'apollo-boost';

const apolloClient = new ApolloBoost({
  uri: 'http://localhost:4000/',
  request: async operation => {
    const token = localStorage.getItem('crm-token');

    operation.setContext({
      headers: {
        authorization: token,
      },
    });
  },
  fetch,
  onError: error => {
    console.error('apolloService Error: ', error);
    const errors = error.response && error.response.errors;
    if (errors) {
      for (const { message } of errors) {
        if (message.match('Not authorized') || message.match('jwt expired')) {
          apolloClient
            .clearStore()
            .then(() => {
              window.location.href = '/user/login';
            })
            .catch(e => {
              console.error('Failed to clear store', e);
            });
        }
      }
    }
  },
});

export async function callGraphqlQuery(ql) {
  const response = await apolloClient
    .query({
      query: ql,
      fetchPolicy: 'no-cache',
    })
    .catch(error => {
      console.log(error);
      return error;
    })
    .then(result => result);
  return response;
}

export async function callGraphqlMutation(ql) {
  const ret = apolloClient
    .mutate({
      mutation: ql,
      fetchPolicy: 'no-cache',
    })
    .catch(error => {
      console.log('error', error);
      return { error };
    })
    .then(result => result);
  return ret;
}

export default apolloClient;
