import React, { PureComponent } from 'react';
import {
  Card,
  Form,
  Button,
  Skeleton,
  Tooltip,
  message,
  Modal,
  Input,
  DatePicker,
  Select,
  Row,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import { formatMessage } from 'umi/locale';

import moment from 'moment';
import styles from './customerList.less';
import { getUsersDetail } from '@/services/apollo/apolloUser';
import { addReturnVisitTask } from '@/services/apollo/apolloTable';
import dictionariesMgr, { DictionaryItem } from '@/services/dictionariesMgr';

const { Option } = Select;

class customerList extends PureComponent {
  state = {
    modalVisiable: false,
    isLoading: false,
    selectedRows: [],
    formValues: {},
    dataSource: [],
    newData: [],
    dictionary: {
      type: [],
      topic: [],
    },
  };

  // 表格字段们
  columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      sorter: true,
    },
    {
      title: '电话',
      dataIndex: 'mobile',
      sorter: true,
    },
    {
      title: '性别',
      dataIndex: 'sex',
      sorter: true,
      render: dataIndex => (
        <div>
          {dataIndex === '0'
            ? formatMessage({ id: 'customerForm.form1000' })
            : formatMessage({ id: 'customerForm.form1001' })}
        </div>
      ),
    },
    {
      title: '年龄',
      dataIndex: 'age',
      sorter: true,
    },
    {
      title: '主项目',
      dataIndex: 'mainProject',
      sorter: true,
    },
    {
      title: '登记时间',
      dataIndex: 'createdAt',
      sorter: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      fixed: 'right',
      width: 60,
      render: (dataIndex, record) => (
        <div>
          <Tooltip title="添加回访任务" mouseLeaveDelay={0}>
            <Button
              shape="circle"
              icon="smile"
              onClick={() => {
                const date = new Date();
                date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                const returnVisitDate = date.toJSON().split('T')[0];
                this.setState({ modalVisiable: true });
                this.setState({ newData: { ...record, returnVisitDate } });
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  setIsLoad = isLoad => {
    this.setState({ isLoading: isLoad });
  };

  componentDidMount = async () => {
    const { dictionary } = this.state;
    const dic = {
      type: [],
      topic: [],
    };

    dic.type = (await dictionariesMgr.getChildrenByRoot(DictionaryItem.TraceType)).filter(
      ele => ele.itemAvailiable === true
    );
    dic.topic = (await dictionariesMgr.getChildrenByRoot(DictionaryItem.TraceProject)).filter(
      ele => ele.itemAvailiable === true
    );

    this.setIsLoad(true);
    let tempData = await getUsersDetail();
    if (tempData.error || tempData.errors) {
      message.error('发生错误，请刷新重试');
      return;
    }
    tempData = tempData.data.usersDetailWDView.map(item => ({
      key: item.id,
      ...item,
    }));

    this.setState({ dataSource: tempData });
    this.setIsLoad(false);
    this.setState({ dictionary: { ...dictionary, ...dic } });

    window.addEventListener('resize', this.resizeFooterToolbar, { passive: true });
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

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleOk = async () => {
    const { newData, dataSource } = this.state;
    newData.status = '未完成';
    if (newData.type && newData.returnVisitDate && newData.topic && newData.visitor) {
      //
    } else {
      message.error('信息为空');
      return;
    }
    const result = await addReturnVisitTask(newData);
    if (result === 'error') {
      message.error('添加失败');
      this.setState({ dataSource });
    } else {
      message.success('添加成功');
      this.setState({ dataSource });
      this.setState({ modalVisiable: false });
    }
  };

  render() {
    const { selectedRows, dataSource, isLoading, modalVisiable, newData, dictionary } = this.state;
    return (
      <Card>
        <Modal
          title="添加回访任务"
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
              <Form.Item label="姓名">{newData.name}</Form.Item>
              <Form.Item label="性别">
                {newData.sex === '0'
                  ? formatMessage({ id: 'customerForm.form1000' })
                  : formatMessage({ id: 'customerForm.form1001' })}
              </Form.Item>
              <Form.Item label="年龄">{newData.age}</Form.Item>
            </Row>
            <Form.Item label="回访类型">
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

            <Form.Item label="回访主题">
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
                value="选择"
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

            <Form.Item label="回访人">
              <Input
                onChange={e => {
                  newData.visitor = e.target.value;
                }}
              />
            </Form.Item>
            <Form.Item label="回访日期">
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
              scroll={{ x: 1000 }}
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

export default customerList;
