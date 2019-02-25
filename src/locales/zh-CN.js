import analysis from './zh-CN/analysis';
import exception from './zh-CN/exception';
import form from './zh-CN/form';
import globalHeader from './zh-CN/globalHeader';
import login from './zh-CN/login';
import menu from './zh-CN/menu';
import monitor from './zh-CN/monitor';
import result from './zh-CN/result';
import settingDrawer from './zh-CN/settingDrawer';
import settings from './zh-CN/settings';
import pwa from './zh-CN/pwa';
import types from './zh-CN/types';
import customerForm from './zh-CN/Consultation/customerForm';
import zixungongzuoliang from './zh-CN/Consultation/zixungongzuoliang';
import jiezhen from './zh-CN/Assistant/jiezhen';
import kaidan from './zh-CN/Assistant/kaidan';
import xiaofeidanliebiao from './zh-CN/Assistant/xiaofeidanliebiao';
import yiwancheng from './zh-CN/Assistant/yiwancheng';
import reserveCharging from './zh-CN/Charging/reserveCharging';
import shoushuliebiao from './zh-CN/Doctor/shoushuliebiao';
import liaocheng from './zh-CN/Doctor/liaocheng';
import consultationList from './zh-CN/Ad/consulationList';
import reserveList from './zh-CN/Ad/reserveList';
import adComsuptionList from './zh-CN/Ad/adComsuption';
import agency from './zh-CN/Market/Agency';
import conReserveList from './zh-CN/Consultation/Con_reserveList';
import conConsulate from './zh-CN/Consultation/Con_consulationList';
import customerList from './zh-CN/Consultation/customerList';
import yikaidanzixun from './zh-CN/Consultation/yikaidanzixun';
import reserve from './zh-CN/FD/reserve';
import dictionary from './zh-CN/Dictionary/dictionary';
import { quanxianzuzidian } from './zh-CN/Priviledge/groupManage';
import admin from './zh-CN/Priviledge/admin';

export default {
  'header.hello': '你好',
  'header.Home': '首页',
  'navBar.lang': '语言',
  'layout.user.link.help': '帮助',
  'layout.user.link.privacy': '隐私',
  'layout.user.link.terms': '条款',
  'app.home.introduce': '介绍',
  'app.forms.basic.title': '基础表单',
  'app.forms.basic.description':
    '表单页用于向用户收集或验证信息，基础表单常见于数据项较少的表单场景。',
  ...analysis,
  ...exception,
  ...form,
  ...globalHeader,
  ...login,
  ...menu,
  ...monitor,
  ...result,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...types,
  // 咨询
  ...customerForm,
  ...conReserveList,
  ...conConsulate,
  ...customerList,
  ...yikaidanzixun,
  // 现场咨询师
  ...jiezhen,
  ...kaidan,
  ...xiaofeidanliebiao,
  ...yiwancheng,
  // 收费
  ...reserveCharging,
  // 医生
  ...shoushuliebiao,
  ...liaocheng,
  ...zixungongzuoliang,
  // 广告
  ...adComsuptionList,
  ...consultationList,
  ...reserveList,
  // 市场
  ...agency,
  ...reserve,
  ...dictionary,
  ...quanxianzuzidian,
  ...admin,
};
