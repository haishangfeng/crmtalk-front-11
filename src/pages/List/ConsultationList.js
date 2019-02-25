import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form } from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './ConsultationList.less';
import { getConsultingRecordsTable } from '@/services/apollo/apolloTable';

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
class ConsultationList extends PureComponent {
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
      width: 130,
      fixed: 'left',
    },
    {
      title: '性别',
      dataIndex: 'sex',
      sorter: true,
    },
    {
      title: '年龄',
      dataIndex: 'age',
      sorter: true,
    },
    {
      title: '咨询方式',
      dataIndex: 'advisoryWay',
      sorter: true,
    },
    {
      title: '来源',
      dataIndex: 'bigFrom',
      sorter: true,
    },
    {
      title: '地区',
      dataIndex: 'where',
      sorter: true,
    },
    {
      title: '咨询小结',
      dataIndex: 'advisorySummary',
      sorter: true,
    },
    {
      title: '咨询员',
      dataIndex: 'consultant',
      sorter: true,
    },
    {
      title: '咨询时间',
      dataIndex: 'createdAt',
      sorter: true,
    },
    {
      title: '查看对话',
      dataIndex: 'advisoryDetail',
      sorter: true,
    },
  ];

  componentDidMount = async () => {
    let tempData = (await getConsultingRecordsTable()).data.consultingRecords;

    // eslint-disable-next-line arrow-body-style
    tempData = tempData.map(item => {
      return {
        key: item.id,
        name: item.user.name,
        sex: item.user.sex,
        age: item.user.age,
        advisoryWay: item.advisoryWay,
        bigFrom: item.user.bigFrom,
        where: item.user.where,
        advisorySummary: item.advisoryWay,
        consultant: item.creator,
        createdAt: item.createdAt,
        advisoryDetail: item.advisoryDetail,
      };
    });
    this.setState({ dataSource: tempData });
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
              scroll={{ x: 1400 }}
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

export default ConsultationList;
