import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, Skeleton } from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './BilledList.less';
import { getBills } from '@/services/apollo/apolloTable';

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
class BilledList extends PureComponent {
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
      dataIndex: 'user.name',
      sorter: true,
      fixed: 'left',
      width: 130,
    },
    {
      title: 'VipLevel',
      dataIndex: 'user.vipLevel',
      sorter: true,
    },
    {
      title: '性别',
      dataIndex: 'user.sex',
      sorter: true,
    },
    {
      title: '年龄',
      dataIndex: 'user.age',
      sorter: true,
    },
    {
      title: '大来源',
      dataIndex: 'user.bigFrom',
      sorter: true,
    },
    {
      title: '预约号',
      dataIndex: 'reserveNum',
      sorter: true,
    },
    {
      title: '来院类别',
      dataIndex: 'toHospitalCate',
      sorter: true,
    },
    {
      title: '预约状态',
      dataIndex: 'reserveStatus',
      sorter: true,
    },
    {
      title: '开单项目',
      dataIndex: 'billedPrj',
      sorter: true,
    },
    {
      title: '付款类型',
      dataIndex: 'paymentType',
      sorter: true,
    },
    {
      title: '付款金额',
      dataIndex: 'paymentNum',
      sorter: true,
    },
    {
      title: '现场咨询师',
      dataIndex: 'onSiteConsultant',
      sorter: true,
    },
    {
      title: '开单时间',
      dataIndex: 'billedTime',
      sorter: true,
    },
    {
      title: '网店咨询员',
      dataIndex: 'onlineConsultant',
      sorter: true,
    },
    {
      title: '预约时间',
      dataIndex: 'reserveTime',
      sorter: true,
    },
  ];

  setIsLoad = isLoad => {
    this.setState({ isLoading: isLoad });
  };

  componentDidMount = async () => {
    this.setIsLoad(true);
    let tempData = await getBills();
    let index = -1;
    // eslint-disable-next-line arrow-body-style
    tempData = tempData.data.bills.map(item => {
      index += 1;
      return {
        key: index,
        ...item,
      };
    });
    console.log('tempdate', tempData);

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

  render() {
    const { selectedRows, dataSource, isLoading } = this.state;
    return (
      <PageHeaderWrapper>
        <Card>
          <div className={styles.tableList}>
            <Skeleton loading={isLoading}>
              <StandardTable
                scroll={{ x: 1600 }}
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

export default BilledList;
