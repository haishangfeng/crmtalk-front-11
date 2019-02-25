export default [
  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', component: './User/Login' },
    ],
  },
  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    authority: [0],
    routes: [
      // dashboard
      { path: '/', redirect: '/priviledgeManage/adminsManage' },
      // forms
      {
        path: '/consultation',
        icon: 'mobile',
        name: 'consultation',
        authority: [0],
        routes: [
          {
            path: '/consultation/advancedFormConsultation',
            name: 'advancedform',
            component: './Consultation/AdvancedFormConsultation',
            icon: 'right',
          },
          {
            path: '/consultation/consultationList',
            name: 'consultationList',
            component: './Consultation/ConsultationList',
            icon: 'right',
          },
          {
            path: '/consultation/reservationList',
            name: 'reservationList',
            component: './Consultation/Reserve',
            icon: 'right',
          },
          {
            path: '/consultation/customerList',
            name: 'customerList',
            component: './Consultation/customerList',
            icon: 'right',
          },
          {
            path: '/consultation/BilledList',
            name: 'BilledList',
            component: './Consultation/BilledList',
            icon: 'right',
          },
          {
            path: '/consultation/reserveworkload',
            name: 'reserveworkload',
            component: './Consultation/ReserveWorkload',
            icon: 'right',
          },
        ],
      },
      // list
      {
        path: '/ad',
        icon: 'bar-chart',
        name: 'ad',
        authority: [1],
        routes: [
          {
            path: '/ad/consultationList',
            name: 'consultationList',
            component: './Ad/ConsultationList',
            icon: 'right',
          },
          {
            path: '/ad/reserve-list',
            name: 'reservationList',
            component: './Ad/Reserve',
            icon: 'right',
          },
          {
            path: '/ad/adConsumptionList',
            name: 'adConsumptionList',
            component: './Ad/adConsumptionList',
            icon: 'right',
          },
        ],
      },
      {
        path: '/market',
        icon: 'fund',
        name: 'market',
        authority: [2],
        routes: [
          {
            path: '/market/advanced-form',
            icon: 'right',
            name: 'advancedform',
            component: './Market/AdvancedFormMarket',
          },
          // {
          //   path: '/market/account',
          //   icon: 'right',
          //   name: 'account',
          //   component: './Dashboard/Analysis',
          // },
          {
            path: '/market/reservation',
            icon: 'right',
            name: 'Agency',
            component: './Market/Agency',
          },
          {
            path: '/market/agency-form',
            icon: 'right',
            name: 'agency-form',
            component: './Market/AgencyForm',
          },
        ],
      },
      {
        path: '/frontDesk',
        icon: 'phone',
        name: 'frontDesk',
        authority: [3],
        routes: [
          {
            path: '/frontDesk/account',
            icon: 'right',
            name: 'account',
            component: './Dashboard/Analysis',
          },
          {
            path: '/frontDesk/userBasic',
            icon: 'right',
            name: 'userBasic',
            component: './FrontDesk/AdvancedFormFrontDesk',
          },
          {
            path: '/frontDesk/reserve-list',
            icon: 'right',
            name: 'reservationList',
            component: './FrontDesk/ReserveFD',
          },
          {
            path: '/frontDesk/customerList',
            icon: 'right',
            name: 'customerList',
            component: './FrontDesk/customerList',
          },
        ],
      },
      {
        path: '/assistant',
        icon: 'fork',
        name: 'assistant',
        authority: [4],
        routes: [
          {
            //已到院列表接诊
            path: '/assistant/reserve-list',
            name: 'reservationList',
            component: './Assistant/ReserveAssistant',
            icon: 'right',
          },
          {
            //已接诊列表开单
            path: '/assistant/waitingbilling-list',
            name: 'ReservationWaitingBilling',
            component: './Assistant/ReservationWaitingBilling',
            icon: 'right',
          },
          {
            //消费单表
            path: '/assistant/billed',
            name: 'billed',
            component: './Assistant/BilledListAssistant',
            icon: 'right',
          },
          {
            //已收费列表
            path: '/assistant/charged',
            name: 'charged',
            component: './Assistant/CompletedBillList',
            icon: 'right',
          },
        ],
      },
      {
        path: '/charging',
        icon: 'dollar',
        name: 'charging',
        authority: [5],
        routes: [
          {
            path: '/charging/reserve-list',
            icon: 'right',
            name: 'reservationList',
            component: './Charging/ReserveCharging',
          },
        ],
      },
      {
        path: '/doctor',
        icon: 'user-add',
        name: 'doctor',
        authority: [6],
        routes: [
          {
            path: '/doctor/reservationList',
            icon: 'right',
            name: 'reservationList',
            component: './Doctor/CompletedBillListDoctor',
          },
          {
            path: '/doctor/surgeriesList',
            icon: 'right',
            name: 'surgeriesList',
            component: './Doctor/SurgeriesList',
          },
          {
            path: '/doctor/treatmentsManage',
            icon: 'right',
            name: 'treatmentsList',
            component: './Doctor/TreatmentsList',
          },
        ],
      },
      {
        path: '/customerservice',
        icon: 'smile',
        name: 'customerservice',
        authority: [7],
        routes: [
          {
            path: '/customerservice/customerList',
            name: 'customerList',
            component: './customerservice/customerList',
            icon: 'right',
          },
          {
            path: '/customerservice/returnVisitTask',
            icon: 'right',
            name: 'returnVisitTask',
            component: './customerservice/returnVisitTask',
          },
          {
            path: '/customerservice/returnVisitRecord',
            icon: 'right',
            name: 'returnVisitRecord',
            component: './customerservice/returnVisitRecord',
          },
        ],
      },
      {
        //字典页
        name: 'dictionary',
        icon: 'book',
        path: '/dictionary',
        authority: [8],
        routes: [
          {
            path: '/dictionary/personalProp',
            name: 'personalProp',
            component: './Dictionary/PersonalProp',
            icon: 'right',
          },
          {
            path: '/dictionary/Ad',
            name: 'Ad',
            component: './Dictionary/Ad',
            icon: 'right',
          },
          {
            path: '/dictionary/Tracing',
            name: 'Tracing',
            component: './Dictionary/Trace',
            icon: 'right',
          },
          {
            path: '/dictionary/Agency',
            name: 'Agency',
            component: './Dictionary/Agency',
            icon: 'right',
          },
          {
            path: '/dictionary/Bill',
            name: 'Bill',
            component: './Dictionary/Bill',
            icon: 'right',
          },
          {
            path: '/dictionary/Production',
            name: 'Production',
            component: './Dictionary/Production',
            icon: 'right',
          },
          {
            path: '/dictionary/Treatment',
            name: 'Treatment',
            component: './Dictionary/Treatment',
            icon: 'right',
          },
          {
            path: '/dictionary/MainProject',
            name: 'MainProject',
            component: './Dictionary/MainProject',
            icon: 'right',
          },
          {
            path: '/dictionary/Tag',
            name: 'Tag',
            component: './Dictionary/Tag',
            icon: 'right',
          },
          {
            path: '/dictionary/Consultation',
            name: 'Consultation',
            component: './Dictionary/Consultation',
            icon: 'right',
          },
          {
            path: '/dictionary/ToHospitalCate',
            name: 'ToHospitalCate',
            component: './Dictionary/ToHospitalCate',
            icon: 'right',
          },
          {
            path: '/dictionary/Where',
            name: 'Where',
            component: './Dictionary/Where',
            icon: 'right',
          },
          {
            path: '/dictionary/MainFrom',
            name: 'MainFrom',
            component: './Dictionary/MainFrom',
            icon: 'right',
          },
        ],
      },
      {
        //权限管理
        name: 'priviledgeManage',
        icon: 'user',
        path: '/priviledgeManage',
        authority: [9],
        routes: [
          {
            path: '/priviledgeManage/groupManage',
            name: 'groupManage',
            component: './Priviledges/groupManage',
            icon: 'right',
          },
          {
            path: '/priviledgeManage/adminsManage',
            name: 'adminsManage',
            component: './Priviledges/adminsManage',
            icon: 'right',
          },
        ],
      },
      {
        component: '404',
      },
    ],
  },
];
