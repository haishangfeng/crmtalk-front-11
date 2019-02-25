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
  InputNumber,
  Switch,
  message,
} from 'antd';
import { connect } from 'dva';
import FooterToolbar from '@/components/FooterToolbar';
import TextArea from 'antd/lib/input/TextArea';
import styles from './AgencyForm.less';
import { addAgency } from '@/services/apollo/apolloTable';
import dictionariesMgr, { DictionaryItem } from '@/services/dictionariesMgr';
import { getUserMgr } from '@/services/userMgr';
import formatTimeTommy from '@/util';

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
  bigFrom: '主来源',
  categoryFromAd: '广告来源之广告类别',
  planFromAd: '广告来源之广告计划',
  categoryFromMarket: '市场来源之市场类别',
  agencyFromMarket: '市场来源之市场机构',
};

const dataSource = {
  agencyName: '',
  agencyType: '',
  detail: '',
  headTel: '',
  coStatus: '',
  dealTime: '',
  marketor: '',
  availiable: false,
  agencyHead: '',
  contactTel: '',
  introducer: '',
  commission: 20,
  agencyLevel: '',
  whereLevel1: '',
  whereLevel2: '',
  whereDetail: '',
  agencyContact: '',
};

@connect(({ loading }) => ({
  submitting: loading.effects['form/submitAdvancedForm'],
}))
@Form.create()
class AgencyForm extends PureComponent {
  state = {
    width: '100%',
    dictionary: {
      agencyType: [],
      agencyLevel: [],
      coStatus: [],
      whereLevel1: [],
      whereLevel2: [],
    },
  };

  componentDidMount = async () => {
    const { dictionary } = this.state;
    const dic = {
      agencyType: [],
      agencyLevel: [],
      coStatus: [],
      whereLevel1: [],
    };
    dic.agencyType = await dictionariesMgr.getChildrenByRoot(DictionaryItem.AgencyType);
    dic.agencyLevel = await dictionariesMgr.getChildrenByRoot(DictionaryItem.AgencyLevel);
    dic.coStatus = await dictionariesMgr.getChildrenByRoot(DictionaryItem.AgencyCoStatus);
    dic.whereLevel1 = await dictionariesMgr.getWheres();
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
        dataSource.marketor = getUserMgr().name;
        dataSource.availiable = true;
        const resp = await addAgency(dataSource);
        if (resp.error || resp.errors) message.error('添加失败');
        message.success('合作机构添加成功');
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      submitting,
    } = this.props;
    const { width, dictionary } = this.state;

    return (
      <Card className={styles.card} bordered={false}>
        <Form layout="inline" hideRequiredMark>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <Input
                placeholder="机构名称"
                onChange={e => {
                  dataSource.agencyName = e.target.value;
                }}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <Select
                placeholder="机构类别"
                onChange={value => {
                  dataSource.agencyType = value;
                }}
              >
                {dictionary.agencyType.map(ele => (
                  <Option key={ele.id} value={ele.itemName}>
                    {ele.itemName}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
              <Select
                placeholder="机构级别"
                onChange={value => {
                  dataSource.agencyLevel = value;
                }}
              >
                {dictionary.agencyLevel.map(ele => (
                  <Option key={ele.id} value={ele.itemName}>
                    {ele.itemName}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <Select
                placeholder="合作状态"
                onChange={value => {
                  dataSource.coStatus = value;
                }}
              >
                {dictionary.coStatus.map(ele => (
                  <Option key={ele.id} value={ele.itemName}>
                    {ele.itemName}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
              <Input
                placeholder="机构负责人"
                onChange={e => {
                  dataSource.agencyHead = e.target.value;
                }}
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <Input
                type="number"
                placeholder="负责人电话"
                onChange={e => {
                  dataSource.headTel = e.target.value;
                }}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
              {getFieldDecorator('bigFrom', {
                rules: [{ required: true, message: '必填' }],
              })(
                <Input
                  placeholder="机构联系人"
                  onChange={e => {
                    dataSource.agencyContact = e.target.value;
                  }}
                />
              )}
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
              <Input
                type="number"
                placeholder="联系人电话"
                onChange={e => {
                  dataSource.contactTel = e.target.value;
                }}
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <Input
                placeholder="介绍人"
                onChange={e => {
                  dataSource.introducer = e.target.value;
                }}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <Select
                placeholder="一级区域"
                style={{ width: '100%' }}
                onChange={(value, option) => {
                  dataSource.whereLevel1 = value;
                  dataSource.whereLevel2 = '';
                  dictionary.whereLevel2 = dictionariesMgr.getChildren(option.key, '一级区域');
                  this.setState(dictionary);
                }}
              >
                {dictionary.whereLevel1.map(ele => (
                  <Option key={ele.id} value={ele.itemName}>
                    {ele.itemName}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
              <Select
                placeholder="二级区域"
                style={{ width: '100%' }}
                onChange={value => {
                  dataSource.whereLevel2 = value;
                }}
              >
                {dictionary.whereLevel2.map(ele => (
                  <Option key={ele.id} value={ele.itemName}>
                    {ele.itemName}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <Input
                placeholder="详细地址"
                onChange={e => {
                  dataSource.whereDetail = e.target.value;
                }}
              />
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <Form.Item label="佣金比例">
                <InputNumber
                  defaultValue={20}
                  min={0}
                  max={100}
                  formatter={value => `${value}%`}
                  parser={value => value.replace('%', '')}
                  placeholder="佣金比例"
                  onChange={value => {
                    dataSource.commission = value;
                  }}
                />
              </Form.Item>
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="签约时间"
                onChange={value => {
                  if (value) dataSource.dealTime = formatTimeTommy(value);
                  else dataSource.dealTime = '';
                }}
              />
            </Col>
          </Row>
          <Row>
            <TextArea
              rows="1"
              style={{ width: 700 }}
              placeholder="合作介绍"
              onChange={e => {
                dataSource.detail = e.target.value;
              }}
            />
          </Row>
        </Form>
        <FooterToolbar style={{ width }}>
          {this.getErrorInfo()}
          <Button type="primary" onClick={this.validate} loading={submitting}>
            提交
          </Button>
        </FooterToolbar>
      </Card>
    );
  }
}

export default AgencyForm;
