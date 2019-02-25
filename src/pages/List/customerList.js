import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Card,
  Form,
  Button,
  Popconfirm,
  Input,
  Icon,
  Skeleton,
  Tooltip,
  Select,
  Modal,
  message,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './customerList.less';
import { getUsersDetail, deleteUser } from '@/services/apollo/apolloUser';

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
class customerList extends PureComponent {
  state = {
    isLoading: false,
    selectedRows: [],
    formValues: {},
    dataSource: [],
  };

  // 表格字段们
  columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      sorter: true,
      width: 130,
    },
    {
      title: 'VipLevel',
      dataIndex: 'vipLevel',
      sorter: true,
      width: 120,
    },
    {
      title: '性别',
      dataIndex: 'sex',
      sorter: true,
      width: 80,
    },
    {
      title: '年龄',
      dataIndex: 'age',
      sorter: true,
      width: 80,
    },
    {
      title: '地区',
      dataIndex: 'where',
      sorter: true,
      width: 80,
    },
    {
      title: '大来源',
      dataIndex: 'bigFrom',
      sorter: true,
      width: 120,
    },
    {
      title: '主项目',
      dataIndex: 'mainProject',
      sorter: true,
      width: 120,
    },
    {
      title: '首次咨询方式',
      dataIndex: 'firstAdvisoryWay',
      sorter: true,
      width: 100,
    },
    {
      title: '咨询次数',
      dataIndex: 'consultationCount',
      sorter: true,
    },
    {
      title: '预约次数',
      dataIndex: 'bookingCount',
      sorter: true,
    },
    {
      title: '到院次数',
      dataIndex: 'hasBeenHospitalCount',
      sorter: true,
    },
    {
      title: '开单次数',
      dataIndex: 'billsCount',
      sorter: true,
    },
    {
      title: '登记归属',
      dataIndex: 'creator',
      sorter: true,
    },
    {
      title: '网电咨询员',
      dataIndex: '',
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
      width: 240,
      render: (dataIndex, record) => (
        <div>
          <Tooltip title="编辑" mouseLeaveDelay={0}>
            <Button shape="circle" icon="edit" />
          </Tooltip>

          <Popconfirm title="确认删除？" onConfirm={() => this.handleDelete(record)}>
            <Tooltip title="删除" mouseLeaveDelay={0}>
              <Button shape="circle" icon="delete" />
            </Tooltip>
          </Popconfirm>
          <Tooltip title="添加回访任务" mouseLeaveDelay={0}>
            <Button shape="circle" icon="smile" />
          </Tooltip>
          <Tooltip title="添加回访记录" mouseLeaveDelay={0}>
            <Button shape="circle" icon="book" />
          </Tooltip>
          <Tooltip title="添加咨询预约" mouseLeaveDelay={0}>
            <Button shape="circle" icon="bell" />
          </Tooltip>
          <Tooltip title="发送短信" mouseLeaveDelay={0}>
            <Button shape="circle" icon="message" />
          </Tooltip>
        </div>
      ),
    },
  ];

  setIsLoad = isLoad => {
    this.setState({ isLoading: isLoad });
  };

  getIsCheck = () => this.dataSource.status;

  componentDidMount = async () => {
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
  };

  handleDelete = async record => {
    const { dataSource } = this.state;
    const res = await deleteUser(record);
    if (res.error || res.errors) {
      message.error('删除失败');
      return;
    }
    message.success('删除成功');
    dataSource.splice(dataSource.indexOf(record), 1);

    this.setState({ dataSource: JSON.parse(JSON.stringify(dataSource)) });
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

  render() {
    const { selectedRows, dataSource, isLoading } = this.state;
    return (
      <PageHeaderWrapper>
        <Card>
          <div>
            <Button type="primary" style={{ marginBottom: '10px' }}>
              <Icon type="plus" />
              新增
            </Button>
            <Modal // eslint-disable-next-line react/destructuring-assignment
              width={320}
              onCancel={this.onClose} // eslint-disable-next-line react/destructuring-assignment
            >
              <div>
                <Form layout="inline" hideRequiredMark>
                  <Form.Item label="姓名">
                    <Input placeholder="姓名" />
                  </Form.Item>
                  <Form.Item label="VipLevel">
                    <Input type="number" placeholder="VipLevel" />
                  </Form.Item>
                  <Form.Item label="性别">
                    <Select placeholder="性别" style={{ width: 180 }}>
                      <Option value="男">男</Option>
                      <Option value="女">女</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="添加者">
                    <Input placeholder="添加者" />
                  </Form.Item>

                  <Button type="primary">提交</Button>
                  <Button type="danger" style={{ marginLeft: '40px' }}>
                    清除
                  </Button>
                </Form>
              </div>
            </Modal>
          </div>
          <div className={styles.tableList}>
            <Skeleton loading={isLoading}>
              <StandardTable
                scroll={{ x: 2100 }}
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
    );
  }
}

export default customerList;
