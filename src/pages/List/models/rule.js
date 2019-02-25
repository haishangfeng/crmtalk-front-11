import { queryRule, removeRule, addRule, updateRule } from '@/services/api';
import {
  getConsultingRecordsTable,
  getAdConsumptions,
  getAds,
} from '@/services/apollo/apolloTable';

export default {
  namespace: 'rule',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    // getAd
    *getAd({ payload }, { call }) {
      const response = yield call(getAds, payload);
      return response.data.ads;
    },
    *init({ call }) {
      const response = yield call(getConsultingRecordsTable);
      return response.data.consultations;
    },
    // initAdConsumptionList
    *adconlist({ payload }, { call }) {
      const response = yield call(getAdConsumptions, payload);
      return response.data.adConsumptions;
    },
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryRule, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(addRule, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(removeRule, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *update({ payload, callback }, { call, put }) {
      const response = yield call(updateRule, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
