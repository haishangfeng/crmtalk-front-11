import React, { PureComponent } from 'react';
import {
  Card,
  Button,
  Form,
  Icon,
  Col,
  Row,
  DatePicker,
  Input,
  Select,
  Popover,
  Collapse,
  message,
  Cascader,
} from 'antd';
import { connect } from 'dva';
import FooterToolbar from '@/components/FooterToolbar';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import TextArea from 'antd/lib/input/TextArea';
import styles from './AdvancedFormFrontDesk.less';
import dictionariesMgr, { DictionaryItem } from '@/services/dictionariesMgr';
import { addBookingRecord, addUser, addConsultingRecord } from '@/services/apollo/apolloUser';
import { getAgencies } from '@/services/apollo/apolloTable';
import { getUserMgr } from '@/services/userMgr';

const { Option } = Select;

// 客户信息
const clientInfo = {
  name: '姓名',
  sex: '性别',
  mobile: '手机',
  wechat: '微信',
  qq: 'QQ',
  age: '年龄',
  birthYear: '出生年份',
  birthDay: '出生日期',
  where: '区域',
  bigFrom: '大来源',
  categoryFromAd: '广告来源之广告类别',
  planFromAd: '广告来源之广告计划',
  categoryFromMarket: '市场来源之市场类别',
  agencyFromMarket: '市场来源之市场机构',
};

// // 客户详情
// const clientDetail = {
//   vipLevel: '会员等级',
//   vipID: '会员卡号',
//   idCard: '身份证号',
//   mail: '邮箱',
//   secondPhoneNum: '第二联系电话',
//   introducer: '介绍人',
//   career: '职业',
//   marriage: '婚姻状况',
//   phoneModel: '手机型号',
//   carModel: '汽车型号',
//   addressDetail: '详细地址',
//   addressSpecific: '具体地址',
//   medicalHistory: '病史',
//   reMark: '备注',
// };

// // 项目和标签
// const project = {
//   mainProject: '主项目',
//   focusProject: '关注项目',
//   toBeDevelopedProject: '待开发项目',
//   haveDoneInThisHospital: '本院已做项目',
//   haveDoneInAnotherHospital: '他处已做项目',
//   tag: '客户标签',
// };

// // 咨询和预约
// const reservation = {
//   advisoryWay: '咨询方式',
//   advisoryResult: '咨询结果',
//   advisorySummary: '咨询总结',
//   advisoryDetail: '咨询详情',
//   toHospitalCate: '来院类别',
//   deliver: '分配现场咨询师',
// };

const dataSource = {
  name: '',
  sex: '',
  mobile: '',
  wechat: '',
  qq: '',
  age: '',
  birthYear: '',
  birthDay: '',
  where: '',
  bigFrom: '',
  categoryFromAd: '',
  planFromAd: '',
  categoryFromMarket: '',
  agencyFromMarket: '',
  vipLevel: '',
  vipID: '',
  idCard: '',
  email: '',
  secondPhoneNum: '',
  introducer: '',
  career: '',
  marriage: '',
  phoneModel: '',
  carModel: '',
  addressDetail: '',
  medicalHistory: '',
  reMark: '',
  mainProject: '',
  focusProject: '',
  toBeDevelopedProject: '',
  haveDoneInThisHospital: '',
  haveDoneInAnotherHospital: '',
  tag: '',
  advisoryWay: '',
  advisoryResult: '',
  advisorySummary: '',
  advisoryDetail: '',
  toHospitalCate: '',
  assistant: '',
};

@connect(({ loading }) => ({
  submitting: loading.effects['form/submitAdvancedForm'],
}))
@Form.create()
class AdvancedFormFrontDesk extends PureComponent {
  state = {
    width: '100%',
    dictionary: {
      career: [],
      phone: [],
      marriage: [],
      car: [],
      adTypes: [],
      adPlans: [],
      mainProjects: [],
      tags: [],
      consultations: [],
      consultationsResults: [],
      vips: [],
      toHospitalCate: [],
      where: [],
      bigFrom: [],
      agencyType: [],
      agencies: [],
      agenciesFiltered: [],
    },
  };

  componentDidMount = async () => {
    const { dictionary } = this.state;
    const dic = {
      career: [],
      phone: [],
      marriage: [],
      car: [],
      adTypes: [],
      adPlans: [],
      mainProjects: [],
      tags: [],
      consultations: [],
      consultationsResults: [],
      vips: [],
      toHospitalCate: [],
      where: [],
      bigFrom: [],
      agencyType: [],
      agencies: [],
      agenciesFiltered: [],
    };
    dic.career = (await dictionariesMgr.getChildrenByRoot(DictionaryItem.Job)).filter(
      ele => ele.itemAvailiable === true
    );
    dic.phone = (await dictionariesMgr.getChildrenByRoot(DictionaryItem.Phone)).filter(
      ele => ele.itemAvailiable === true
    );
    dic.marriage = (await dictionariesMgr.getChildrenByRoot(DictionaryItem.Marriage)).filter(
      ele => ele.itemAvailiable === true
    );
    dic.car = (await dictionariesMgr.getChildrenByRoot(DictionaryItem.Car)).filter(
      ele => ele.itemAvailiable === true
    );
    dic.adTypes = (await dictionariesMgr.getAds()).filter(ele => ele.itemAvailiable === true);
    const temp = (await dictionariesMgr.getMainProjects()).filter(
      ele => ele.itemAvailiable === true
    );
    temp.forEach(ele => {
      const children = dictionariesMgr
        .getChildren(ele.id, ele.itemName)
        .filter(ele2 => ele2.itemAvailiable === true);
      dic.mainProjects = dic.mainProjects.concat(children);
    });
    const tempTags = (await dictionariesMgr.getTags()).filter(ele => ele.itemAvailiable === true);
    tempTags.forEach(ele => {
      const children = dictionariesMgr
        .getChildren(ele.id, ele.itemName)
        .filter(ele2 => ele2.itemAvailiable === true);
      dic.tags = dic.tags.concat(children);
    });
    dic.consultations = (await dictionariesMgr.getConsultations()).filter(
      ele => ele.itemAvailiable === true
    );
    dic.consultationsResults = (await dictionariesMgr.getConsultationsResult()).filter(
      ele => ele.itemAvailiable === true
    );
    dic.vips = (await dictionariesMgr.getChildrenByRoot(DictionaryItem.Vips)).filter(
      ele => ele.itemAvailiable === true
    );

    dic.toHospitalCate = (await dictionariesMgr.getTohospitalCates()).filter(
      ele => ele.itemAvailiable === true
    );
    dic.where = (await dictionariesMgr.getWheres()).filter(ele => ele.itemAvailiable === true);
    dic.where = dic.where.map(ele => {
      const children = dictionariesMgr.getChildren(ele.id, '一级区域');
      return {
        value: ele.itemName,
        label: ele.itemName,
        children: children.map(ele2 => ({
          value: ele2.itemName,
          label: ele2.itemName,
        })),
      };
    });
    dic.bigFrom = (await dictionariesMgr.getMainFrom()).filter(ele => ele.itemAvailiable === true);
    dic.agencyType = await dictionariesMgr.getChildrenByRoot(DictionaryItem.AgencyType);
    dic.agencies = (await getAgencies()).data.agencies;
    this.setState({ dictionary: { ...dictionary, ...dic } });

    window.addEventListener('resize', this.resizeFooterToolbar, { passive: true });
  };

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeFooterToolbar);
  }

  getErrorInfo = () => {
    const {
      form: { getFieldsError },
    } = this.props;
    const errors = getFieldsError();
    const errorCount = Object.keys(errors).filter(key => errors[key]).length;
    if (!errors || errorCount === 0) {
      return null;
    }
    const scrollToField = fieldKey => {
      const labelNode = document.querySelector(`label[for="${fieldKey}"]`);
      if (labelNode) {
        labelNode.scrollIntoView(true);
      }
    };
    const errorList = Object.keys(errors).map(key => {
      if (!errors[key]) {
        return null;
      }
      return (
        <li key={key} className={styles.errorListItem} onClick={() => scrollToField(key)}>
          <Icon type="cross-circle-o" className={styles.errorIcon} />
          <div className={styles.errorMessage}>{errors[key][0]}</div>
          <div className={styles.errorField}>{clientInfo[key]}</div>
        </li>
      );
    });
    return (
      <span className={styles.errorIcon}>
        <Popover
          title="表单校验信息"
          content={errorList}
          overlayClassName={styles.errorPopover}
          trigger="click"
          getPopupContainer={trigger => trigger.parentNode}
        >
          <Icon type="exclamation-circle" />
        </Popover>
        {errorCount}
      </span>
    );
  };

  resizeFooterToolbar = () => {
    requestAnimationFrame(() => {
      const sider = document.querySelectorAll('.ant-layout-sider')[0];
      if (sider) {
        const width = `calc(100% - ${sider.style.width})`;
        const { width: stateWidth } = this.state;
        if (stateWidth !== width) {
          this.setState({ width });
        }
      }
    });
  };

  validate = async () => {
    const {
      form: { validateFieldsAndScroll },
    } = this.props;
    validateFieldsAndScroll(async error => {
      if (!error) {
        const payload = dataSource;

        if (payload.name === '') {
          message.error('姓名不能为空');
          return;
        }
        const mutationResult = await addUser(payload);
        if (mutationResult.error || mutationResult.errors) {
          message.error('添加用户失败');
          return;
        }
        const newPayload = {
          ...payload,
          userId: mutationResult.data.addUser.userId,
        };

        if (
          payload.advisoryWay !== '' &&
          payload.advisoryResult !== '' &&
          payload.advisorySummary !== '' &&
          payload.advisoryDetail !== ''
        ) {
          await addConsultingRecord(newPayload);
        }
        if (payload.toHospitalCate !== '' && payload.time !== '') {
          const newPayload2 = {
            ...newPayload,
            bookingStatus: 1,
            frontDesk: getUserMgr().name,
            frontDeskId: getUserMgr().userId,
            time: new Date().toString(),
          };
          console.log(newPayload2);

          await addBookingRecord(newPayload2);
        }
        message.success('客户信息提交成功');
      }
    });
  };

  render() {
    const { submitting } = this.props;
    const { width, dictionary } = this.state;

    return (
      <PageHeaderWrapper wrapperClassName={styles.advancedForm}>
        {/* 客户资料 */}
        <Collapse defaultActiveKey={['open']}>
          <Collapse.Panel header="客户资料" key="open">
            <Card className={styles.card} bordered={false}>
              <Form layout="vertical" hideRequiredMark>
                <Row gutter={16} style={{ marginBottom: 4 }}>
                  <Col span={6}>
                    <Input
                      placeholder="客户姓名"
                      onChange={e => {
                        dataSource.name = e.target.value;
                      }}
                    />
                  </Col>
                  <Col span={6}>
                    <Select
                      placeholder={formatMessage({ id: 'customerForm.form12' })}
                      onChange={(value, option) => {
                        dataSource.sex = option.key;
                      }}
                    >
                      <Option value={formatMessage({ id: 'customerForm.form1000' })} key="0">
                        {formatMessage({ id: 'customerForm.form1000' })}
                      </Option>
                      <Option value={formatMessage({ id: 'customerForm.form1001' })} key="1">
                        {formatMessage({ id: 'customerForm.form1001' })}
                      </Option>
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Input
                      type="number"
                      placeholder="年龄"
                      onChange={e => {
                        dataSource.age = e.target.value;
                      }}
                    />
                  </Col>
                  <Col span={6}>
                    <Input
                      placeholder="微信"
                      onChange={e => {
                        dataSource.wechat = e.target.value;
                      }}
                    />
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: 4 }}>
                  <Col span={6}>
                    <Input
                      type="number"
                      placeholder="QQ"
                      onChange={e => {
                        dataSource.qq = e.target.value;
                      }}
                    />
                  </Col>
                  <Col span={6}>
                    <Input
                      type="tel"
                      placeholder="手机号码"
                      onChange={e => {
                        dataSource.mobile = e.target.value;
                      }}
                    />
                  </Col>
                  <Col span={6}>
                    <Input
                      type="number"
                      placeholder="出生年份"
                      onChange={e => {
                        dataSource.birthYear = e.target.value;
                      }}
                    />
                  </Col>
                  <Col span={6}>
                    <DatePicker
                      placeholder="出生日期"
                      style={{ width: '100%' }}
                      onChange={value => {
                        dataSource.birthDay = value.format('YYYY-MM-DD');
                      }}
                    />
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: 4 }}>
                  <Col span={6}>
                    <Cascader
                      options={dictionary.where}
                      placeholder="区域"
                      onChange={value => {
                        dataSource.where = value.toString().replace(',', '');
                      }}
                    />
                  </Col>
                  <Col span={6}>
                    <Select
                      placeholder="主来源"
                      style={{ width: '100%' }}
                      onChange={async value => {
                        dataSource.bigFrom = value;
                      }}
                    >
                      {dictionary.bigFrom.map(ele => (
                        <Option key={ele.id} value={ele.itemName}>
                          {ele.itemName}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Select
                      placeholder="广告来源之广告类别"
                      style={{ width: '100%' }}
                      onChange={async (value, option) => {
                        dataSource.categoryFromAd = value;
                        dataSource.planFromAd = '';
                        dictionary.adPlans = dictionariesMgr
                          .getChildren(option.key, value)
                          .filter(ele => ele.itemAvailiable);
                        this.setState(dictionary);
                      }}
                    >
                      {dictionary.adTypes.map(ele => (
                        <Option key={ele.id} value={ele.itemName}>
                          {ele.itemName}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Select
                      placeholder="广告来源之广告计划"
                      style={{ width: '100%' }}
                      onChange={async value => {
                        dataSource.planFromAd = value;
                      }}
                    >
                      {dictionary.adPlans.map(ele => (
                        <Option key={ele.id} value={ele.itemName}>
                          {ele.itemName}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: 4 }}>
                  <Col span={6}>
                    <Select
                      placeholder="市场来源之市场类别"
                      style={{ width: '100%' }}
                      onChange={async value => {
                        dataSource.categoryFromMarket = value;
                        dataSource.agencyFromMarket = '';
                        dictionary.agenciesFiltered = dictionary.agencies.filter(
                          ele => ele.agencyType === dataSource.categoryFromMarket
                        );
                        this.setState(dictionary);
                      }}
                    >
                      {dictionary.agencyType.map(ele => (
                        <Option key={ele.id} value={ele.itemName}>
                          {ele.itemName}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Select
                      placeholder="市场来源之市场机构"
                      style={{ width: '100%' }}
                      onChange={async value => {
                        dataSource.agencyFromMarket = value;
                      }}
                    >
                      {dictionary.agenciesFiltered.map(ele => (
                        <Option key={ele.id} value={ele.agencyName}>
                          {ele.agencyName}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Collapse.Panel>
        </Collapse>
        {/* 客户详情 */}
        <Collapse defaultActiveKey={['open']} style={{ marginTop: 20 }}>
          <Collapse.Panel header="客户详情" key="open">
            <Card className={styles.card} bordered={false}>
              <Form layout="vertical" hideRequiredMark>
                <Row gutter={16} style={{ marginBottom: 4 }}>
                  <Col span={6}>
                    <Select
                      placeholder="Vip等级"
                      style={{ width: '100%' }}
                      onChange={value => {
                        dataSource.vipLevel = value;
                      }}
                    >
                      {dictionary.vips.map(ele => (
                        <Option key={ele.id} value={ele.itemName}>
                          {ele.itemName}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Input
                      placeholder="vipID"
                      onChange={e => {
                        dataSource.vipID = e.target.value;
                      }}
                    />
                  </Col>
                  <Col span={6}>
                    <Input
                      type="number"
                      placeholder="身份证号"
                      onChange={e => {
                        dataSource.idCard = e.target.value;
                      }}
                    />
                  </Col>
                  <Col span={6}>
                    <Input
                      type="email"
                      placeholder="邮箱"
                      onChange={e => {
                        dataSource.email = e.target.value;
                      }}
                    />
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: 4 }}>
                  <Col span={6}>
                    <Input
                      type="tel"
                      placeholder="第二联系电话"
                      onChange={e => {
                        dataSource.secondPhoneNum = e.target.value;
                      }}
                    />
                  </Col>
                  <Col span={6}>
                    <Input
                      placeholder="介绍人"
                      onChange={e => {
                        dataSource.introducer = e.target.value;
                      }}
                    />
                  </Col>
                  <Col span={6}>
                    <Select
                      placeholder="职业"
                      style={{ width: '100%' }}
                      onChange={value => {
                        dataSource.career = value;
                      }}
                    >
                      {dictionary.career.map(ele => (
                        <Option key={ele.id} value={ele.itemName}>
                          {ele.itemName}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Select
                      placeholder="婚姻状态"
                      style={{ width: '100%' }}
                      onChange={value => {
                        dataSource.marriage = value;
                      }}
                    >
                      {dictionary.marriage.map(ele => (
                        <Option key={ele.id} value={ele.itemName}>
                          {ele.itemName}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: 4 }}>
                  <Col span={6}>
                    <Select
                      placeholder="手机型号"
                      style={{ width: '100%' }}
                      onChange={value => {
                        dataSource.phoneModel = value;
                      }}
                    >
                      {dictionary.phone.map(ele => (
                        <Option key={ele.id} value={ele.itemName}>
                          {ele.itemName}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Select
                      placeholder="汽车型号"
                      style={{ width: '100%' }}
                      onChange={value => {
                        dataSource.carModel = value;
                      }}
                    >
                      {dictionary.car.map(ele => (
                        <Option key={ele.id} value={ele.itemName}>
                          {ele.itemName}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Input
                      placeholder="详细地址"
                      onChange={e => {
                        dataSource.addressDetail = e.target.value;
                      }}
                    />
                  </Col>
                  <Col span={6}>
                    <Input
                      placeholder="具体地址"
                      onChange={e => {
                        dataSource.addressSpecific = e.target.value;
                      }}
                    />
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: 4 }}>
                  <Col span={6}>
                    <TextArea
                      rows="2"
                      placeholder="病史"
                      onChange={e => {
                        dataSource.medicalHistory = e.target.value;
                      }}
                    />
                  </Col>
                  <Col span={6}>
                    <TextArea
                      rows="2"
                      placeholder="个人备注"
                      onChange={e => {
                        dataSource.reMark = e.target.value;
                      }}
                    />
                  </Col>
                </Row>
              </Form>
            </Card>
          </Collapse.Panel>
        </Collapse>
        {/* 项目和标签 */}
        <Collapse defaultActiveKey={['open']} style={{ marginTop: 20 }}>
          <Collapse.Panel header="项目和标签" key="open">
            <Card className={styles.card} bordered={false}>
              <Form layout="vertical" hideRequiredMark>
                <Row gutter={16} style={{ marginBottom: 4 }}>
                  <Col span={6}>
                    <Select
                      placeholder="主项目（多选）"
                      mode="multiple"
                      style={{ width: '100%' }}
                      onChange={value => {
                        dataSource.mainProject = value;
                      }}
                    >
                      {dictionary.mainProjects.map(ele => (
                        <Option key={ele.id} value={ele.itemName}>
                          {ele.itemName}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Select
                      placeholder="关注项目（多选）"
                      mode="multiple"
                      style={{ width: '100%' }}
                      onChange={value => {
                        dataSource.focusProject = value;
                      }}
                    >
                      {dictionary.mainProjects.map(ele => (
                        <Option key={ele.id} value={ele.itemName}>
                          {ele.itemName}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Select
                      placeholder="待开发项目（多选）"
                      mode="multiple"
                      style={{ width: '100%' }}
                      onChange={value => {
                        dataSource.toBeDevelopedProject = value;
                      }}
                    >
                      {dictionary.mainProjects.map(ele => (
                        <Option key={ele.id} value={ele.itemName}>
                          {ele.itemName}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Select
                      placeholder="本院已做项目（多选）"
                      mode="multiple"
                      style={{ width: '100%' }}
                      onChange={value => {
                        dataSource.haveDoneInThisHospital = value;
                      }}
                    >
                      {dictionary.mainProjects.map(ele => (
                        <Option key={ele.id} value={ele.itemName}>
                          {ele.itemName}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: 4 }}>
                  <Col span={6}>
                    <Select
                      placeholder="他院已做项目（多选）"
                      mode="multiple"
                      style={{ width: '100%' }}
                      onChange={value => {
                        dataSource.haveDoneInAnotherHospital = value;
                      }}
                    >
                      {dictionary.mainProjects.map(ele => (
                        <Option key={ele.id} value={ele.itemName}>
                          {ele.itemName}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Select
                      placeholder="客户标签（多选）"
                      mode="multiple"
                      style={{ width: '100%' }}
                      onChange={value => {
                        dataSource.tag = value;
                      }}
                    >
                      {dictionary.tags.map(ele => (
                        <Option key={ele.id} value={ele.itemName}>
                          {ele.itemName}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Collapse.Panel>
        </Collapse>
        {/* 预约和咨询 */}
        <Collapse defaultActiveKey={['open']} style={{ marginTop: 20 }}>
          <Collapse.Panel header="咨询和预约" key="open">
            <Card className={styles.card} bordered={false}>
              <Form layout="vertical" hideRequiredMark>
                <Row gutter={16} style={{ marginBottom: 4 }}>
                  <Col span={6}>
                    <Select
                      placeholder="咨询方式"
                      style={{ width: '100%' }}
                      onChange={value => {
                        dataSource.advisoryWay = value;
                      }}
                    >
                      {dictionary.consultations.map(ele => (
                        <Option key={ele.id} value={ele.itemName}>
                          {ele.itemName}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Select
                      placeholder="咨询结果"
                      style={{ width: '100%' }}
                      onChange={value => {
                        dataSource.advisoryResult = value;
                      }}
                    >
                      {dictionary.consultationsResults.map(ele => (
                        <Option key={ele.id} value={ele.itemName}>
                          {ele.itemName}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={6}>
                    <TextArea
                      placeholder="咨询小结"
                      rows="1"
                      onChange={e => {
                        dataSource.advisoryDetail = e.target.value;
                      }}
                    />
                  </Col>
                  <Col span={6}>
                    <TextArea
                      placeholder="咨询详情"
                      rows="1"
                      onChange={e => {
                        dataSource.advisorySummary = e.target.value;
                      }}
                    />
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: 4 }}>
                  <Col span={6}>
                    <Select
                      placeholder="来院类别"
                      style={{ width: '100%' }}
                      onChange={value => {
                        dataSource.toHospitalCate = value;
                      }}
                    >
                      {dictionary.toHospitalCate.map(ele => (
                        <Option key={ele.id} value={ele.itemName}>
                          {ele.itemName}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Select
                      placeholder="现场咨询师"
                      style={{ width: '100%' }}
                      onChange={value => {
                        dataSource.assistant = value;
                      }}
                    >
                      <Option key="0" value="jack">
                        Jack
                      </Option>
                      <Option key="1" value="lucy">
                        Lucy
                      </Option>
                      <Option key="2" value="Yiminghe">
                        yiminghe
                      </Option>
                    </Select>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Collapse.Panel>
        </Collapse>
        <FooterToolbar style={{ width }}>
          {this.getErrorInfo()}
          <Button type="primary" onClick={this.validate} loading={submitting}>
            提交
          </Button>
        </FooterToolbar>
      </PageHeaderWrapper>
    );
  }
}

export default AdvancedFormFrontDesk;
