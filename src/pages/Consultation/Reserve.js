import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Card,
  Form,
  Tag,
  Tooltip,
  Button,
  Popconfirm,
  Modal,
  Row,
  Input,
  DatePicker,
  Select,
  Skeleton,
  message,
} from 'antd';
import StandardTable from '@/components/StandardTable';

import { formatMessage } from 'umi/locale';
import moment from 'moment';
import styles from './Reserve.less';
import { getBookingRecordsTable, addReturnVisitTask } from '@/services/apollo/apolloTable';
import colorsTag from '@/types';
import formatTimeTommy from '@/util';
import dictionariesMgr, { DictionaryItem } from '@/services/dictionariesMgr';
import TextArea from 'antd/lib/input/TextArea';
import { getAdmins } from '@/services/apollo/apolloAdmin';

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
class Reserve extends PureComponent {
  state = {
    isLoading: false,
    modalVisiable: false,
    modalVisiableEdit: false,
    selectedRows: [],
    formValues: {},
    dataSource: [],
    newData: [],
    dictionary: {
      type: [],
      topic: [],
      admins: [],
      consultations: [],
      consultationsResults: [],
    },
    userInfo: [],
  };

  // 表格字段们
  columns = [
    {
      title: formatMessage({ id: 'conreserveList.table.col1' }),
      dataIndex: 'name',
      sorter: true,
      width: 150,
    },
    {
      title: formatMessage({ id: 'conreserveList.table.col2' }),
      dataIndex: 'vipLevel',
      sorter: true,
      width: 80,
    },
    {
      title: formatMessage({ id: 'conreserveList.table.col3' }),
      dataIndex: 'sex',
      sorter: true,
      width: 100,
      render: dataIndex => (
        <div>
          {dataIndex === '0'
            ? formatMessage({ id: 'customerForm.form1000' })
            : formatMessage({ id: 'customerForm.form1001' })}
        </div>
      ),
    },
    {
      title: formatMessage({ id: 'conreserveList.table.col4' }),
      dataIndex: 'age',
      sorter: true,
      width: 100,
    },
    {
      title: formatMessage({ id: 'conreserveList.table.col5' }),
      dataIndex: 'where',
      sorter: true,
      width: 100,
    },
    {
      title: formatMessage({ id: 'conreserveList.table.col6' }),
      dataIndex: 'bigFrom',
      sorter: true,
      width: 90,
    },
    {
      title: formatMessage({ id: 'conreserveList.table.col7' }),
      dataIndex: 'mainProject',
      sorter: true,
      width: 200,
      render: dataIndex => (
        <div>
          {dataIndex.split(',').map(ele => (
            <Tag color={colorsTag[ele.length % 10]} key={ele}>
              {ele}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: formatMessage({ id: 'conreserveList.table.col8' }),
      dataIndex: 'consultationRecord.advisoryWay',
      sorter: true,
      width: 80,
    },
    {
      title: formatMessage({ id: 'conreserveList.table.col9' }),
      dataIndex: 'id',
      sorter: true,
      width: 100,
    },
    {
      title: formatMessage({ id: 'conreserveList.table.col10' }),
      dataIndex: 'toHospitalCate',
      sorter: true,
      width: 70,
    },
    {
      title: formatMessage({ id: 'conreserveList.table.col11' }),
      dataIndex: 'bookingStatus',
      width: 70,
      render: dataIndex => <div>{formatMessage({ id: `types.bookingStatus${dataIndex}` })}</div>,
    },
    {
      title: formatMessage({ id: 'conreserveList.table.col12' }),
      dataIndex: 'time',
      sorter: true,
      width: 300,
    },
    {
      title: formatMessage({ id: 'conreserveList.table.col13' }),
      dataIndex: 'creator',
      sorter: true,
      width: 100,
    },
    {
      title: formatMessage({ id: 'conreserveList.table.col14' }),
      dataIndex: 'createdAt',
      sorter: true,
      width: 200,
    },
    {
      title: formatMessage({ id: 'conreserveList.table.col15' }),
      dataIndex: 'operation',
      fixed: 'right',
      width: 180,
      render: (dataIndex, record) => (
        <div>
          <Tooltip
            title={formatMessage({ id: 'conreserveList.operation.operation1' })}
            mouseLeaveDelay={0}
          >
            <Button
              shape="circle"
              icon="edit"
              onClick={() => {
                const date = new Date();
                date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                this.setState({ modalVisiableEdit: true });
                this.setState({ newData: { ...record } });
                this.setState({ userInfo: { ...record.user } });
              }}
            />
          </Tooltip>

          <Popconfirm
            title={formatMessage({ id: 'conreserveList.tip.tip1' })}
            onConfirm={() => this.handleDelete(record)}
          >
            <Tooltip
              title={formatMessage({ id: 'conreserveList.operation.operation2' })}
              mouseLeaveDelay={0}
            >
              <Button shape="circle" icon="delete" />
            </Tooltip>
          </Popconfirm>
          <Tooltip
            title={formatMessage({ id: 'conreserveList.operation.operation3' })}
            mouseLeaveDelay={0}
          >
            <Button
              shape="circle"
              icon="smile"
              onClick={() => {
                const date = new Date();
                date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                const returnVisitDate = date.toJSON().split('T')[0];
                this.setState({ modalVisiable: true });
                this.setState({ newData: { ...record, returnVisitDate } });
                this.setState({ userInfo: { ...record.user } });
              }}
            />
          </Tooltip>
          <Tooltip
            title={formatMessage({ id: 'conreserveList.operation.operation4' })}
            mouseLeaveDelay={0}
          >
            <Button shape="circle" icon="bell" />
          </Tooltip>
          <Tooltip
            title={formatMessage({ id: 'conreserveList.operation.operation5' })}
            mouseLeaveDelay={0}
          >
            <Button shape="circle" icon="message" />
          </Tooltip>
        </div>
      ),
    },
  ];

  setIsLoad = isLoad => {
    this.setState({ isLoading: isLoad });
  };

  componentDidMount = async () => {
    this.setIsLoad(true);
    const { dictionary } = this.state;
    const dic = {
      type: [],
      topic: [],
      admins: [],
      consultations: [],
      consultationsResults: [],
    };
    const tempAdmins = await getAdmins();

    dic.type = (await dictionariesMgr.getChildrenByRoot(DictionaryItem.TraceType)).filter(
      ele => ele.itemAvailiable === true
    );
    dic.topic = (await dictionariesMgr.getChildrenByRoot(DictionaryItem.TraceProject)).filter(
      ele => ele.itemAvailiable === true
    );
    dic.admins = tempAdmins.data.admins.map(ele => ({
      itemName: ele.name,
      key: ele.id,
    }));
    dic.consultations = (await dictionariesMgr.getConsultations()).filter(
      ele => ele.itemAvailiable
    );
    dic.consultationsResults = (await dictionariesMgr.getConsultationsResult()).filter(
      ele => ele.itemAvailiable
    );

    let tempData = await getBookingRecordsTable();
    tempData = tempData.data.bookingRecords;

    tempData = tempData.map(item => ({
      key: item.id,
      name: item.user.name,
      sex: item.user.sex,
      age: item.user.age,
      bigFrom: item.user.bigFrom,
      where: item.user.where,
      vipLevel: item.user.vipLevel,
      mainProject: item.user.mainProject,
      consultant: item.creator,
      ...item,
      time: formatTimeTommy(item.time),
      createdAt: formatTimeTommy(item.createdAt),
    }));

    tempData.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

    this.setState({ dictionary: { ...dictionary, ...dic } });
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

  handleOk = async () => {
    const { newData, dataSource, userInfo } = this.state;
    newData.status = formatMessage({ id: 'ConconsulationList.tip.tip2' });
    newData.name = userInfo.name;
    newData.sex = userInfo.sex;
    newData.age = userInfo.age;
    if (newData.type && newData.returnVisitDate && newData.topic && newData.visitor) {
      //
    } else {
      message.error(formatMessage({ id: 'ConconsulationList.tip.tip3' }));
      return;
    }
    const result = await addReturnVisitTask(newData);
    if (result === 'error') {
      message.error(formatMessage({ id: 'ConconsulationList.tip.tip4' }));
      this.setState({ dataSource });
    } else {
      message.success(formatMessage({ id: 'ConconsulationList.tip.tip5' }));
      this.setState({ dataSource });
      this.setState({ modalVisiable: false });
    }
  };

  render() {
    const {
      selectedRows,
      dataSource,
      modalVisiable,
      modalVisiableEdit,
      newData,
      dictionary,
      isLoading,
      userInfo,
    } = this.state;
    return (
      <Card>
        <Modal
          title="添加回访记录"
          visible={modalVisiableEdit}
          onOk={this.handleAddRecord}
          width={320}
          destroyOnClose
          onCancel={() => {
            this.setState({ modalVisiableEdit: false });
          }}
        >
          <Form layout="inline">
            <Row>
              <Form.Item label={formatMessage({ id: 'ConconsulationList.form.form2' })}>
                {userInfo.name}
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'ConconsulationList.form.form3' })}>
                {userInfo.sex}
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'ConconsulationList.form.form4' })}>
                {userInfo.age}
              </Form.Item>
            </Row>

            <Form.Item label={formatMessage({ id: 'customerForm.form41' })}>
              <Select
                allowClear
                style={{ width: 157 }}
                onChange={value => {
                  newData.advisoryWay = value;
                }}
              >
                {dictionary.consultations.map(ele => (
                  <Option key={ele.id} value={ele.itemName}>
                    {ele.itemName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'customerForm.form42' })}>
              <Select
                allowClear
                style={{ width: 157 }}
                onChange={value => {
                  newData.advisoryResult = value;
                }}
              >
                {dictionary.consultationsResults.map(ele => (
                  <Option key={ele.id} value={ele.itemName}>
                    {ele.itemName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'customerForm.form43' })}>
              <Input
                style={{ width: 157 }}
                rows="1"
                onChange={e => {
                  newData.advisoryDetail = e.target.value;
                }}
              />
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'customerForm.form44' })}>
              <TextArea
                style={{ width: 157 }}
                rows="2"
                onChange={e => {
                  newData.addvisorySummary = e.target.value;
                }}
              />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={formatMessage({
            id: 'conreserveList.form.form1',
          })}
          visible={modalVisiable}
          onOk={this.handleOk}
          width={600}
          destroyOnClose
          onCancel={() => {
            this.setState({ modalVisiable: false });
          }}
        >
          <Form layout="inline">
            <Row>
              <Form.Item
                label={formatMessage({
                  id: 'conreserveList.form.form2',
                })}
              >
                {userInfo.name}
              </Form.Item>
              <Form.Item
                label={formatMessage({
                  id: 'conreserveList.form.form3',
                })}
              >
                {userInfo.sex}
              </Form.Item>
              <Form.Item
                label={formatMessage({
                  id: 'conreserveList.form.form4',
                })}
              >
                {userInfo.age}
              </Form.Item>
            </Row>
            <Form.Item
              label={formatMessage({
                id: 'conreserveList.form.form5',
              })}
            >
              <Select
                style={{ width: 157 }}
                onChange={value => {
                  newData.type = value;
                }}
              >
                {dictionary.type.map(ele => (
                  <Option key={ele.id} value={ele.itemName}>
                    {ele.itemName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={formatMessage({
                id: 'conreserveList.form.form6',
              })}
            >
              <Input
                value={newData.topic}
                style={{ width: 120 }}
                onChange={e => {
                  newData.topic = e.target.value;
                  this.setState({ newData: { ...newData } });
                }}
              />
              <Select
                showSearch
                value={formatMessage({
                  id: 'conreserveList.form.form7',
                })}
                style={{ width: 80 }}
                onChange={value => {
                  newData.topic = value;
                  this.setState({ newData: { ...newData } });
                }}
              >
                {dictionary.topic.map(ele => (
                  <Option key={ele.id} value={ele.itemName}>
                    {ele.itemName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={formatMessage({
                id: 'conreserveList.form.form8',
              })}
            >
              <Select
                showSearch
                style={{ width: 140 }}
                onChange={value => {
                  newData.visitor = value;
                  this.setState({ newData: { ...newData } });
                }}
              >
                {dictionary.admins.map(ele => (
                  <Option key={ele.key} value={ele.itemName}>
                    {ele.itemName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label={formatMessage({
                id: 'conreserveList.form.form9',
              })}
            >
              <DatePicker
                style={{ width: 200 }}
                defaultValue={moment(newData.returnVisitDate)}
                onChange={value => {
                  if (value) {
                    newData.returnVisitDate = value.format('YYYY-MM-DD');
                  }
                }}
              />
            </Form.Item>
          </Form>
        </Modal>

        <div className={styles.tableList}>
          <Skeleton loading={isLoading}>
            <StandardTable
              scroll={{ x: 2200 }}
              selectedRows={selectedRows}
              dataSource={dataSource}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </Skeleton>
        </div>
      </Card>
    );
  }
}

export default Reserve;
