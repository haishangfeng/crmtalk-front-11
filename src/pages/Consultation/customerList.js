import React, { PureComponent } from 'react';
import {
  Card,
  Form,
  Button,
  Popconfirm,
  Input,
  Skeleton,
  Tooltip,
  Select,
  Modal,
  message,
  Tag,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import { formatMessage } from 'umi/locale';

import styles from './customerList.less';
import { getUsersDetail, deleteUser } from '@/services/apollo/apolloUser';
import formatTimeTommy from '@/util';
import colorsTag from '@/types';

const { Option } = Select;
class customerList extends PureComponent {
  state = {
    isLoading: false,
    selectedRows: [],
    dataSource: [],
  };

  // 表格字段们
  columns = [
    {
      title: formatMessage({ id: 'customerList.table.col1' }),
      dataIndex: 'name',
      sorter: true,
      width: 130,
      render: (dataIndex, record) => (
        <div style={{ display: 'flex' }}>
          <div style={{ marginRight: 5 }}>{dataIndex}</div>
          <Tag color="blue">{record.vipLevel ? record.vipLevel : '无'}</Tag>
        </div>
      ),
    },
    {
      title: formatMessage({ id: 'customerList.table.col2' }),
      dataIndex: 'sex',
      sorter: true,
      width: 80,
      render: dataIndex => (
        <div>
          {dataIndex === '0'
            ? formatMessage({ id: 'customerForm.form1000' })
            : formatMessage({ id: 'customerForm.form1001' })}
        </div>
      ),
    },
    {
      title: formatMessage({ id: 'customerList.table.col3' }),
      dataIndex: 'age',
      sorter: true,
      width: 80,
    },
    {
      title: formatMessage({ id: 'customerList.table.col4' }),
      dataIndex: 'where',
      sorter: true,
      width: 80,
    },
    {
      title: formatMessage({ id: 'customerList.table.col5' }),
      dataIndex: 'bigFrom',
      sorter: true,
      width: 120,
    },
    {
      title: formatMessage({ id: 'customerList.table.col6' }),
      dataIndex: 'mainProject',
      sorter: true,
      width: 120,
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
      title: formatMessage({ id: 'customerList.table.col7' }),
      dataIndex: 'firstAdvisoryWay',
      sorter: true,
      width: 100,
    },
    {
      title: formatMessage({ id: 'customerList.table.col8' }),
      dataIndex: 'consultationCount',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'customerList.table.col9' }),
      dataIndex: 'bookingCount',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'customerList.table.col10' }),
      dataIndex: 'hasBeenHospitalCount',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'customerList.table.col11' }),
      dataIndex: 'billsCount',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'customerList.table.col12' }),
      dataIndex: 'creator',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'customerList.table.col13' }),
      dataIndex: '',
      sorter: true,
      render: (dataIndex, record) => <div>{record.creator}</div>,
    },
    {
      title: formatMessage({ id: 'customerList.table.col14' }),
      dataIndex: 'createdAt',
      sorter: true,
      width: 170,
    },
    {
      title: formatMessage({ id: 'customerList.table.col15' }),
      dataIndex: 'operation',
      fixed: 'right',
      width: 210,
      render: (dataIndex, record) => (
        <div>
          <Tooltip
            title={formatMessage({ id: 'customerList.operation.operation1' })}
            mouseLeaveDelay={0}
          >
            <Button shape="circle" icon="edit" />
          </Tooltip>

          <Popconfirm
            title={formatMessage({ id: 'customerList.tip.tip1' })}
            onConfirm={() => this.handleDelete(record)}
          >
            <Tooltip
              title={formatMessage({ id: 'customerList.operation.operation2' })}
              mouseLeaveDelay={0}
            >
              <Button shape="circle" icon="delete" />
            </Tooltip>
          </Popconfirm>
          <Tooltip
            title={formatMessage({ id: 'customerList.operation.operation3' })}
            mouseLeaveDelay={0}
          >
            <Button shape="circle" icon="smile" />
          </Tooltip>
          <Tooltip
            title={formatMessage({ id: 'customerList.operation.operation4' })}
            mouseLeaveDelay={0}
          >
            <Button shape="circle" icon="book" />
          </Tooltip>
          <Tooltip
            title={formatMessage({ id: 'customerList.operation.operation5' })}
            mouseLeaveDelay={0}
          >
            <Button shape="circle" icon="bell" />
          </Tooltip>
          <Tooltip
            title={formatMessage({ id: 'customerList.operation.operation6' })}
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

  getIsCheck = () => this.dataSource.status;

  componentDidMount = async () => {
    this.setIsLoad(true);
    let tempData = await getUsersDetail();
    if (tempData.error || tempData.errors) {
      message.error(formatMessage({ id: 'customerList.tip.tip2' }));
      return;
    }
    tempData = tempData.data.usersDetailWDView.map(item => ({
      key: item.id,
      ...item,
      createdAt: formatTimeTommy(item.createdAt),
    }));

    tempData.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    this.setState({ dataSource: tempData });
    this.setIsLoad(false);
  };

  handleDelete = async record => {
    const { dataSource } = this.state;
    const res = await deleteUser(record);
    if (res.error || res.errors) {
      message.error(formatMessage({ id: 'customerList.tip.tip3' }));
      return;
    }
    message.success(formatMessage({ id: 'customerList.tip.tip4' }));
    dataSource.splice(dataSource.indexOf(record), 1);

    this.setState({ dataSource: JSON.parse(JSON.stringify(dataSource)) });
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
        <Modal width={320} onCancel={this.onClose}>
          <Form layout="inline" hideRequiredMark>
            <Form.Item label={formatMessage({ id: 'customerList.form.form1' })}>
              <Input placeholder={formatMessage({ id: 'customerList.form.form1' })} />
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'customerList.form.form2' })}>
              <Input
                type="number"
                placeholder={formatMessage({
                  id: 'customerList.form.form2',
                })}
              />
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'customerList.form.form3' })}>
              <Select
                placeholder={formatMessage({
                  id: 'customerList.form.form3',
                })}
                style={{ width: 180 }}
              >
                <Option value="男">{formatMessage({ id: 'customerList.form.form7' })}</Option>
                <Option value="女">{formatMessage({ id: 'customerList.form.form8' })}</Option>
              </Select>
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'customerList.form.form4' })}>
              <Input placeholder={formatMessage({ id: 'customerList.form.form4' })} />
            </Form.Item>

            <Button type="primary">{formatMessage({ id: 'customerList.form.form6' })}</Button>
            <Button type="danger" style={{ marginLeft: '40px' }}>
              {formatMessage({ id: 'customerList.form.form5' })}
            </Button>
          </Form>
        </Modal>
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
    );
  }
}

export default customerList;
