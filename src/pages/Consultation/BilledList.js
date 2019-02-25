import React, { PureComponent } from 'react';
import { Card, Skeleton, message, Tag } from 'antd';
import StandardTable from '@/components/StandardTable';
import { formatMessage } from 'umi/locale';

import styles from './BilledList.less';
import { getBills } from '@/services/apollo/apolloTable';
import colorsTag from '@/types';

class BilledList extends PureComponent {
  state = {
    isLoading: false,
    selectedRows: [],
    dataSource: [],
  };

  // 表格字段们
  columns = [
    {
      title: formatMessage({ id: 'yikaidanzixun.form1' }),
      dataIndex: 'user.name',
      sorter: true,
      fixed: 'left',
      width: 130,
    },
    {
      title: formatMessage({ id: 'yikaidanzixun.form2' }),
      dataIndex: 'user.vipLevel',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'yikaidanzixun.form3' }),
      dataIndex: 'user.sex',
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
      title: formatMessage({ id: 'yikaidanzixun.form4' }),
      dataIndex: 'user.age',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'yikaidanzixun.form5' }),
      dataIndex: 'user.bigFrom',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'yikaidanzixun.form6' }),
      dataIndex: 'bookingRecord.id',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'yikaidanzixun.form7' }),
      dataIndex: 'bookingRecord.toHospitalCate',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'yikaidanzixun.form8' }),
      dataIndex: 'bookingRecord.bookingStatus',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'yikaidanzixun.form9' }),
      dataIndex: 'billDetail',
      sorter: true,
      render: dataIndex => (
        <div>
          {dataIndex.map(ele => (
            <Tag color={colorsTag[ele.length % 10]} key={ele}>
              {ele}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: formatMessage({ id: 'yikaidanzixun.form10' }),
      dataIndex: 'paymentStatus',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'yikaidanzixun.form11' }),
      dataIndex: 'paid',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'yikaidanzixun.form12' }),
      dataIndex: 'bookingRecord.assistant',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'yikaidanzixun.form13' }),
      dataIndex: 'createdAt',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'yikaidanzixun.form14' }),
      dataIndex: 'creator',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'yikaidanzixun.form15' }),
      dataIndex: 'bookingRecord.time',
      sorter: true,
    },
  ];

  setIsLoad = isLoad => {
    this.setState({ isLoading: isLoad });
  };

  componentDidMount = async () => {
    this.setIsLoad(true);
    let tempData = await getBills();

    if (tempData.error || tempData.errors) {
      message.error('加载失败');
      return;
    }
    tempData = tempData.data.bills.map(item => ({
      key: item.id,
      ...item,
    }));

    this.setState({ dataSource: tempData });
    this.setIsLoad(false);
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  render() {
    const { selectedRows, dataSource, isLoading } = this.state;
    return (
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
    );
  }
}

export default BilledList;
