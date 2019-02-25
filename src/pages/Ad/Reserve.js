import React, { PureComponent } from 'react';
import { Card, Skeleton } from 'antd';
import StandardTable from '@/components/StandardTable';

import { formatMessage } from 'umi/locale';
import styles from './Reserve.less';
import { getBookingRecordsTable } from '@/services/apollo/apolloTable';
import formatTimeTommy from '@/util';

class Reserve extends PureComponent {
  state = {
    isLoading: false,
    selectedRows: [],
    dataSource: [
      {
        key: 0,
        name: '1',
        vipLevel: '',
        sex: '1',
        age: '1',
        where: '',
        bigFrom: '',
        advisoryWay: '',
        mainProject: '',
        id: '',
        toHospitalCate: '',
        reserveStatus: '',
        time: '',
        consultant: '',
        createdAt: '',
        updateTime: '',
      },
    ],
  };

  // 表格字段们
  columns = [
    {
      title: formatMessage({ id: 'reserveList.table.col1' }),
      dataIndex: 'user.name',
      sorter: true,
      width: 150,
      fixed: 'left',
    },
    {
      title: formatMessage({ id: 'reserveList.table.col2' }),
      dataIndex: 'user.vipLevel',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'reserveList.table.col3' }),
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
      title: formatMessage({ id: 'reserveList.table.col4' }),
      dataIndex: 'user.age',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'reserveList.table.col5' }),
      dataIndex: 'user.where',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'reserveList.table.col6' }),
      dataIndex: 'user.bigFrom',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'reserveList.table.col7' }),
      dataIndex: 'user.mainProject',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'reserveList.table.col8' }),
      dataIndex: 'id',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'reserveList.table.col9' }),
      dataIndex: 'toHospitalCate',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'reserveList.table.col10' }),
      dataIndex: 'bookingStatus',
      sorter: true,
      render: dataIndex =>
        dataIndex !== undefined ? (
          <div>{formatMessage({ id: `types.bookingStatus${dataIndex}` })}</div>
        ) : null,
    },
    {
      title: formatMessage({ id: 'reserveList.table.col11' }),
      dataIndex: 'time',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'reserveList.table.col12' }),
      dataIndex: 'creator',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'reserveList.table.col13' }),
      dataIndex: 'createdAt',
      sorter: true,
    },
  ];

  setIsLoad = isLoad => {
    this.setState({ isLoading: isLoad });
  };

  componentDidMount = async () => {
    this.setIsLoad(true);
    let tempData = await getBookingRecordsTable();
    tempData = tempData.data.bookingRecords;

    tempData = tempData.map(item => ({
      key: item.id,
      ...item,
      time: formatTimeTommy(item.time),
      createdAt: formatTimeTommy(item.createdAt),
    }));
    console.log(tempData);

    tempData.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
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
