import gql from 'graphql-tag';
import apolloClient, { callGraphqlMutation, callGraphqlQuery } from './apolloService';

/**
 * @description query:咨询信息列表
 */
export async function getConsultingRecordsTable() {
  const ql = gql`
    {
      consultingRecords {
        id
        user {
          id
          name
          sex
          age
          bigFrom
          where
        }
        advisoryWay
        advisoryResult
        advisoryDetail
        advisorySummary
        createdAt
        creator
      }
    }
  `;
  const response = await callGraphqlQuery(ql);
  return response;
}

// query:预约列表
export async function getBookingRecordsTable() {
  const ql = gql`
    {
      bookingRecords {
        id
        user {
          id
          name
          vipLevel
          mobile
          wechat
          qq
          sex
          age
          birthYear
          birthDay
          where
          bigFrom
          mainProject
          focusProject
          toBeDevelopedProject
          haveDoneInThisHospital
          haveDoneInAnotherHospital
          tag
          flowBalance
          freezingBalance
        }
        consultationRecord {
          id
          advisoryWay
        }
        toHospitalCate
        bookingStatus
        time
        diagnosisResult
        diagnosisSummary
        diagnosisDetail
        frontDesk
        frontDeskId
        assistant
        assistantId
        doctor
        doctorId
        createdAt
        creatorId
        creator
        editorId
        editor
        editedAt
      }
    }
  `;
  const response = await callGraphqlQuery(ql);
  return response;
}
// mutation：更新预约记录
export async function updateBookingRecord(args) {
  const ql = gql`
  mutation{
    updateBookingRecord(
      id: "${args.id}"
      toHospitalCate:"${args.toHospitalCate}"
      bookingStatus: ${args.bookingStatus}
      time: "${args.time}"
      frontDesk: "${args.frontDesk}"
      frontDeskId: "${args.frontDeskId}"
      assistant: "${args.assistant}"
      assistantId: "${args.assistantId}"
      doctor:"${args.doctor}"
      doctorId: "${args.doctorId}"
      diagnosisResult: "${args.diagnosisResult}"
      diagnosisSummary: "${args.diagnosisSummary}"
      diagnosisDetail: "${args.diagnosisDetail}"
    )
    {
      id
      user{
          id
          name
          vipLevel
          sex
          age
          where
          bigFrom
          mainProject
      }
      toHospitalCate
      bookingStatus
      time
      frontDesk
      frontDeskId
      assistant
      assistantId
      doctor
      doctorId
      createdAt
      creatorId
      creator
      editorId
      editor
      editedAt
    }
  }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}

/**
 * @description query:广告类别
 */
export async function getAds() {
  const ql = gql`
    {
      ads {
        id
        typeName
        plan
        availiable
        createdAt
        editor
      }
    }
  `;
  const response = await callGraphqlQuery(ql);
  return response;
}

/**
 * @description mutation:广告类别新增
 */
export async function addAd(args) {
  const ql = gql`
    mutation {
      addAd(typeName: "${args.typeName}", plan: "${args.plan}", availiable: ${args.availiable}) {
        success
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}

/**
 * @description mutation:更新广告
 */
export async function updateAd(args) {
  const ql = gql`
    mutation {
      updateAd(
        id: "${args.id}"
        typeName: "${args.typeName}"
        plan: "${args.plan}"
        availiable: args.availiable
      ) {
        success
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}

/**
 * @description query:广告消费量
 */
export async function getAdConsumptions() {
  const ql = gql`
    {
      adConsumptions {
        id
        typeName
        plan
        displayAmount
        clickAmount
        consumption
        time
        creator
      }
    }
  `;
  const response = await callGraphqlQuery(ql);
  return response;
}

/**
 * @description mutation:添加广告消费记录
 */
export async function addAdConsumptionItem(args) {
  const ql = gql`
      mutation {
        addAdConsumptionRec(
          typeName: "${args.typeName}"
          clickAmount: ${args.clickAmount}
          consumption: ${args.consumption}
          plan: "${args.plan}"
          displayAmount: ${args.displayAmount}
          time: "${args.time}"
        ) {
          id
          typeName
          plan
          displayAmount
          clickAmount
          consumption
          time
          creator
        }
      }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}

/**
 * @description mutation:删除广告消费记录
 */
export async function deleteAdConsumptionItem(args) {
  const ql = gql`
    mutation {
      deleteAdConsumptionRec(id: "${args.id}") {
        id
        typeName
        plan
        displayAmount
        clickAmount
        consumption
        time
        editor
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}
/**
 * @description mutation:更新广告消费记录
 */
export async function updateAdConsumptionItem(args) {
  const ql = gql`
    mutation {
      updateAdConsumptionRec(
        id: "${args.id}"
        typeName: "${args.typeName}"
        clickAmount: ${args.clickAmount}
        consumption: ${args.consumption}
        plan: "${args.plan}"
        displayAmount: ${args.displayAmount}
        time: "${args.time}"
      ) {
        id
        typeName
        plan
        displayAmount
        clickAmount
        consumption
        time
        editor
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}
// query:咨询工作量
export async function getConsultationWorks() {
  const ql = gql`
    {
      consultationWorks {
        id
        dialogA
        dialogB
        dialogC
        workTime
        consultationType
        creator
        createdAt
      }
    }
  `;
  const response = await callGraphqlQuery(ql);
  return response;
}

// query:咨询工作量
export async function apolloGetCrBrToday(dateFrom, dateTo, adminId) {
  const ql = gql`
    {
      todaysConsultationWorks(dateFrom: "${dateFrom}", dateTo: "${dateTo}",adminId:"${adminId}")
    }
  `;
  const response = await callGraphqlQuery(ql);
  return response;
}
// 添加咨询工作量
export async function addConsultationWork(args) {
  const ql = gql`
      mutation {
        addConsultationWork(
          consultationType: "${args.consultationType}"
          dialogC: ${args.dialogC}
          dialogA: ${args.dialogA}
          dialogB: ${args.dialogB}
          workTime: "${args.workTime}"
        ) {
          id
          creator
          dialogA
          dialogB
          dialogC
          workTime
          consultationType
        }
      }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}
// mutation: 编辑咨询工作量
export async function updateConsultationWork(args) {
  const ql = gql`
    mutation {
      updateConsutationWork(
        id: "${args.id}"
        consultationType: "${args.consultationType}"
        dialogC: ${args.dialogC}
        dialogA: ${args.dialogA}
        dialogB: ${args.dialogB}
        workTime: "${args.workTime}"
      ) {
        id
        creator
        dialogA
        dialogB
        dialogC
        workTime
        consultationType
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}
// mutation: 删除咨询工作量
export async function deleteConsultationWork(args) {
  const ql = gql`
    mutation {
      deleteConsultationWork(id: "${args.id}") {
        id
        creator
        dialogA
        dialogB
        dialogC
        workTime
        consultationType
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}

// 机构 query列表
export async function getAgencies() {
  const ql = gql`
    {
      agencies {
        id
        agencyName
        agencyType
        detail
        headTel
        coStatus
        dealTime
        marketor
        availiable
        agencyHead
        contactTel
        introducer
        commission
        agencyLevel
        whereLevel1
        whereLevel2
        whereDetail
        agencyContact
        createdAt
      }
    }
  `;
  const response = await callGraphqlQuery(ql);
  return response;
}
// 机构 mutation add
export async function addAgency(args) {
  const ql = gql`
    mutation {
      addAgency(
        agencyContact: "${args.agencyContact}"
        agencyHead: "${args.agencyContact}"
        agencyLevel: "${args.agencyLevel}"
        agencyName: "${args.agencyName}"
        agencyType: "${args.agencyType}"
        availiable: ${args.availiable}
        coStatus: "${args.coStatus}"
        commission: ${args.commission}
        contactTel: "${args.contactTel}"
        dealTime: "${args.dealTime}"
        detail: "${args.detail}"
        headTel: "${args.headTel}"
        introducer:"${args.introducer}"
        marketor: "${args.marketor}"
        whereDetail:"${args.whereDetail}"
        whereLevel1:"${args.whereLevel1}"
        whereLevel2: "${args.whereLevel2}"
      ) {
        id
        agencyName
        agencyType
        detail
        headTel
        coStatus
        dealTime
        marketor
        availiable
        agencyHead
        contactTel
        introducer
        commission
        agencyLevel
        whereLevel1
        whereLevel2
        whereDetail
        agencyContact
        createdAt
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}
// 机构 mutation update
export async function updateAgency(args) {
  const ql = gql`
    mutation {
      updateAgency(
        id: "${args.id}"
        agencyName: "${args.agencyName}"
        agencyType: "${args.agencyType}"
        detail: "${args.detail}"
        headTel: "${args.headTel}"
        coStatus: "${args.coStatus}"
        dealTime:"${args.dealTime}"
        marketor: "${args.marketor}"
        availiable: ${args.availiable}
        commission: ${args.commission}
        agencyHead: "${args.agencyHead}"
        contactTel: "${args.contactTel}"
        introducer: "${args.introducer}"
        agencyLevel:"${args.agencyLevel}"
        whereLevel1:"${args.whereLevel1}"
        whereLevel2: "${args.whereLevel2}"
        whereDetail:"${args.whereDetail}"
        agencyContact: "${args.agencyContact}"
      ) {
        id
        agencyName
        agencyType
        detail
        headTel
        coStatus
        dealTime
        marketor
        availiable
        agencyHead
        contactTel
        introducer
        commission
        agencyLevel
        whereLevel1
        whereLevel2
        whereDetail
        createdAt
        agencyContact
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}

// 机构 mutation delete
export async function deleteAgency(args) {
  const ql = gql`
    mutation {
      deleteAgency(id: "${args.id}") {
        id
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}

//  查询回访任务
export async function getReturnVisit() {
  const ql = gql`
    {
      returnVisitTasks {
        id
        isCompleted
        name
        userId
        tel
        type
        topic
        status
        returnVisitDate
        returnVisitor
        returnVisitorId
      }
    }
  `;
  const response = await callGraphqlQuery(ql);
  return response;
}

// 查询回访记录
export async function getReturnVisitReocrd() {
  const ql = gql`
    {
      returnVisitRecords {
        id
        name
        taskId
        userId
        type
        topic
        result
        way
        flow
        createdAt
        creator
      }
    }
  `;
  const response = await callGraphqlQuery(ql);
  return response;
}

/**
 * @description mutation:添加回访记录
 */
export async function addReturnVisitRecord(args) {
  const taskId = args.taskId ? `taskId:"${args.taskId}"` : '';
  const ql = gql`
      mutation {
        addReturnVisitRecord(
          ${taskId}
          recordDetail:"${args.recordDetail}"
          name:"${args.name}"
          userId:"${args.userId}"
          type:"${args.type}"
          topic:"${args.topic}"
          result:"${args.result}"
          way:"${args.way}"
          flow:"${args.flow}"
        ) {
          id
          name
          taskId
          userId
          type
          topic
          result
          way
          flow
          createdAt
          creator
        }
      }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}

/**
 * @description mutation:添加回访任务
 */
export async function addReturnVisitTask(args) {
  const ql = gql`
      mutation {
        addReturnVisitTask(
         name:"${args.name}"
         userId:"${args.userId}"
         tel:"${args.mobile}"
         type:"${args.type}"
         topic:"${args.topic}"
         status:"${args.status}"
         returnVisitDate:"${args.returnVisitDate}"
         returnVisitorId:"${args.returnVisitorId}"
         returnVisitor:"${args.returnVisitor}"
        ) {
          isCompleted
         name
         userId
         tel
         type
         topic
         status
         returnVisitDate
         returnVisitor
         returnVisitorId
        }
      }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}

// mutation: 删除回访记录
export async function deleteReturnVisitRecord(args) {
  const ql = gql`
    mutation {
      deleteReturnVisitRecord(id: "${args.id}") {
       id
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}

// mutation: 删除回访任务
export async function deleteReturnVisitTask(args) {
  const ql = gql`
    mutation {
      deleteReturnVisitTask(id: "${args.id}") {
        id
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}

//  updateReturnVisitTask
export async function updateReturnVisitTask(args) {
  const ql = gql`
   mutation {
        updateReturnVisitTask(
         id:"${args.id}"
         name:"${args.name}"
         userId:"${args.userId}"
         tel:"${args.mobile}"
         type:"${args.type}"
         topic:"${args.topic}"
         status:"${args.status}"
         returnVisitDate:"${args.returnVisitDate}"
         returnVisitorId:"${args.returnVisitorId}"
         returnVisitor:"${args.returnVisitor}"
        ) {
         isCompleted
         name
         userId
         tel
         type
         topic
         status
         returnVisitDate
         returnVisitor
         returnVisitorId
        }
      }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}

// 消费单表格
export async function getBills() {
  const ql = gql`
    {
      bills {
        id
        user {
          id
          name
          sex
          vipLevel
          bigFrom
          age
          flowBalance
          freezingBalance
        }
        bookingRecord {
          id
          toHospitalCate
          bookingStatus
          diagnosisSummary
          assistant
          time
        }
        idCode
        paid
        discount
        totalPrice
        paymentStatus
        isCompleted
        isOnlyDepositBill
        flowBalance
        freezingBalance
        deposit
        billDetail
        createdAt
        creator
      }
    }
  `;
  const response = await callGraphqlQuery(ql);
  return response;
}
// 消费单表格辅表
export async function getBillsDetails() {
  const ql = gql`
    {
      billsDetails {
        id
        billId
        amount
        project
        quantifier
        unitPrice
        creator
      }
    }
  `;
  const response = await callGraphqlQuery(ql);
  return response;
}
export async function getBillsDetailsByBillId(args) {
  const ql = gql`
    {
      billsDetaildsByBillId(id:"${args.id}"){
        id
        billId
        amount
        project
        quantifier
        unitPrice
        creator
      }
    }
  `;
  const response = await callGraphqlQuery(ql);
  return response;
}

// 开单
export async function addBill(args) {
  const response = apolloClient.mutate({
    variables: { billDetail: args.billDetail },
    mutation: gql`
    mutation($billDetail:CustomBillDetail!) {
      addBill(
        userId: "${args.userId}"
        bookingRecordId: "${args.bookingRecordId}"
        discount:${args.discount}
        totalPrice:${args.discountPrice}
        billDetail: $billDetail
        paymentType: ${args.paymentType}
        shouldPay:${args.shouldPay}
        depositReadyIn:${args.depositReadyIn},
        usedBalance:${args.usedBalance},
        isOnlyDepositBill:${args.isOnlyDepositBill}
      ) {
        id
        user {
          name
        }
        createdAt
      }
    }
    `,
  });
  return response;
}

// 消费记录表
export async function getPayments() {
  const ql = gql`
    {
      payments {
        id
        bill {
          id
          paid
          totalPrice
          billDetail
          user {
            id
            name
          }
        }
        shouldPay
        confirmed
        paymentPS
        paymentType
        paymentWay
        balance
        creator
        createdAt
      }
    }
  `;
  const response = await callGraphqlQuery(ql);
  return response;
}

// 消费记录添加
export async function addPayment(args) {
  const ql = gql`
    mutation {
      addPayment(
        billId: "${args.billId}"
        balance: ${args.usedBalance}
        shouldPay: ${args.shouldPay}
        paymentPS: "${args.paymentPS}"
        paymentType: ${args.paymentType}
      ) {
        id
        confirmed
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}

// 消费记录确认
export async function pay(args) {
  const ql = gql`
    mutation {
      pay(id: "${args.id}", paymentWay: ${args.paymentWay}) {
        id
        confirmed
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}

// 确认退费
export async function payback(args) {
  const ql = gql`
    mutation {
      payback(id: "${args.id}") {
        id
        confirmed
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}
// 手术安排
export async function addSurgery(args) {
  const ql = gql`
    mutation {
      addSurgery(
        billId: "${args.billId}"
        doctor: "${args.doctor}"
        surgeryPS: "${args.surgeryPS}"
        surgeryName: "${args.surgeryName}"
        reservationTime: "${args.reservationTime}"
      ) {
        id
        createdAt
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}

// 疗程安排
export async function addTreatment(args) {
  const ql = gql`
    mutation {
      addTreatment(
        billId: "${args.billId}"
        doctor: "${args.doctor}"
        treatmentPS: "${args.treatmentPS}"
        treatmentTimes: ${args.treatmentTimes}
        treatmentName: "${args.treatmentName}"
      ) {
        id
        createdAt
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}

// 手术表
export async function getSurgeries() {
  const ql = gql`
    {
      surgeries {
        id
        bill {
          user {
            name
            sex
            age
          }
        }
        doctor
        surgeryName
        surgeryStatus
        surgeryPS
        reservationTime
      }
    }
  `;
  const response = await callGraphqlQuery(ql);
  return response;
}

// 疗程表
export async function getTreatments() {
  const ql = gql`
    {
      treatments {
        id
        bill {
          user {
            name
            sex
            age
          }
        }
        doctor
        treatmentName
        treatmentTimes
        currentTreatmentTimes
        treatmentStatus
        treatmentPS
      }
    }
  `;
  const response = await callGraphqlQuery(ql);
  return response;
}

// 疗程表修改
export async function editSurgery(args) {
  const ql = gql`
    mutation {
      editSurgery(
        id: "${args.id}"
        doctor: "${args.doctor}"
        surgeryPS: "${args.surgeryPS}"
        surgeryName: "${args.surgeryName}"
        surgeryStatus: ${args.surgeryStatus}
        reservationTime: "${args.reservationTime}"
      ) {
        id
        editor
        editorId
        editedAt
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}

// 疗程表修改
export async function editTreatment(args) {
  const ql = gql`
    mutation {
      editTreatment(
        id: "${args.id}"
        doctor: "${args.doctor}"
        treatmentPS: "${args.treatmentPS}"
        treatmentName:"${args.treatmentName}"
        treatmentTimes:${args.treatmentTimes}
        treatmentStatus: ${args.treatmentStatus}
        currentTreatmentTimes: ${args.currentTreatmentTimes}
      ) {
        id
        doctor
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}
// 疗程表修改
export async function opTreatment(args) {
  const ql = gql`
    mutation {
      opTreatment(id: "${args.id}") {
        id
        editor
        treatmentStatus
        currentTreatmentTimes
        editorId
      }
    }
  `;
  const response = await callGraphqlMutation(ql);
  return response;
}
