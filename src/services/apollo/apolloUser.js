import gql from 'graphql-tag';
import apolloClient, { callGraphqlQuery, callGraphqlMutation } from './apolloService';

// 删除客户
export async function deleteUser(args) {
  const ql = gql`
    mutation{
      deleteUser(id:"${args.id}"){
        success
      }
    }
 `;
  const response = await callGraphqlMutation(ql);
  return response;
}
// 更新客户部分信息
export async function partialUpdateUserBasic(args) {
  const ql = gql`
    mutation {
      updateUserBasic(
        id: "${args.id}"
        mobile: "${args.mobile}"
        name: "${args.name}"
        sex: "${args.sex}"
        age: "${args.age}"
        birthYear: "${args.birthYear}"
        birthDay: "${args.birthDay}"
        where: "${args.where}"
        qq: "${args.qq}"
        wechat: "${args.wechat}"
        mainProject: "${args.mainProject}"
        focusProject: "${args.focusProject}"
        toBeDevelopedProject: "${args.toBeDevelopedProject}"
        haveDoneInThisHospital: "${args.haveDoneInThisHospital}"
        haveDoneInAnotherHospital: "${args.haveDoneInAnotherHospital}"
        tag: "${args.tag}"
      ) {
        id
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}
// 更新客户
export async function updateUserBasic(args) {
  const ql = gql`
    mutation {
      updateUserBasic(
        id: "${args.id}"
        mobile: "${args.mobile}"
        name: "${args.name}"
        sex: "${args.sex}"
        age: "${args.age}"
        birthYear: "${args.birthYear}"
        birthDay: "${args.birthDay}"
        where: "${args.where}"
        bigFrom: "${args.bigFrom}"
        qq: "${args.qq}"
        wechat: "${args.wechat}"
        categoryFromAd: "${args.categoryFromAd}"
        planFromAd: "${args.planFromAd}"
        categoryFromMarket: "${args.categoryFromMarket}"
        agencyFromMarket: "${args.agencyFromMarket}"
        vipLevel: "${args.vipLevel}"
        vipID: "${args.vipID}"
        idCard: "${args.idCard}"
        email: "${args.email}"
        secondPhoneNum: "${args.secondPhoneNum}"
        introducer: "${args.introducer}"
        education: "${args.education}"
        career: "${args.career}"
        marriage: "${args.marriage}"
        phoneModel: "${args.phoneModel}"
        carModel: "${args.carModel}"
        addressDetail: "${args.addressDetail}"
        medicalHistory: "${args.medicalHistory}"
        reMark: "${args.reMark}"
        mainProject: "${args.mainProject}"
        focusProject: "${args.focusProject}"
        toBeDevelopedProject: "${args.toBeDevelopedProject}"
        haveDoneInThisHospital: "${args.haveDoneInThisHospital}"
        haveDoneInAnotherHospital: "${args.haveDoneInAnotherHospital}"
        tag: "${args.tag}"
      ) {
        id
        mobile
        name
        sex
        age
        birthYear
        birthDay
        where
        bigFrom
        qq
        wechat
        categoryFromAd
        planFromAd
        categoryFromMarket
        agencyFromMarket
        vipLevel
        vipID
        idCard
        email
        secondPhoneNum
        introducer
        education
        career
        marriage
        phoneModel
        carModel
        addressDetail
        medicalHistory
        reMark
        mainProject
        focusProject
        toBeDevelopedProject
        haveDoneInThisHospital
        haveDoneInAnotherHospital
        tag
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}
// 客户列表
export async function getUsersDetail() {
  const ql = gql`
    {
      usersDetailWDView
    }
  `;
  const response = await callGraphqlQuery(ql);
  return response;
}
// 一个客户
export async function getUserBasicById(id) {
  const ql = gql`
    {
      userBasicById(id: "${id}") {
        id
        mobile
        name
        sex
        age
        birthYear
        birthDay
        where
        bigFrom
        qq
        wechat
        categoryFromAd
        planFromAd
        categoryFromMarket
        agencyFromMarket
        vipLevel
        vipID
        idCard
        email
        secondPhoneNum
        introducer
        education
        career
        marriage
        phoneModel
        carModel
        addressDetail
        medicalHistory
        reMark
        mainProject
        focusProject
        toBeDevelopedProject
        haveDoneInThisHospital
        haveDoneInAnotherHospital
        tag
        flowBalance
        freezingBalance
      }
    }
  `;
  const response = await callGraphqlQuery(ql);
  return response;
}

export async function addConsultingRecord(args) {
  const newRecord = gql`
    mutation {
      addConsultingRecord(
        userId: "${args.userId}"
        advisoryWay: "${args.advisoryWay}"
        advisoryResult: "${args.advisoryResult}"
        advisoryDetail: "${args.advisoryDetail}"
        advisorySummary: "${args.advisorySummary}"
      ) {
        success
      }
    }
  `;
  const ret = await apolloClient
    .mutate({
      fetchPolicy: 'no-cache',
      mutation: newRecord,
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.log('error', error);
      return { error };
    })
    .then(result => result);
  return ret;
}

export async function addBookingRecord(args) {
  const newRecord = gql`
    mutation {
      addBookingRecord(
        toHospitalCate: "${args.toHospitalCate}"
        time: "${args.time}"
        bookingStatus: ${args.bookingStatus}
        frontDesk: "${args.frontDesk}"
        frontDeskId:"${args.frontDeskId}"
        assistant: "${args.assistant}"
        assistantId:"${args.assistantId}"
        doctor: "${args.doctor}"
        doctorId: "${args.doctorId}"
        userId: "${args.userId}"
      ) {
        id
        user {
          name
        }
        createdAt
        creator
        bookingStatus
      }
    }
  `;
  const ret = await apolloClient
    .mutate({
      fetchPolicy: 'no-cache',
      mutation: newRecord,
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.log('error', error);
      return { error };
    })
    .then(result => result);
  return ret;
}

export async function addUser(args) {
  const newUser = gql`
    mutation {
            addUser(
              name: "${args.name}",
              sex: "${args.sex}",
              bigFrom: "${args.bigFrom}",
              where: "${args.where}",
              birthYear: "${args.birthYear}",
              birthDay:"${args.birthDay}"
              mobile: "${args.mobile}",
              wechat:"${args.wechat}"
              qq:"${args.qq}"
              age:"${args.age}"
              categoryFromAd:"${args.categoryFromAd}"
              planFromAd:"${args.planFromAd}"
              categoryFromMarket:"${args.categoryFromMarket}"
              agencyFromMarket:"${args.agencyFromMarket}"
              vipLevel:"${args.vipLevel}"
              vipID:"${args.vipID}"
              idCard:"${args.idCard}"
              email:"${args.email}"
              secondPhoneNum:"${args.secondPhoneNum}"
              introducer:"${args.introducer}"
              education:"${args.education}"
              career:"${args.career}"
              marriage:"${args.marriage}"
              phoneModel:"${args.phoneModel}"
              carModel:"${args.carModel}"
              addressDetail:"${args.addressDetail}"
              medicalHistory:"${args.medicalHistory}"
              reMark:"${args.reMark}"
              mainProject:"${args.mainProject}"
              focusProject:"${args.focusProject}"
              toBeDevelopedProject:"${args.toBeDevelopedProject}"
              haveDoneInThisHospital:"${args.haveDoneInThisHospital}"
              haveDoneInAnotherHospital:"${args.haveDoneInAnotherHospital}"
              tag:"${args.tag}"
      )
    }
  `;
  const ret = await apolloClient
    .mutate({
      fetchPolicy: 'no-cache',
      mutation: newUser,
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.log('error', error);
      return { error };
    })
    .then(result => result);
  return ret;
}

// 充值
export async function rechargeBalance(args) {
  const ql = gql`
    mutation {
      rechargeBalance(id: "${args.user.id}", balance: ${args.willPay}) {
        id
        name
      }
    }
  `;

  const response = await callGraphqlMutation(ql);
  return response;
}

// 客户登记
export async function pushAdvancedForm(args) {
  const response = apolloClient.mutate({
    variables: { formData: args },
    fetchPolicy: 'no-cache',
    mutation: gql`
      mutation($formData: FormData!) {
        acceptAdvancedForm(formData: $formData)
      }
    `,
  });
  return response;
}

// 新预约添加
export async function addBookingRecordWithConsultation(args) {
  const response = apolloClient.mutate({
    variables: { customParams: args },
    fetchPolicy: 'no-cache',
    mutation: gql`
      mutation($customParams: CustomParams!) {
        addBookingRecordWithConsultation(customParams: $customParams) {
          id
          user {
            name
          }
          createdAt
          creator
          bookingStatus
        }
      }
    `,
  });
  return response;
}
