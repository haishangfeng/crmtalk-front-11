/* eslint-disable react/destructuring-assignment */
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
import { formatMessage } from 'umi/locale';
import styles from './adConsumptionList.less';
import {
  deleteAdConsumptionItem,
  addAdConsumptionItem,
  updateAdConsumptionItem,
  getAdConsumptions,
} from '@/services/apollo/apolloTable';
import moment from 'moment';
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
      title: formatMessage({ id: 'adComsuptionList.table.col1' }),
      dataIndex: 'typeName',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'adComsuptionList.table.col2' }),
      dataIndex: 'plan',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'adComsuptionList.table.col3' }),
      dataIndex: 'displayAmount',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'adComsuptionList.table.col4' }),
      dataIndex: 'clickAmount',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'adComsuptionList.table.col5' }),
      dataIndex: 'consumption',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'adComsuptionList.table.col6' }),
      dataIndex: 'time',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'adComsuptionList.table.col7' }),
      dataIndex: 'creator',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'adComsuptionList.table.col8' }),
      dataIndex: 'operation',
      fixed: 'right',
      width: 100,
      render: (dataIndex, record) => (
        <div>
          <Tooltip
            title={formatMessage({ id: 'adComsuptionList.operation.operation1' })}
            mouseLeaveDelay={0}
          >
            <Button
              shape="circle"
              icon="edit"
              onClick={() => {
                this.setDrawerTitle(formatMessage({ id: 'adComsuptionList.tip.tip1' }));
                this.setState({ isEditing: true });
                this.onEditBtnClick(record);
                this.showDrawer();
              }}
            />
          </Tooltip>
          <Popconfirm
            title={formatMessage({ id: 'adComsuptionList.tip.tip2' })}
            onConfirm={() => {
              this.handleDelete(record);
            }}
          >
            <Tooltip
              title={formatMessage({ id: 'adComsuptionList.operation.operation2' })}
              mouseLeaveDelay={0}
            >
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
      message.error(formatMessage({ id: 'adComsuptionList.tip.tip3' }));
      return;
    }
    message.success(formatMessage({ id: 'adComsuptionList.tip.tip4' }));
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
    const { dictionary } = this.state;
    this.setIsLoad(true);
    let tempData = await getAdConsumptions();
    if (tempData.error || tempData.errors) return;
    tempData = tempData.data.adConsumptions;

    tempData = tempData.map(item => ({
      key: item.id,
      ...item,
    }));

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
        message.error(formatMessage({ id: 'adComsuptionList.tip.tip5' }));
        return;
      }

      const result = await updateAdConsumptionItem(newData);
      if (result.error || result.errors) {
        this.setState({ drawerVisiable: false });
        message.error(formatMessage({ id: 'adComsuptionList.tip.tip6' }));
        this.setState({ dataSource });
      } else {
        this.setState({ drawerVisiable: false });
        message.success(formatMessage({ id: 'adComsuptionList.tip.tip7' }));
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
            message.error(formatMessage({ id: 'adComsuptionList.tip.tip5' }));
            return;
          }

          const result = await addAdConsumptionItem(newData);

          if (result.error || result.errors) {
            this.setState({ drawerVisiable: false });
            message.error(formatMessage({ id: 'adComsuptionList.tip.tip8' }));
          } else {
            const res = result.data.addAdConsumptionRec;
            this.setState({ drawerVisiable: false });
            message.success(formatMessage({ id: 'adComsuptionList.tip.tip9' }));
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
    const { selectedRows, dataSource, isLoading, newData, dictionary } = this.state;
    return (
      <Collapse defaultActiveKey={['open']}>
        <Collapse.Panel
          header={formatMessage({
            id: 'adComsuptionList.table.tableName',
          })}
          key="open"
        >
          <Card>
            <div>
              <Button
                type="primary"
                onClick={() => {
                  this.setDrawerTitle(formatMessage({ id: 'adComsuptionList.table.addNew' }));
                  this.setState({ isEditing: false });
                  const date = new Date();
                  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                  const time = date.toJSON().split('T')[0];
                  this.setState({ newData: { time } });
                  this.showDrawer();
                }}
                style={{ marginBottom: '10px' }}
              >
                <Icon type="plus" />
                {formatMessage({ id: 'adComsuptionList.operation.operation3' })}
              </Button>
              <Modal
                title={this.state.drawerTitle}
                width={320}
                onCancel={this.onCancel}
                destroyOnClose
                visible={this.state.drawerVisiable}
                onOk={this.validate}
              >
                <div>
                  <Form layout="inline" hideRequiredMark>
                    <Row>
                      <Form.Item label={formatMessage({ id: 'adComsuptionList.form.form1' })}>
                        <Select
                          defaultValue={newData.typeName}
                          style={{ width: 180 }}
                          onChange={(value, option) => {
                            newData.typeName = value;
                            newData.plan = '';
                            dictionary.adPlans = dictionariesMgr
                              .getChildren(
                                option.key,
                                formatMessage({
                                  id: 'adComsuptionList.form.form1',
                                })
                              )
                              .filter(ele => ele.itemAvailiable === true);
                            this.setState({ dictionary: { ...dictionary } });
                          }}
                        >
                          {dictionary.ads.map(ele => (
                            <Option key={ele.id} value={ele.itemName}>
                              {ele.itemName}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Row>
                    <Row>
                      <Form.Item label={formatMessage({ id: 'adComsuptionList.form.form2' })}>
                        <Select
                          defaultValue={newData.plan}
                          style={{ width: 180 }}
                          onChange={value => {
                            newData.plan = value;
                            this.setState({ newData: { ...newData } });
                          }}
                        >
                          {dictionary.adPlans.map(ele => (
                            <Option key={ele.id} value={ele.itemName}>
                              {ele.itemName}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Row>
                    <Row>
                      <Form.Item label={formatMessage({ id: 'adComsuptionList.form.form3' })}>
                        <Input
                          type="number"
                          value={newData.displayAmount}
                          onChange={e => {
                            newData.displayAmount = e.target.value;
                            this.setState({ newData: { ...newData } });
                          }}
                        />
                      </Form.Item>
                    </Row>
                    <Row>
                      <Form.Item label={formatMessage({ id: 'adComsuptionList.form.form4' })}>
                        <Input
                          type="number"
                          value={newData.clickAmount}
                          onChange={e => {
                            newData.clickAmount = e.target.value;
                            this.setState({ newData: { ...newData } });
                          }}
                        />
                      </Form.Item>
                    </Row>
                    <Row>
                      <Form.Item label={formatMessage({ id: 'adComsuptionList.form.form5' })}>
                        <Input
                          type="number"
                          value={newData.consumption}
                          onChange={e => {
                            newData.consumption = e.target.value;
                            this.setState({ newData: { ...newData } });
                          }}
                        />
                      </Form.Item>
                    </Row>
                    <Row>
                      <Form.Item label={formatMessage({ id: 'adComsuptionList.form.form6' })}>
                        <DatePicker
                          type="date"
                          defaultValue={moment(newData.time)}
                          onChange={value => {
                            if (value) {
                              newData.time = value.format('YYYY-MM-DD');
                              this.setState({ newData: { ...newData } });
                            } else {
                              newData.time = '';
                            }
                          }}
                        />
                      </Form.Item>
                    </Row>
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
        </Collapse.Panel>
      </Collapse>
    );
  }
}

export default adConsumptionList;
