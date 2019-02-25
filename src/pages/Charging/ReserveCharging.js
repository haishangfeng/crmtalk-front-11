/* eslint-disable prefer-destructuring */
/* eslint-disable consistent-return */
import React, { PureComponent } from 'react';
import {
  notification,
  Card,
  Tooltip,
  Button,
  Modal,
  message,
  Tag,
  Tabs,
  Skeleton,
  Icon,
  Table,
  Row,
  Form,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import { formatMessage } from 'umi/locale';

import styles from './ReserveCharging.less';
import { getPayments, pay, payback, getBillsDetailsByBillId } from '@/services/apollo/apolloTable';
import colorsTag, { paymentTypes } from '@/types';

const TabPane = Tabs.TabPane;

const openNotification = (name, isFailed, msg) => {
  notification.open({
    message: `${msg}${formatMessage({ id: 'reservedCharging.no1' })}`,
    duration: null,
    description: `${formatMessage({ id: 'reservedCharging.no2' })}:${name}, ${
      isFailed
        ? `${msg}${formatMessage({ id: 'reservedCharging.no3' })}`
        : `${msg}${formatMessage({ id: 'reservedCharging.no4' })}`
    }`,
    icon: (
      <Icon
        type={isFailed ? 'frown-o' : 'smile'}
        style={{ color: isFailed ? '#FF0000' : '#229954' }}
      />
    ),
  });
};
class ReservedCharging extends PureComponent {
  state = {
    newData: {},
    uiState: {
      modalVisiablePay: false,
      modalVisiablePayBack: false,
      modalSkeletonVisiable: true,
    },
    dataSource: [],
  };

  columns = [
    {
      title: formatMessage({ id: 'reservedCharging.table.col1' }),
      dataIndex: 'id',
      width: 230,
    },
    {
      title: formatMessage({ id: 'reservedCharging.table.col2' }),
      dataIndex: 'userName',
      width: 230,
    },
    {
      title: formatMessage({ id: 'reservedCharging.table.col3' }),
      dataIndex: 'paymentType',
      width: 230,
      render: (dataIndex, record) => (
        <Tag color={colorsTag[record.confirmed ? 5 : 0]}>{paymentTypes[record.paymentType]}</Tag>
      ),
    },
    {
      title: formatMessage({ id: 'reservedCharging.table.col4' }),
      dataIndex: 'balance',
      width: 260,
    },
    {
      title: formatMessage({ id: 'reservedCharging.table.col5' }),
      dataIndex: 'shouldPay',
      width: 260,
    },
    {
      title: formatMessage({ id: 'reservedCharging.table.col6' }),
      dataIndex: 'totalPrice',
      width: 230,
    },
    {
      title: formatMessage({ id: 'reservedCharging.table.col7' }),
      dataIndex: 'billDetail',
      width: 230,
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
      title: formatMessage({ id: 'reservedCharging.table.col8' }),
      dataIndex: 'creator',
      width: 230,
    },
    {
      title: formatMessage({ id: 'reservedCharging.table.col9' }),
      dataIndex: 'createdAt',
      width: 230,
    },
    {
      title: formatMessage({ id: 'reservedCharging.table.col10' }),
      dataIndex: 'operation',
      fixed: 'right',
      width: 50,
      render: (dataIndex, record) => (
        <div style={{ display: 'flex' }}>
          {record.paymentType !== 5 && record.paymentType !== 6 && (
            <Tooltip title={formatMessage({ id: 'reservedCharging.queren.form' })}>
              <Button
                disabled={record.confirmed}
                shape="circle"
                icon="money-collect"
                onClick={async () => {
                  const { uiState } = this.state;
                  uiState.modalVisiablePay = true;
                  const temp = JSON.parse(JSON.stringify(record));
                  this.setState({ uiState: { ...uiState } });
                  const bill = record.bill;
                  const resp = await getBillsDetailsByBillId(bill);
                  if (resp.error || resp.errors) {
                    message.error('读取订单失败');
                    return;
                  }
                  uiState.modalSkeletonVisiable = false;
                  temp.billMoreDetail = resp.data.billsDetaildsByBillId.map(ele => ({
                    ...ele,
                    key: ele.id,
                  }));

                  this.setState({ uiState: { ...uiState } });
                  this.setState({ newData: temp });
                }}
              />
            </Tooltip>
          )}
          {record.paymentType > 3 && (
            <Tooltip title="确认退费">
              <Button
                disabled={record.confirmed}
                shape="circle"
                icon="frown"
                onClick={() => {
                  const { uiState } = this.state;
                  this.setState({ newData: JSON.parse(JSON.stringify(record)) });
                  this.setState({ uiState: { ...uiState, modalVisiablePayBack: true } });
                }}
              />
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  detailsTableCol = [
    {
      title: formatMessage({ id: 'reservedCharging.queren.form1' }),
      dataIndex: 'project',
    },
    {
      width: 100,
      title: formatMessage({ id: 'reservedCharging.queren.form2' }),
      dataIndex: 'unitPrice',
    },

    {
      width: 100,
      title: formatMessage({ id: 'reservedCharging.queren.form3' }),
      dataIndex: 'amount',
    },
    {
      title: formatMessage({ id: 'reservedCharging.queren.form4' }),
      dataIndex: 'quantifier',
    },
    {
      title: formatMessage({ id: 'reservedCharging.queren.form5' }),
      dataIndex: 'total',
      render: (dataIndex, record) => <div>{record.unitPrice * record.amount}</div>,
    },
  ];

  componentDidMount = async () => {
    const tempData = await getPayments();
    if (tempData.error || tempData.errors) {
      message.error('失败，请重试');
      return;
    }
    let payload = tempData.data.payments;

    payload = payload.map(item => ({
      key: item.id,
      ...item,
      userName: item.bill.user.name,
      totalPrice: item.bill.totalPrice,
      billDetail:
        item.paymentType === 0
          ? [formatMessage({ id: 'reservedCharging.queren.form10' })]
          : item.bill.billDetail,
    }));

    console.log(payload);

    this.setState({ dataSource: payload });
  };

  handlePay = async () => {
    const { uiState, newData, dataSource } = this.state;

    newData.paymentWay = 1;
    const resp = await pay(newData);

    if (resp.error || resp.errors) {
      openNotification(
        newData.userName,
        true,
        formatMessage({ id: 'reservedCharging.queren.form11' })
      );
      return;
    }
    openNotification(
      newData.userName,
      false,
      formatMessage({ id: 'reservedCharging.queren.form11' })
    );
    const data = dataSource.find(ele => ele.id === resp.data.pay.id);
    data.confirmed = true;
    this.setState({
      uiState: { ...uiState, modalVisiablePay: false },
      dataSource: JSON.parse(JSON.stringify(dataSource)),
    });
  };

  handlePayBack = async () => {
    const { uiState, newData, dataSource } = this.state;

    const resp = await payback(newData);

    if (resp.error || resp.errors) {
      openNotification(
        newData.userName,
        true,
        formatMessage({ id: 'reservedCharging.queren.form12' })
      );
      return;
    }
    openNotification(
      newData.userName,
      false,
      formatMessage({ id: 'reservedCharging.queren.form12' })
    );
    const data = dataSource.find(ele => ele.id === resp.data.payback.id);
    data.confirmed = true;
    this.setState({
      uiState: { ...uiState, modalVisiablePayBack: false },
      dataSource: JSON.parse(JSON.stringify(dataSource)),
    });
  };

  render() {
    const { dataSource, uiState, newData } = this.state;
    return (
      <Card>
        <Modal
          title={formatMessage({ id: 'reservedCharging.queren.form' })}
          width={900}
          onCancel={() => {
            this.setState({
              uiState: { ...uiState, modalVisiablePay: false, modalSkeletonVisiable: true },
            });
          }}
          visible={uiState.modalVisiablePay}
          destroyOnClose
          onOk={this.handlePay}
        >
          <Skeleton loading={uiState.modalSkeletonVisiable} active>
            <Table
              columns={this.detailsTableCol}
              bordered
              dataSource={newData.billMoreDetail}
              size="small"
            />

            <Form layout="inline">
              <Row>
                <Form.Item label={formatMessage({ id: 'reservedCharging.queren.form6' })}>
                  {newData.userName}
                </Form.Item>
                <Form.Item label={formatMessage({ id: 'reservedCharging.queren.form7' })}>
                  <Tag color={colorsTag[0]}>{paymentTypes[newData.paymentType]}</Tag>
                </Form.Item>
                <Form.Item label={formatMessage({ id: 'reservedCharging.queren.form8' })}>
                  {newData.totalPrice}
                </Form.Item>
                <Form.Item label={formatMessage({ id: 'reservedCharging.queren.form9' })}>
                  <h4 style={{ color: '#FFC300' }}>{newData.shouldPay}</h4>
                </Form.Item>
              </Row>
            </Form>
          </Skeleton>
        </Modal>

        <Modal
          title={formatMessage({ id: 'reservedCharging.tuifei.form' })}
          width={500}
          onCancel={() => {
            this.setState({ uiState: { ...uiState, modalVisiablePayBack: false } });
          }}
          visible={uiState.modalVisiablePayBack}
          destroyOnClose
          onOk={this.handlePayBack}
        >
          <Skeleton loading={!uiState.modalSkeletonVisiable} active>
            <div />
          </Skeleton>
        </Modal>
        <Tabs>
          <TabPane
            tab={`${formatMessage({ id: 'reservedCharging.tab1' })}(${
              dataSource.filter(ele => !ele.confirmed).length
            })`}
            key="1"
          >
            <div className={styles.tableList}>
              <StandardTable
                scroll={{ x: 1200 }}
                selectedRows={[]}
                dataSource={dataSource.filter(ele => !ele.confirmed)}
                columns={this.columns}
              />
            </div>
          </TabPane>
          <TabPane
            tab={`${formatMessage({ id: 'reservedCharging.tab2' })}(${
              dataSource.filter(ele => ele.confirmed).length
            })`}
            key="2"
          >
            <div className={styles.tableList}>
              <StandardTable
                scroll={{ x: 1200 }}
                selectedRows={[]}
                dataSource={dataSource.filter(ele => ele.confirmed)}
                columns={this.columns}
              />
            </div>
          </TabPane>
          <TabPane
            tab={`${formatMessage({ id: 'reservedCharging.tab3' })}(${dataSource.length})`}
            key="3"
          >
            <Card>
              <div className={styles.tableList}>
                <StandardTable
                  scroll={{ x: 1200 }}
                  selectedRows={[]}
                  dataSource={dataSource}
                  columns={this.columns}
                />
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    );
  }
}

export default ReservedCharging;
