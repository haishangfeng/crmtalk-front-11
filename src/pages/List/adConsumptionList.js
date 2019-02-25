import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Card,
  Form,
  Button,
  Popconfirm,
  Row,
  Input,
  Select,
  Icon,
  Skeleton,
  Modal,
  Tooltip,
  Collapse,
  message,
  DatePicker,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './adConsumptionList.less';
import {
  deleteAdConsumptionItem,
  addAdConsumptionItem,
  updateAdConsumptionItem,
} from '@/services/apollo/apolloTable';
import dictionariesMgr from '@/services/dictionariesMgr';
import { getUserMgr } from '@/services/userMgr';

const { Option } = Select;

const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

/* eslint react/no-multi-comp:0 */
@connect(({ rule, loading }) => ({
  rule,
  loading: loading.models.rule,
}))
// table list
@Form.create()
class adConsumptionList extends PureComponent {
  state = {
    isEditing: false,
    isLoading: false,
    drawerTitle: '',
    drawerVisiable: false,
    selectedRows: [],
    formValues: {},
    newData: {},
    dataSource: [],
    dictionary: {
      ads: [],
      adPlans: [],
    },
  };

  // 表格字段们
  columns = [
    {
      title: '广告类别',
      dataIndex: 'typeName',
      sorter: true,
    },
    {
      title: '广告计划',
      dataIndex: 'plan',
      sorter: true,
    },
    {
      title: '展现量',
      dataIndex: 'displayAmount',
      sorter: true,
    },
    {
      title: '点击量',
      dataIndex: 'clickAmount',
      sorter: true,
    },
    {
      title: '消费',
      dataIndex: 'consumption',
      sorter: true,
    },
    {
      title: '消费时间',
      dataIndex: 'time',
      sorter: true,
    },
    {
      title: '添加者',
      dataIndex: 'editor',
      sorter: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      fixed: 'right',
      width: 100,
      render: (dataIndex, record) => (
        <div>
          <Tooltip title="编辑" mouseLeaveDelay={0}>
            <Button
              shape="circle"
              icon="edit"
              onClick={() => {
                this.setDrawerTitle('编辑消费列表');
                this.setState({ isEditing: true });
                this.onEditBtnClick(record);
                this.showDrawer();
              }}
            />
          </Tooltip>
          <Popconfirm
            title="确认删除？"
            onConfirm={() => {
              this.handleDelete(record);
            }}
          >
            <Tooltip title="删除" mouseLeaveDelay={0}>
              <Button shape="circle" icon="delete" />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  handleDelete = async record => {
    const { dataSource } = this.state;
    const result = await deleteAdConsumptionItem(record);
    if (result === 'error') {
      message.error('删除失败');
      return;
    }
    message.success('删除成功');
    dataSource.splice(dataSource.indexOf(record), 1);
    this.setState({ dataSource: JSON.parse(JSON.stringify(dataSource)) });
  };

  setDrawerTitle = title => {
    this.setState({ drawerTitle: title });
  };

  onEditBtnClick = record => {
    this.setState({ newData: record });
  };

  showDrawer = () => {
    this.setState({ drawerVisiable: true });
  };

  onCancel = () => {
    this.setState({
      drawerVisiable: false,
      newData: {},
    });
  };

  setIsLoad = isLoad => {
    this.setState({ isLoading: isLoad });
  };

  componentDidMount = async () => {
    const { dispatch } = this.props;
    const { dictionary } = this.state;
    this.setIsLoad(true);
    let tempData = await dispatch({ type: 'rule/adconlist' });
    let index = -1;
    // eslint-disable-next-line arrow-body-style
    tempData = tempData.map(item => {
      index += 1;
      return {
        key: index,
        ...item,
      };
    });

    const userDepartment = getUserMgr().departmentId;
    dictionary.ads = (await dictionariesMgr.getAds()).filter(
      ele => ele.ps.indexOf(userDepartment) > -1
    );

    const arr = dictionary.ads.map(ele => ele.itemName);

    tempData = tempData.filter(
      ele => arr.indexOf(ele.typeName) > -1 || ele.editor === getUserMgr().name
    );
    this.setState({ dataSource: tempData });
    this.setIsLoad(false);
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'rule/fetch',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'rule/fetch',
      payload: {},
    });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  validate = async () => {
    const {
      form: { validateFieldsAndScroll },
    } = this.props;
    const { dataSource, isEditing, newData } = this.state;
    if (isEditing) {
      // 新增
      if (
        newData.plan === '' ||
        newData.typeName === '' ||
        newData.displayAmount === '' ||
        newData.consumption === '' ||
        newData.clickAmount === '' ||
        newData.time === ''
      ) {
        message.error('信息不能为空');
        return;
      }

      const result = await updateAdConsumptionItem(newData);
      if (result.error || result.errors) {
        this.setState({ drawerVisiable: false });
        message.error('更新失败');
        this.setState({ dataSource });
      } else {
        this.setState({ drawerVisiable: false });
        message.success('更新成功');
        this.componentDidMount();
        this.setState({ dataSource, newData: {} });
      }
    } else {
      validateFieldsAndScroll(async error => {
        if (!error) {
          // 新增
          if (
            newData.plan === '' ||
            newData.typeName === '' ||
            newData.displayAmount === '' ||
            newData.consumption === '' ||
            newData.clickAmount === '' ||
            newData.time === ''
          ) {
            message.error('信息不能为空');
            return;
          }

          const result = await addAdConsumptionItem(newData);

          if (result.error || result.errors) {
            this.setState({ drawerVisiable: false });
            message.error('新增失败');
          } else {
            const res = result.data.addAdConsumptionRec;
            this.setState({ drawerVisiable: false });
            message.success('新增成功');
            res.key = res.id;
            const tempData = dataSource.concat(res);
            this.setState({
              dataSource: tempData,
              newData: {},
            });
          }
        }
      });
    }
  };

  render() {
    const {
      form: { getFieldDecorator },
      submitting,
    } = this.props;
    const { selectedRows, dataSource, isLoading, newData, dictionary } = this.state;
    return (
      <Collapse defaultActiveKey={['open']}>
        <Collapse.Panel header="广告消费列表" key="open">
          <PageHeaderWrapper>
            <Card>
              <div>
                <Button
                  type="primary"
                  onClick={() => {
                    this.setDrawerTitle('新增消费列表');
                    this.setState({ isEditing: false });
                    // this.setState({ newData: '' });
                    this.showDrawer();
                  }}
                  style={{ marginBottom: '10px' }}
                >
                  <Icon type="plus" />
                  新增
                </Button>
                <Modal
                  title={
                    // eslint-disable-next-line react/destructuring-assignment
                    this.state.drawerTitle
                  }
                  width={320}
                  onCancel={this.onCancel}
                  footer={null}
                  destroyOnClose
                  visible={
                    // eslint-disable-next-line react/destructuring-assignment
                    this.state.drawerVisiable
                  }
                >
                  <div>
                    <Form layout="inline" hideRequiredMark>
                      <Row>
                        <Form.Item label="广告类别">
                          {getFieldDecorator('typeName', {})(
                            <Select
                              placeholder={newData.typeName}
                              style={{ width: 180 }}
                              onChange={(value, option) => {
                                newData.plan = '';
                                dictionary.adPlans = dictionariesMgr
                                  .getChildren(option.key, '广告类别')
                                  .filter(ele => ele.itemAvailiable === true);
                                this.setState({ dictionary });
                                newData.typeName = value;
                              }}
                            >
                              {dictionary.ads.map(ele => (
                                <Option key={ele.id} value={ele.itemName}>
                                  {ele.itemName}
                                </Option>
                              ))}
                            </Select>
                          )}
                        </Form.Item>
                      </Row>
                      <Row>
                        <Form.Item label="广告计划">
                          {getFieldDecorator('plan', {})(
                            <Select
                              placeholder={newData.plan}
                              style={{ width: 180 }}
                              onChange={value => {
                                newData.plan = value;
                              }}
                            >
                              {dictionary.adPlans.map(ele => (
                                <Option key={ele.id} value={ele.itemName}>
                                  {ele.itemName}
                                </Option>
                              ))}
                            </Select>
                          )}
                        </Form.Item>
                      </Row>
                      <Row>
                        <Form.Item label="展现量">
                          {getFieldDecorator('displayAmount', {})(
                            <Input
                              type="number"
                              placeholder={newData.displayAmount}
                              onChange={e => {
                                newData.displayAmount = e.target.value;
                              }}
                            />
                          )}
                        </Form.Item>
                      </Row>
                      <Row>
                        <Form.Item label="点击量">
                          {getFieldDecorator('clickAmount', {})(
                            <Input
                              type="number"
                              placeholder={newData.clickAmount}
                              onChange={e => {
                                newData.clickAmount = e.target.value;
                              }}
                            />
                          )}
                        </Form.Item>
                      </Row>
                      <Row>
                        <Form.Item label="消费">
                          {getFieldDecorator('consumption', {})(
                            <Input
                              type="number"
                              placeholder={newData.consumption}
                              onChange={e => {
                                newData.consumption = e.target.value;
                              }}
                            />
                          )}
                        </Form.Item>
                      </Row>
                      <Row>
                        <Form.Item label="消费时间">
                          {getFieldDecorator('consumptionTime', {})(
                            <DatePicker
                              type="date"
                              placeholder={newData.time}
                              onChange={value => {
                                newData.time = value.format('YYYY-MM-DD');
                              }}
                            />
                          )}
                        </Form.Item>
                      </Row>

                      <Button
                        type="primary"
                        style={{ marginLeft: '20px' }}
                        onClick={this.validate}
                        loading={submitting}
                      >
                        提交
                      </Button>
                      <Button type="danger" style={{ marginLeft: '80px' }}>
                        清除
                      </Button>
                    </Form>
                  </div>
                </Modal>
              </div>
              <div className={styles.tableList}>
                <Skeleton loading={isLoading}>
                  <StandardTable
                    scroll={{ x: 800 }}
                    selectedRows={selectedRows}
                    dataSource={dataSource}
                    columns={this.columns}
                    onSelectRow={this.handleSelectRows}
                    onChange={this.handleStandardTableChange}
                  />
                </Skeleton>
              </div>
            </Card>
          </PageHeaderWrapper>
        </Collapse.Panel>
      </Collapse>
    );
  }
}

export default adConsumptionList;
