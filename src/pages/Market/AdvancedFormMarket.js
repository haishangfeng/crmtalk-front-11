/* eslint-disable react/no-unused-state */
import React, { PureComponent } from 'react';
import {
  Card,
  Button,
  Form,
  Col,
  Row,
  DatePicker,
  Input,
  Select,
  Collapse,
  Cascader,
  message,
} from 'antd';
import FooterToolbar from '@/components/FooterToolbar';
import TextArea from 'antd/lib/input/TextArea';
import styles from './style.less';
import { formatMessage } from 'umi/locale';
import dictionariesMgr, { DictionaryItem } from '@/services/dictionariesMgr';
import { getAgencies } from '@/services/apollo/apolloTable';
import { pushAdvancedForm } from '@/services/apollo/apolloUser';
import formatTimeTommy from '@/util';

const { Option } = Select;

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
  education: '',
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
  time: '',
};

class AdvancedForm extends PureComponent {
  state = {
    width: '100%',
    dictionary: {
      education: [],
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
      ele => ele.itemAvailiable
    );
    dic.phone = (await dictionariesMgr.getChildrenByRoot(DictionaryItem.Phone)).filter(
      ele => ele.itemAvailiable
    );
    dic.marriage = (await dictionariesMgr.getChildrenByRoot(DictionaryItem.Marriage)).filter(
      ele => ele.itemAvailiable
    );
    dic.car = (await dictionariesMgr.getChildrenByRoot(DictionaryItem.Car)).filter(
      ele => ele.itemAvailiable
    );
    dic.adTypes = (await dictionariesMgr.getAds()).filter(ele => ele.itemAvailiable);
    dic.education = (await dictionariesMgr.getChildrenByRoot(DictionaryItem.Education)).filter(
      ele => ele.itemAvailiable
    );
    const temp = (await dictionariesMgr.getMainProjects()).filter(ele => ele.itemAvailiable);
    temp.forEach(ele => {
      const children = dictionariesMgr
        .getChildren(ele.id, ele.itemName)
        .filter(ele2 => ele2.itemAvailiable);
      dic.mainProjects = dic.mainProjects.concat(children);
    });
    const tempTags = (await dictionariesMgr.getTags()).filter(ele => ele.itemAvailiable);
    tempTags.forEach(ele => {
      const children = dictionariesMgr
        .getChildren(ele.id, ele.itemName)
        .filter(ele2 => ele2.itemAvailiable);
      dic.tags = dic.tags.concat(children);
    });
    dic.consultations = (await dictionariesMgr.getConsultations()).filter(
      ele => ele.itemAvailiable
    );
    dic.consultationsResults = (await dictionariesMgr.getConsultationsResult()).filter(
      ele => ele.itemAvailiable
    );
    dic.vips = (await dictionariesMgr.getChildrenByRoot(DictionaryItem.Vips)).filter(
      ele => ele.itemAvailiable
    );

    dic.toHospitalCate = (await dictionariesMgr.getTohospitalCates()).filter(
      ele => ele.itemAvailiable
    );
    dic.where = (await dictionariesMgr.getWheres()).filter(ele => ele.itemAvailiable);
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

    dic.bigFrom = (await dictionariesMgr.getMainFrom()).filter(ele => ele.itemAvailiable);
    dic.agencyType = await dictionariesMgr.getChildrenByRoot(DictionaryItem.AgencyType);
    dic.agencies = (await getAgencies()).data.agencies;
    this.setState({ dictionary: { ...dictionary, ...dic } });

    window.addEventListener('resize', this.resizeFooterToolbar, { passive: true });
  };

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeFooterToolbar);
  }

  validate = async () => {
    if (dataSource.sex === '' || dataSource.name === '') {
      message.error('姓名、性别不能为空');
      return;
    }
    if (dataSource.mobile || dataSource.qq || dataSource.wechat) {
      //
    } else {
      message.error('手机微信QQ三者其一不能为空');
      return;
    }
    if (dataSource.age || dataSource.birthYear) {
      //
    } else {
      message.error('年龄不能为空');
      return;
    }
    if (dataSource.bigFrom === '') {
      message.error('主来源不能为空');
      return;
    }
    console.log(dataSource);

    const newData = {};
    newData.user = {
      name: dataSource.name,
      sex: dataSource.sex,
      mobile: dataSource.mobile,
      wechat: dataSource.wechat,
      qq: dataSource.qq,
      age: dataSource.age.toString(),
      birthYear: dataSource.birthYear.toString(),
      birthDay: dataSource.birthDay,
      where: dataSource.where,
      bigFrom: dataSource.bigFrom,
      categoryFromAd: dataSource.categoryFromAd,
      planFromAd: dataSource.planFromAd,
      categoryFromMarket: dataSource.categoryFromMarket,
      agencyFromMarket: dataSource.agencyFromMarket,
      vipLevel: dataSource.vipLevel,
      vipID: dataSource.vipID,
      idCard: dataSource.idCard,
      email: dataSource.email,
      secondPhoneNum: dataSource.secondPhoneNum,
      introducer: dataSource.introducer,
      education: dataSource.education,
      career: dataSource.career,
      marriage: dataSource.marriage,
      phoneModel: dataSource.phoneModel,
      carModel: dataSource.carModel,
      addressDetail: dataSource.addressDetail,
      medicalHistory: dataSource.medicalHistory,
      reMark: dataSource.reMark,
      mainProject: dataSource.mainProject.toString(),
      tag: dataSource.tag.toString(),
      focusProject: dataSource.focusProject.toString(),
      toBeDevelopedProject: dataSource.toBeDevelopedProject.toString(),
      haveDoneInThisHospital: dataSource.haveDoneInThisHospital.toString(),
      haveDoneInAnotherHospital: dataSource.haveDoneInAnotherHospital.toString(),
    };
    if (
      dataSource.advisoryWay &&
      dataSource.advisoryResult &&
      dataSource.advisorySummary &&
      dataSource.advisoryDetail
    ) {
      newData.consultationRecord = {
        advisoryWay: dataSource.advisoryWay,
        advisoryResult: dataSource.advisoryResult,
        advisorySummary: dataSource.advisorySummary,
        advisoryDetail: dataSource.advisoryDetail,
      };
      if (dataSource.toHospitalCate && dataSource.time) {
        newData.bookingRecord = {
          bookingStatus: 0,
          toHospitalCate: dataSource.toHospitalCate,
          time: dataSource.time,
        };
      }
    }
    const resp = await pushAdvancedForm(newData);
    if (resp.error || resp.errors) {
      message.error('添加失败');
      return;
    }
    message.success('用户添加成功');
    if (newData.consultationRecord) message.success('咨询记录添加成功');
    else message.warn('未添加咨询记录');
    if (newData.bookingRecord) message.success('预约记录添加成功');
    else message.warn('未添加预约记录');
  };

  render() {
    const { submitting } = this.props;
    const { width, dictionary } = this.state;

    return (
      <Card>
        <Collapse defaultActiveKey={['open']}>
          <Collapse.Panel header={formatMessage({ id: 'customerForm.form1' })} key="open">
            <Card className={styles.card} bordered={false}>
              <Form layout="vertical" hideRequiredMark>
                <Row gutter={16} style={{ marginBottom: 4 }}>
                  <Col span={5}>
                    <Input
                      placeholder={formatMessage({ id: 'customerForm.form11' })}
                      onChange={e => {
                        dataSource.name = e.target.value;
                      }}
                    />
                  </Col>
                  <Col span={4}>
                    <Select
                      allowClear
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
                  <Col span={5}>
                    <Input
                      type="tel"
                      placeholder={formatMessage({ id: 'customerForm.form16' })}
                      onChange={e => {
                        dataSource.mobile = e.target.value;
                      }}
                    />
                  </Col>
                  <Col span={5}>
                    <Input
                      placeholder={formatMessage({ id: 'customerForm.form14' })}
                      onChange={e => {
                        dataSource.wechat = e.target.value;
                      }}
                    />
                  </Col>
                  <Col span={5}>
                    <Input
                      type="number"
                      placeholder={formatMessage({ id: 'customerForm.form15' })}
                      onChange={e => {
                        dataSource.qq = e.target.value;
                      }}
                    />
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: 4 }}>
                  <Col span={5}>
                    <Input
                      type="number"
                      placeholder={formatMessage({ id: 'customerForm.form13' })}
                      value={dataSource.age}
                      onChange={e => {
                        dataSource.age = e.target.value;
                        dataSource.birthYear =
                          new Date().getFullYear() - parseInt(e.target.value, 10);
                        this.setState({ dataSource: { ...dataSource } });
                      }}
                    />
                  </Col>
                  <Col span={4}>
                    <Input
                      type="number"
                      placeholder={formatMessage({ id: 'customerForm.form17' })}
                      value={dataSource.birthYear}
                      onChange={e => {
                        if (e.target.value) {
                          dataSource.birthYear = e.target.value;
                          dataSource.age = new Date().getFullYear() - parseInt(e.target.value, 10);
                        } else {
                          dataSource.age = null;
                          dataSource.birthYear = null;
                        }
                        this.setState({ dataSource: { ...dataSource } });
                      }}
                    />
                  </Col>
                  <Col span={5}>
                    <DatePicker
                      placeholder={formatMessage({ id: 'customerForm.form18' })}
                      style={{ width: '100%' }}
                      onChange={value => {
                        if (value) {
                          const date = value.format('YYYY-MM-DD');
                          dataSource.birthDay = date;
                          dataSource.age =
                            new Date().getFullYear() - parseInt(date.slice(0, 5), 10);
                          dataSource.birthYear = new Date().getFullYear() - dataSource.age;
                        } else {
                          dataSource.age = null;
                          dataSource.birthYear = null;
                          dataSource.birthDay = null;
                        }
                        this.setState({ dataSource: { ...dataSource } });
                      }}
                    />
                  </Col>
                  <Col span={5}>
                    <Cascader
                      options={dictionary.where}
                      placeholder={formatMessage({ id: 'customerForm.form19' })}
                      onChange={value => {
                        dataSource.where = value.toString();
                      }}
                    />
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: 4 }}>
                  <Col span={5}>
                    <Select
                      allowClear
                      placeholder={formatMessage({ id: 'customerForm.form110' })}
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
                  <Col span={4}>
                    <Select
                      allowClear
                      placeholder={formatMessage({ id: 'customerForm.form111' })}
                      style={{ width: '100%' }}
                      onChange={async (value, option) => {
                        dataSource.categoryFromAd = value;
                        dataSource.planFromAd = '';
                        if (option) {
                          dictionary.adPlans = dictionariesMgr
                            .getChildren(option.key, value)
                            .filter(ele => ele.itemAvailiable);
                        } else {
                          dictionary.adPlans = [];
                        }
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
                  <Col span={5}>
                    <Select
                      allowClear
                      placeholder={formatMessage({ id: 'customerForm.form112' })}
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
                  <Col span={5}>
                    <Select
                      allowClear
                      placeholder={formatMessage({ id: 'customerForm.form113' })}
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
                  <Col span={5}>
                    <Select
                      allowClear
                      placeholder={formatMessage({ id: 'customerForm.form114' })}
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
          <Collapse.Panel header={formatMessage({ id: 'customerForm.form2' })} key="close">
            <Card className={styles.card} bordered={false}>
              <Form layout="vertical" hideRequiredMark>
                <Row gutter={16} style={{ marginBottom: 4 }}>
                  <Col span={5}>
                    <Select
                      allowClear
                      placeholder={formatMessage({ id: 'customerForm.form21' })}
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
                  <Col span={4}>
                    <Input
                      placeholder={formatMessage({ id: 'customerForm.form22' })}
                      onChange={e => {
                        dataSource.vipID = e.target.value;
                      }}
                    />
                  </Col>
                  <Col span={5}>
                    <Input
                      type="number"
                      placeholder={formatMessage({ id: 'customerForm.form23' })}
                      onChange={e => {
                        dataSource.idCard = e.target.value;
                      }}
                    />
                  </Col>
                  <Col span={5}>
                    <Input
                      type="email"
                      placeholder={formatMessage({ id: 'customerForm.form24' })}
                      onChange={e => {
                        dataSource.email = e.target.value;
                      }}
                    />
                  </Col>
                  <Col span={5}>
                    <Input
                      type="tel"
                      placeholder={formatMessage({ id: 'customerForm.form25' })}
                      onChange={e => {
                        dataSource.secondPhoneNum = e.target.value;
                      }}
                    />
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: 4 }}>
                  <Col span={5}>
                    <Select
                      allowClear
                      placeholder={formatMessage({ id: 'customerForm.form26.5' })}
                      style={{ width: '100%' }}
                      onChange={value => {
                        dataSource.education = value;
                      }}
                    >
                      {dictionary.education.map(ele => (
                        <Option key={ele.id} value={ele.itemName}>
                          {ele.itemName}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={4}>
                    <Select
                      allowClear
                      placeholder={formatMessage({ id: 'customerForm.form27' })}
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
                  <Col span={5}>
                    <Select
                      allowClear
                      placeholder={formatMessage({ id: 'customerForm.form28' })}
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
                  <Col span={5}>
                    <Select
                      allowClear
                      placeholder={formatMessage({ id: 'customerForm.form29' })}
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
                  <Col span={5}>
                    <Select
                      allowClear
                      placeholder={formatMessage({ id: 'customerForm.form210' })}
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
                </Row>
                <Row gutter={16} style={{ marginBottom: 4 }}>
                  <Col span={5}>
                    <Input
                      placeholder={formatMessage({ id: 'customerForm.form26' })}
                      onChange={e => {
                        dataSource.introducer = e.target.value;
                      }}
                    />
                  </Col>
                  <Col span={19}>
                    <Input
                      placeholder={formatMessage({ id: 'customerForm.form213' })}
                      onChange={e => {
                        dataSource.addressDetail = e.target.value;
                      }}
                    />
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <TextArea
                      rows="2"
                      placeholder={formatMessage({ id: 'customerForm.form214' })}
                      onChange={e => {
                        dataSource.medicalHistory = e.target.value;
                      }}
                    />
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <TextArea
                      rows="2"
                      placeholder={formatMessage({ id: 'customerForm.form215' })}
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
          <Collapse.Panel header={formatMessage({ id: 'customerForm.form3' })} key="open">
            <Card className={styles.card} bordered={false}>
              <Form layout="vertical" hideRequiredMark>
                <Row gutter={16} style={{ marginBottom: 4 }}>
                  <Col span={6}>
                    {formatMessage({ id: 'customerForm.form31' })}
                    <Select
                      allowClear
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
                    {formatMessage({ id: 'customerForm.form32' })}
                    <Select
                      allowClear
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
                    {formatMessage({ id: 'customerForm.form33' })}
                    <Select
                      allowClear
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
                    {formatMessage({ id: 'customerForm.form34' })}
                    <Select
                      allowClear
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
                    {formatMessage({ id: 'customerForm.form35' })}
                    <Select
                      allowClear
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
                    {formatMessage({ id: 'customerForm.form36' })}
                    <Select
                      allowClear
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
          <Collapse.Panel header={formatMessage({ id: 'customerForm.form4' })} key="open">
            <Card className={styles.card} bordered={false}>
              <Form layout="vertical" hideRequiredMark>
                <Row gutter={16} style={{ marginBottom: 4 }}>
                  <Col span={6}>
                    <Select
                      allowClear
                      placeholder={formatMessage({ id: 'customerForm.form41' })}
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
                      allowClear
                      placeholder={formatMessage({ id: 'customerForm.form42' })}
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
                  <Col span={12}>
                    <Input
                      placeholder={formatMessage({ id: 'customerForm.form43' })}
                      rows="1"
                      onChange={e => {
                        dataSource.advisoryDetail = e.target.value;
                      }}
                    />
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: 10 }}>
                  <Col span={24}>
                    <TextArea
                      placeholder={formatMessage({ id: 'customerForm.form44' })}
                      rows="2"
                      onChange={e => {
                        dataSource.advisorySummary = e.target.value;
                      }}
                    />
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: 4 }}>
                  <Col span={6}>
                    <Select
                      allowClear
                      placeholder={formatMessage({ id: 'customerForm.form45' })}
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
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder={formatMessage({ id: 'customerForm.form46' })}
                      onChange={value => {
                        if (value) dataSource.time = formatTimeTommy(value);
                        else dataSource.time = null;
                      }}
                    />
                  </Col>
                </Row>
              </Form>
            </Card>
          </Collapse.Panel>
        </Collapse>
        <FooterToolbar style={{ width }}>
          <Button type="primary" onClick={this.validate} loading={submitting}>
            提交
          </Button>
        </FooterToolbar>
      </Card>
    );
  }
}

export default AdvancedForm;
