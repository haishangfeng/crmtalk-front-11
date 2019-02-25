import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, Skeleton } from 'antd';
import StandardTable from '@/components/StandardTable';

import { formatMessage } from 'umi/locale';
import styles from './ConsultationList.less';
import { getConsultingRecordsTable } from '@/services/apollo/apolloTable';
import formatTimeTommy from '@/util';

@connect(({ rule, loading }) => ({
  rule,
  loading: loading.models.rule,
}))
// table list
@Form.create()
class ConsultationList extends PureComponent {
  state = {
    isLoading: false,
    selectedRows: [],
    dataSource: [],
  };

  // 表格字段们
  columns = [
    {
      title: formatMessage({ id: 'consulationList.table.col1' }),
      dataIndex: 'name',
      sorter: true,
      width: 130,
      fixed: 'left',
    },
    {
      title: formatMessage({ id: 'consulationList.table.col2' }),
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
      title: formatMessage({ id: 'consulationList.table.col3' }),
      dataIndex: 'age',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'consulationList.table.col4' }),
      dataIndex: 'advisoryWay',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'consulationList.table.col5' }),
      dataIndex: 'bigFrom',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'consulationList.table.col6' }),
      dataIndex: 'where',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'consulationList.table.col7' }),
      dataIndex: 'advisorySummary',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'consulationList.table.col8' }),
      dataIndex: 'consultant',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'consulationList.table.col9' }),
      dataIndex: 'createdAt',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'consulationList.table.col10' }),
      dataIndex: 'advisoryDetail',
      sorter: true,
    },
  ];

  setIsLoad = isLoad => {
    this.setState({ isLoading: isLoad });
  };

  componentDidMount = async () => {
    this.setIsLoad(true);
    let tempData = (await getConsultingRecordsTable()).data.consultingRecords;

    tempData = tempData.map(item => ({
      key: item.id,
      name: item.user.name,
      sex: item.user.sex,
      age: item.user.age,
      advisoryWay: item.advisoryWay,
      bigFrom: item.user.bigFrom,
      where: item.user.where,
      advisorySummary: item.advisorySummary,
      consultant: item.creator,
      createdAt: formatTimeTommy(item.createdAt),
      advisoryDetail: item.advisoryDetail,
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
              scroll={{ x: 1400 }}
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

export default ConsultationList;
