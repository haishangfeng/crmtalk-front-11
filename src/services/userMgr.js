let userMgr = {
  userId: '0000',
  name: '获取失败',
  avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
  email: 'antdesign@alipay.com',
  signature: '海纳百川，有容乃大',
  title: '交互专家',
  group: '蚂蚁金服－某某某事业群－某某平台部－某某技术部－UED',
  tags: [
    {
      key: '0',
      label: '很有想法的',
    },
    {
      key: '1',
      label: '专注设计',
    },
    {
      key: '2',
      label: '辣~',
    },
    {
      key: '3',
      label: '大长腿',
    },
    {
      key: '4',
      label: '川妹子',
    },
    {
      key: '5',
      label: '海纳百川',
    },
  ],
  notifyCount: 12,
  unreadCount: 11,
  country: 'China',
  geographic: {
    province: {
      label: '浙江省',
      key: '330000',
    },
    city: {
      label: '杭州市',
      key: '330100',
    },
  },
  address: '西湖区工专路 77 号',
  phone: '0752-268888888',
};
export function userMgrSaveUserInfo(respone) {
  userMgr = {
    ...userMgr,
    ...respone.data.login,
  };

  localStorage.setItem('userid-crm', userMgr.userId);
  localStorage.setItem('name-crm', userMgr.name);
  localStorage.setItem('departmentId-crm', userMgr.departmentId);
  console.log(userMgr);
}

export function getUserMgr() {
  const userId = localStorage.getItem('userid-crm');
  const name = localStorage.getItem('name-crm');
  const departmentId = localStorage.getItem('departmentId-crm');
  userMgr.name = name;
  userMgr.departmentId = departmentId;
  userMgr.userId = userId;
  return userMgr;
}
