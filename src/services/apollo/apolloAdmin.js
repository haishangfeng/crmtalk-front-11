import gql from 'graphql-tag';
import { callGraphqlMutation, callGraphqlQuery } from './apolloService';

/**
 * @description 登录
 */
export async function apolloLogin(args) {
  const ql = gql`
    mutation {
      login(userName: "${args.userName}", password: "${args.password}") {
        userId
        token
        routePages
        departmentId
        name
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}
/**
 * @description 自动登录
 */
export async function apolloAutoLogin(args) {
  const ql = gql`
    mutation{
      autoLogin(token:"${args.token}"){
        token
        userId
        routePages
        name
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}
/**
 * @description 注册新管理员账户
 */
export async function apolloSignup(args) {
  const ql = gql`
    mutation {
      signup(
        name: "${args.name}"
        userName: "${args.userName}"
        password: "${args.password}"
        departmentId:"${args.departmentId}") {
          id
          name
          userName
          createdAt
          availiable
          departmentName
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}

/**
 *  @description 系统用户表格
 */
export async function getAdmins() {
  const ql = gql`
    {
      admins {
        id
        name
        userName
        createdAt
        availiable
        departmentName
      }
    }
  `;
  const response = await callGraphqlQuery(ql);
  return response;
}
/**
 *  @description 系统用户表格
 */
export async function updateAdmin(args) {
  const ql = gql`
    mutation {
      updateAdmin(
        id: "${args.id}"
        name:  "${args.name}"
        password:  "${args.password}"
        availiable: ${args.availiable}
        departmentId:  "${args.departmentId}"
      ) {
        id
        name
        userName
        createdAt
        availiable
        departmentName
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}
/**
 *  @description 更新管理员可用状态
 */
export async function updateAdminAvailiable(args) {
  const ql = gql`
    mutation {
      updateAdminAvailiable(id: "${args.id}", availiable: ${args.availiable}) {
        id
        name
        userName
        createdAt
        availiable
        departmentName
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}
/**
 *  @description 删除系统用户
 */
export async function deleteAdmin(args) {
  const ql = gql`
    mutation {
      deleteAdmin(id: "${args.id}") {
        id
        name
        userName
        createdAt
        availiable
        departmentName
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}

/**
 * @description 部门
 */
export async function getDepartments() {
  const ql = gql`
    {
      departments {
        id
        name
        routePages
        createdAt
        parentId
      }
    }
  `;
  const response = await callGraphqlQuery(ql);
  return response;
}
// 添加部门
export async function addDepartments(args) {
  const ql = gql`
    mutation {
addDepartment(parentId:"${args.parentId}",name: "${args.name}", routePages: [${args.routePages}]) {
        id
        name
        routePages
        createdAt
        parentId
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}
// 删除部门
export async function deleteDepartments(args) {
  const ql = gql`
    mutation {
      deleteDepartment(id: "${args.id}") {
        id
        name
        routePages
        createdAt
        parentId
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}

// 更新部门
export async function updateDepartments(args) {
  const ql = gql`
    mutation {
      updateDepartment(
        id: "${args.id}"
        parentId:"${args.parentId}"
        name: "${args.name}"
        routePages: [${args.routePages}]
      ) {
        id
        name
        routePages
        createdAt
        parentId
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}
