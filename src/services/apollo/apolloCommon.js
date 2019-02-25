import gql from 'graphql-tag';
import { callGraphqlQuery, callGraphqlMutation } from './apolloService';

export async function getDictionaryItems() {
  const ql = gql`
    {
      dictionaries {
        id
        itemName
        itemSecondName
        rootIndex
        sortIndex
        createdAt
        itemParentId
        itemAvailiable
        ps
      }
    }
  `;
  const response = await callGraphqlQuery(ql);
  return response;
}

export async function updateDictionaryItem(args) {
  const ql = gql`
    mutation {
      updateDictionaryItem(
        id: "${args.id}"
        itemName: "${args.itemName}"
        itemSecondName:"${args.itemSecondName}"
        itemAvailiable: ${args.itemAvailiable}
        sortIndex: ${args.sortIndex}
        ps: "${args.ps}"
      ) {
        id
        itemName
        itemSecondName
        rootIndex
        sortIndex
        createdAt
        itemParentId
        itemAvailiable
        ps
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}

export async function addDictionaryItem(args) {
  const ql = gql`
    mutation {
      addDictionaryItem(
        itemName: "${args.itemName}"
        itemSecondName:"${args.itemSecondName}"
        sortIndex: ${args.sortIndex}
        itemParentId:"${args.itemParentId}"
        itemAvailiable: true
        ps:"${args.ps}"
      ) {
        id
        itemName
        itemSecondName
        rootIndex
        sortIndex
        createdAt
        itemParentId
        itemAvailiable
        ps
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}

export async function deleteDictionaryItem(args) {
  const ql = gql`
  mutation{
    deleteDictionaryItem(id:"${args.id}"){
      id
      itemName
      rootIndex
      sortIndex
      createdAt
      itemParentId
      itemAvailiable
      ps
    }
  }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}
