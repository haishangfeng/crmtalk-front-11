import analysis from './vi-VN/analysis';
import exception from './vi-VN/exception';
import form from './vi-VN/form';
import globalHeader from './vi-VN/globalHeader';
import login from './vi-VN/login';
import menu from './vi-VN/menu';
import monitor from './vi-VN/monitor';
import result from './vi-VN/result';
import settingDrawer from './vi-VN/settingDrawer';
import settings from './vi-VN/settings';
import pwa from './vi-VN/pwa';
import types from './vi-VN/types';
import customerForm from './vi-VN/Consultation/customerForm';
import zixungongzuoliang from './vi-VN/Consultation/zixungongzuoliang';
import jiezhen from './vi-VN/Assistant/jiezhen';
import kaidan from './vi-VN/Assistant/kaidan';
import xiaofeidanliebiao from './vi-VN/Assistant/xiaofeidanliebiao';
import yiwancheng from './vi-VN/Assistant/yiwancheng';
import reserveCharging from './vi-VN/Charging/reserveCharging';
import shoushuliebiao from './vi-VN/Doctor/shoushuliebiao';
import liaocheng from './vi-VN/Doctor/liaocheng';
import consultationList from './vi-VN/Ad/consulationList';
import reserveList from './vi-VN/Ad/reserveList';
import adComsuptionList from './vi-VN/Ad/adComsuption';
import Agency from './vi-VN/Market/Agency';
import conReserve from './vi-VN/Consultation/Con_reserveList';
import conConsulate from './vi-VN/Consultation/Con_consulationList';
import customerList from './vi-VN/Consultation/customerList';
import reserve from './vi-VN/FD/reserve';
import dictionary from './vi-VN/Dictionary/dictionary';
import quanxianzuzidian from './vi-VN/Priviledge/groupManage';

import admin from './vi-VN/Priviledge/admin';
import yikaidanzixun from './vi-VN/Consultation/yikaidanzixun';

export default {
  'header.hello': 'Xin chào',
  'header.Home': 'Trang chủ',
  'navBar.lang': 'Idiomas',
  'layout.user.link.help': 'ajuda',
  'layout.user.link.privacy': 'política de privacidade',
  'layout.user.link.terms': 'termos de serviços',
  'app.home.introduce': 'introduzir',
  'app.forms.basic.title': 'Basic form',
  'app.forms.basic.description':
    'Form pages are used to collect or verify information to users, and basic forms are common in scenarios where there are fewer data items.',
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
  ...conReserve,
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
  // 广告部
  ...consultationList,
  ...reserveList,
  ...adComsuptionList,
  // 市场
  ...Agency,
  ...reserve,
  ...dictionary,

  ...quanxianzuzidian,
  ...admin,
};
