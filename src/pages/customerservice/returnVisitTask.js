/* eslint-disable no-param-reassign */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Card,
  Form,
  Tooltip,
  Popconfirm,
  Button,
  message,
  Modal,
  DatePicker,
  Tabs,
  Select,
  Input,
  Icon,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './returnVisitTask.less';
import {
  getReturnVisit,
  addReturnVisitRecord,
  updateReturnVisitTask,
} from '@/services/apollo/apolloTable';
import dictionariesMgr, { DictionaryItem } from '@/services/dictionariesMgr';

const { Option } = Select;

const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const TabPane = Tabs.TabPane;
// 待回访任务
/* eslint react/no-multi-comp:0 */
@connect(({ rule, loading }) => ({
  rule,
  loading: loading.models.rule,
}))
// table list
@Form.create()
class returnVisitTask extends PureComponent {
  state = {
    searchText: '',
    modalVisiable: false,
    selectedRows: [],
    formValues: {},
    dataSource: [],
    newData: [],
    dictionary: {
      way: [],
      result: [],
      flow: [],
    },
  };

  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div
        style={{
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0, 0, 0, .15',
          padding: 8,
          borderRadius: 4,
        }}
      >
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
          Reset
        </Button>
      </div>
    ),
    filterIcon: filtered => (
      <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: text => {
      const { searchText } = this.state;
      return <div>{text}</div>;
    },
  });

  handleSearch = (selectedKeys, confirm) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: '' });
  };

  componentDidMount = async () => {
    const { dictionary } = this.state;
    const dic = {
      way: [],
      result: [],
      flow: [],
    };
    const tempData = await getReturnVisit();

    dic.way = (await dictionariesMgr.getChildrenByRoot(DictionaryItem.TraceWay)).filter(
      ele => ele.itemAvailiable === true
    );
    dic.result = (await dictionariesMgr.getChildrenByRoot(DictionaryItem.TraceResult)).filter(
      ele => ele.itemAvailiable === true
    );
    dic.flow = (await dictionariesMgr.getChildrenByRoot(DictionaryItem.TraceUserTo)).filter(
      ele => ele.itemAvailiable === true
    );

    if (tempData.error || tempData.errors) {
      message.error('失败，请重试');
      return;
    }
    let payload = tempData.data.returnVisitTasks;

    payload = payload.map(item => ({
      key: item.id,
      ...item,
    }));

    this.setState({ dataSource: payload });
    this.setState({ dictionary: { ...dictionary, ...dic } });
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
    const { newData, dataSource } = this.state;
    this.setState({ modalVisiable: false });
    // newData.taskId = '123';
    const result = await addReturnVisitRecord(newData);
    if (result === 'error') {
      message.error('添加失败');
      this.setState({ dataSource });
    } else {
      message.success('添加成功');
      this.setState({ dataSource });
    }
  };

  handleFinish = async record => {
    const { dataSource } = this.state;
    const payload = record;
    payload.status = '已完成';
    const respone = await updateReturnVisitTask(record);
    if (respone.error || respone.errors) {
      message.error('更新失败');
      return;
    }
    record.status = '已完成';
    message.success('更新成功');
    this.setState({ dataSource: JSON.parse(JSON.stringify(dataSource)) });
  };

  render() {
    const { selectedRows, dataSource, modalVisiable, newData, dictionary } = this.state;
    const hasFinish = dataSource.filter(ele => ele.status === '已完成');
    const notFinish = dataSource.filter(ele => ele.status === '未完成');

    const columns1 = [
      {
        title: '姓名',
        dataIndex: 'name',
        sorter: true,
        width: 130,
        fixed: 'left',
        ...this.getColumnSearchProps('name'),
      },
      {
        title: '电话',
        dataIndex: 'tel',
        sorter: true,
      },
      {
        title: '回访类型',
        dataIndex: 'type',
        sorter: true,
      },
      {
        title: '回访主题',
        dataIndex: 'topic',
        sorter: true,
      },
      {
        title: '待回访日期',
        dataIndex: 'date',
        sorter: true,
      },
      {
        title: '回访人',
        dataIndex: 'visitor',
        sorter: true,
      },
      {
        title: '创建日期',
        dataIndex: 'createdAt',
        sorter: true,
      },
      {
        title: '创建人',
        dataIndex: 'creator',
        sorter: true,
      },
      {
        title: '操作',
        dataIndex: 'operation',
        fixed: 'right',
        width: 100,
        render: (dataIndex, record) => (
          <div>
            <Tooltip title="添加回访记录" mouseLeaveDelay={0}>
              <Button
                shape="circle"
                icon="book"
                onClick={() => {
                  this.setState({ modalVisiable: true });
                  this.setState({ newData: record });
                }}
              />
            </Tooltip>
            <Popconfirm title="完成任务？" onConfirm={() => this.handleFinish(record)}>
              <Tooltip title="完成任务" mouseLeaveDelay={0}>
                <Button shape="circle" icon="check" />
              </Tooltip>
            </Popconfirm>
          </div>
        ),
      },
    ];

    const columns2 = [
      {
        title: '姓名',
        dataIndex: 'name',
        sorter: true,
        width: 130,
        fixed: 'left',
        ...this.getColumnSearchProps('name'),
      },
      {
        title: '电话',
        dataIndex: 'tel',
        sorter: true,
      },
      {
        title: '回访类型',
        dataIndex: 'type',
        sorter: true,
      },
      {
        title: '回访主题',
        dataIndex: 'topic',
        sorter: true,
      },
      {
        title: '待回访日期',
        dataIndex: 'date',
        sorter: true,
      },
      {
        title: '回访人',
        dataIndex: 'visitor',
        sorter: true,
      },
      {
        title: '创建日期',
        dataIndex: 'createdAt',
        sorter: true,
      },
      {
        title: '创建人',
        dataIndex: 'creator',
        sorter: true,
      },
    ];

    return (
      <PageHeaderWrapper>
        <Tabs defaultActiveKey="1">
          <TabPane tab="未完成" key="1">
            <Card>
              <Modal
                title="添加回访记录"
                visible={modalVisiable}
                onOk={this.handleOk}
                width={320}
                destroyOnClose
                onCancel={() => {
                  this.setState({ modalVisiable: false });
                }}
              >
                <Form layout="inline">
                  <Form.Item label="回访方式">
                    <Select
                      placeholder="回访方式"
                      style={{ width: 157 }}
                      onChange={value => {
                        newData.way = value;
                      }}
                    >
                      {dictionary.way.map(ele => (
                        <Option key={ele.id} value={ele.itemName}>
                          {ele.itemName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item label="回访结果">
                    <Select
                      placeholder="回访结果"
                      style={{ width: 157 }}
                      onChange={value => {
                        newData.result = value;
                      }}
                    >
                      {dictionary.result.map(ele => (
                        <Option key={ele.id} value={ele.itemName}>
                          {ele.itemName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item label="客户流向">
                    <Select
                      placeholder="客户流向"
                      style={{ width: 157 }}
                      onChange={value => {
                        newData.flow = value;
                      }}
                    >
                      {dictionary.flow.map(ele => (
                        <Option key={ele.id} value={ele.itemName}>
                          {ele.itemName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item label="回访日期">
                    {
                      <DatePicker
                        onChange={value => {
                          if (value) {
                            newData.returnVisitDate = value.format('YYYY-MM-DD');
                          }
                        }}
                      />
                    }
                  </Form.Item>
                </Form>
              </Modal>
              <div className={styles.tableList}>
                <StandardTable
                  scroll={{ x: 1300 }}
                  selectedRows={selectedRows}
                  dataSource={notFinish}
                  columns={columns1}
                  onSelectRow={this.handleSelectRows}
                  onChange={this.handleStandardTableChange}
                />
              </div>
            </Card>
          </TabPane>
          <TabPane tab="已完成" key="2">
            <Card>
              <div className={styles.tableList}>
                <StandardTable
                  scroll={{ x: 1300 }}
                  selectedRows={selectedRows}
                  dataSource={hasFinish}
                  columns={columns2}
                  onSelectRow={this.handleSelectRows}
                  onChange={this.handleStandardTableChange}
                />
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </PageHeaderWrapper>
    );
  }
}

export default returnVisitTask;
