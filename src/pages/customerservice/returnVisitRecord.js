import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, Tooltip, Popconfirm, Button, message } from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './returnVisitRecord.less';
import { getReturnVisitReocrd, deleteReturnVisitRecord } from '@/services/apollo/apolloTable';

const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
// 已回访列表
/* eslint react/no-multi-comp:0 */
@connect(({ rule, loading }) => ({
  rule,
  loading: loading.models.rule,
}))
// table list
@Form.create()
class returnVisitRecord extends PureComponent {
  state = {
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
      width: 120,
      fixed: 'left',
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
      title: '回访方式',
      dataIndex: 'way',
      sorter: true,
    },
    {
      title: '回访主题',
      dataIndex: 'topic',
      sorter: true,
    },
    {
      title: '回访结果',
      dataIndex: 'result',
      sorter: true,
    },
    {
      title: '客户流向',
      dataIndex: 'flow',
      sorter: true,
    },
    {
      title: '回访日期',
      dataIndex: 'createdAt',
      sorter: true,
    },
    {
      title: '回访人',
      dataIndex: 'returnVisitor',
      sorter: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      fixed: 'right',
      width: 60,
      render: (dataIndex, record) => (
        <div>
          <Popconfirm title="确认删除？" onConfirm={() => this.handleDelete(record)}>
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
    const respone = await deleteReturnVisitRecord(record);
    if (respone.error || respone.errors) {
      message.error('删除失败');
      return;
    }
    dataSource.splice(dataSource.indexOf(record), 1);
    message.success('删除成功');
    this.setState({ dataSource: JSON.parse(JSON.stringify(dataSource)) });
  };

  componentDidMount = async () => {
    const tempData = await getReturnVisitReocrd();
    if (tempData.error || tempData.errors) {
      message.error('失败，请重试');
      return;
    }
    let payload = tempData.data.returnVisitRecords;

    payload = payload.map(item => ({
      key: item.id,
      ...item,
    }));

    this.setState({ dataSource: payload });
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

  render() {
    const { selectedRows, dataSource } = this.state;
    return (
      <PageHeaderWrapper>
        <Card>
          <div className={styles.tableList}>
            <StandardTable
              scroll={{ x: 1200 }}
              selectedRows={selectedRows}
              dataSource={dataSource}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default returnVisitRecord;
