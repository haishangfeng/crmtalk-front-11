import { routerRedux } from 'dva/router';
import { stringify } from 'qs';
import { getFakeCaptcha } from '@/services/api';
import { setAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import { reloadAuthorized } from '@/utils/Authorized';
import { apolloLogin } from '@/services/apollo/apolloAdmin';
import { userMgrSaveUserInfo } from '@/services/userMgr';

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *autoLogin({ payload }, { call, put }) {
      const token = localStorage.getItem('crm-token');
      if (token) {
        const response = yield call(apolloLogin, payload);
        if (response.errors || response.error) return;

        yield put({
          type: 'changeLoginStatus',
          payload: response,
        });

        // Login successfully
        if (response.data.autoLogin.token) {
          if (payload.autoLogin) localStorage.setItem('crm-token', response.data.login.token);

          reloadAuthorized();
          const urlParams = new URL(window.location.href);
          const params = getPageQuery();

          let { redirect } = params;
          if (redirect) {
            const redirectUrlParams = new URL(redirect);
            if (redirectUrlParams.origin === urlParams.origin) {
              redirect = redirect.substr(urlParams.origin.length);
              if (redirect.match(/^\/.*#/)) {
                redirect = redirect.substr(redirect.indexOf('#') + 1);
              }
            } else {
              window.location.href = redirect;
              return;
            }
          }
          yield put(routerRedux.replace(redirect || '/'));
        }
      }
    },
    *login({ payload }, { call, put }) {
      let response = yield call(apolloLogin, payload);
      // const response = yield call(apolloLogin, payload);

      if (response.errors || response.error) return;

      response = {
        ...response,
        currentAuthority: response.data.login.routePages,
      };
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });

      // Login successfully
      if (response.data.login.token) {
        userMgrSaveUserInfo(response);

        if (payload.autoLogin) localStorage.setItem('crm-token', response.data.login.token);

        reloadAuthorized();
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();

        let { redirect } = params;
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = redirect;
            return;
          }
        }
        yield put(routerRedux.replace(redirect || '/'));
      }
    },

    *getCaptcha({ payload }, { call }) {
      yield call(getFakeCaptcha, payload);
    },

    *logout(_, { put }) {
      localStorage.removeItem('crm-token');
      yield put({
        type: 'changeLoginStatus',
        payload: {
          status: false,
          currentAuthority: [],
        },
      });
      reloadAuthorized();
      yield put(
        routerRedux.push({
          pathname: '/user/login',
          search: stringify({
            redirect: window.location.href,
          }),
        })
      );
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority(payload.currentAuthority);

      return {
        ...state,
        status: payload.currentAuthority,
        type: 'account',
      };
    },
  },
};
