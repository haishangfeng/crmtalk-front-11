/* eslint-disable prefer-destructuring */
/* eslint-disable consistent-return */
import React, { PureComponent } from 'react';
import {
  Card,
  Tooltip,
  Button,
  Modal,
  message,
  Tag,
  Tabs,
  Skeleton,
  Table,
  Form,
  Select,
  Alert,
  Row,
  InputNumber,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import { formatMessage } from 'umi/locale';

import TextArea from 'antd/lib/input/TextArea';
import styles from './BilledListAssistant.less';
import { getBills, getBillsDetailsByBillId, addPayment } from '@/services/apollo/apolloTable';
import colorsTag, { billStatus } from '@/types';
import formatTimeTommy from '@/util';

const TabPane = Tabs.TabPane;
const { Option } = Select;

class BilledListAssistant extends PureComponent {
  state = {
    billData: {
      newPayment: { shouldPay: 0, customPay: 0, usedBalance: 0, paymentType: '', paymentPS: '' },
    },
    uiState: {
      modalVisiableBilling: false,
      modalSkeletonVisiable: true,
      modalPayBackVisiable: false,
      customPayDisable: true,
      customPayBackVisible: false,
    },
    dataSource: [],
  };

  columns = [
    {
      title: formatMessage({ id: 'xiaofeidanliebiao.table.col1' }),
      dataIndex: 'id',
      width: 230,
    },
    {
      title: formatMessage({ id: 'xiaofeidanliebiao.table.col2' }),
      dataIndex: 'userName',
      width: 230,
    },
    {
      title: formatMessage({ id: 'xiaofeidanliebiao.table.col3' }),
      dataIndex: 'paymentStatus',
      width: 300,
      render: dataIndex => <div>{billStatus[dataIndex]}</div>,
    },
    {
      title: formatMessage({ id: 'xiaofeidanliebiao.table.col4' }),
      dataIndex: 'billDetail',
      width: 230,
      render: (dataIndex, record) => (
        <div>
          {dataIndex.map((ele, index) => (
            <Tooltip
              title={
                record.details
                  ? `成交单价：${record.details[index].unitPrice} ，
                  数量：${record.details[index].amount} ，
                  单位：${record.details[index].quantifier}，
                  小结：${record.details[index].unitPrice * record.details[index].amount}`
                  : ''
              }
              key={ele}
            >
              <Tag color={colorsTag[ele.length % 10]} key={ele}>
                {ele}
              </Tag>
            </Tooltip>
          ))}
        </div>
      ),
    },
    {
      title: formatMessage({ id: 'xiaofeidanliebiao.table.col5' }),
      dataIndex: 'paid',
      width: 230,
    },
    {
      title: formatMessage({ id: 'xiaofeidanliebiao.table.col6' }),
      dataIndex: 'totalPrice',
      width: 230,
    },
    {
      title: formatMessage({ id: 'xiaofeidanliebiao.table.col7' }),
      dataIndex: '',
      width: 230,
      render: (dataIndex, record) => <div>{record.totalPrice - record.paid}</div>,
    },
    {
      title: formatMessage({ id: 'xiaofeidanliebiao.table.col8' }),
      dataIndex: 'creator',
      width: 230,
    },
    {
      title: formatMessage({ id: 'xiaofeidanliebiao.table.col9' }),
      dataIndex: 'createdAt',
      width: 400,
    },
    {
      title: formatMessage({ id: 'xiaofeidanliebiao.table.col10' }),
      fixed: 'right',
      dataIndex: 'operation',
      width: 115,
      render: (dataIndex, record) => (
        <div>
          <Tooltip title={formatMessage({ id: 'xiaofeidanliebiao.bujiao' })}>
            <Button
              shape="circle"
              icon="file-sync"
              disabled={record.paymentStatus === 0 || record.isCompleted > 0}
              onClick={() => {
                const { uiState } = this.state;
                this.setState({
                  billData: {
                    ...JSON.parse(JSON.stringify(record)),
                    newPayment: {
                      shouldPay: 0,
                      customPay: 0,
                      usedBalance: 0,
                      paymentType: '',
                      paymentPS: '',
                    },
                  },
                });
                this.setState({ uiState: { ...uiState, modalVisiableBilling: true } });
              }}
            />
          </Tooltip>
          <Tooltip title={formatMessage({ id: 'xiaofeidanliebiao.tuikuan' })}>
            <Button
              shape="circle"
              icon="frown"
              disabled={record.isCompleted === 2 || !(record.paid - record.freezingBalance > 0)}
              onClick={() => {
                const { uiState } = this.state;
                this.setState({
                  billData: {
                    ...JSON.parse(JSON.stringify(record)),
                    newPayment: {
                      shouldPay: 0,
                      customPay: 0,
                      usedBalance: 0,
                      paymentType: '',
                      paymentPS: '',
                    },
                  },
                });
                this.setState({
                  uiState: { ...uiState, modalPayBackVisiable: true, customPayBackVisible: false },
                });
              }}
            />
          </Tooltip>
          <Tooltip title={formatMessage({ id: 'xiaofeidanliebiao.shanchu' })}>
            <Button shape="circle" icon="delete" disabled />
          </Tooltip>
        </div>
      ),
    },
  ];

  detailsTableCol = [
    {
      title: formatMessage({ id: 'xiaofeidanliebiao.bujiao.form1' }),
      dataIndex: 'project',
    },
    {
      width: 100,
      title: formatMessage({ id: 'xiaofeidanliebiao.bujiao.form2' }),
      dataIndex: 'unitPrice',
    },

    {
      width: 100,
      title: formatMessage({ id: 'xiaofeidanliebiao.bujiao.form3' }),
      dataIndex: 'amount',
    },
    {
      title: formatMessage({ id: 'xiaofeidanliebiao.bujiao.form4' }),
      dataIndex: 'quantifier',
    },
    {
      title: formatMessage({ id: 'xiaofeidanliebiao.bujiao.form5' }),
      dataIndex: 'total',
    },
  ];

  loadBillDetailAsync = async dataSource => {
    const { uiState } = this.state;
    const promises = dataSource.map(async ele => {
      const res = await getBillsDetailsByBillId(ele);
      if (res.error || res.errors) {
        message.error('失败，请重试');
        return;
      }
      const details = res.data.billsDetaildsByBillId.map(item => ({
        ...item,
        key: item.id,
        total: item.amount * item.unitPrice, // 小结
      }));
      return {
        ...ele,
        details,
      };
    });
    const newDataSource = await Promise.all(promises);

    uiState.modalSkeletonVisiable = false;
    this.setState({ dataSource: newDataSource, uiState });
  };

  componentDidMount = async () => {
    const tempData = await getBills();
    if (tempData.error || tempData.errors) {
      message.error('失败，请重试');
      return;
    }
    let payload = tempData.data.bills;

    payload = payload.map(item => ({
      key: item.id,
      userName: item.user.name,
      balanceLeft: item.user.flowBalance + item.user.freezingBalance,
      ...item,
      createdAt: formatTimeTommy(item.createdAt),
    }));
    payload.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    this.setState({ dataSource: payload });
    this.loadBillDetailAsync(payload);
  };

  handleBilling = async () => {
    const { billData } = this.state;
    if (billData.newPayment.shouldPay === 0 && billData.newPayment.usedBalance === 0) {
      message.error('本单金额为0');
      return;
    }
    if (billData.newPayment.paymentType === '') {
      message.error('付款类型不能为空');
      return;
    }
    const payload = { ...billData.newPayment, billId: billData.id };
    const res = await addPayment(payload);
    if (res.error || res.errors) {
      message.error('失败，请重试');
      return;
    }
    message.success('开单成功');
    this.setState({
      uiState: {
        modalVisiableBilling: false,
      },
      billData: {
        newPayment: { shouldPay: 0, customPay: 0, usedBalance: 0, paymentType: '', paymentPS: '' },
      },
    });
  };

  handlePayback = async () => {
    const { billData } = this.state;
    if (billData.newPayment.shouldPay === 0 && billData.newPayment.usedBalance === 0) {
      message.error('本单金额为0');
      return;
    }
    if (billData.newPayment.paymentType === '') {
      message.error('退款类型不能为空');
      return;
    }
    const payload = { ...billData.newPayment, billId: billData.id };
    console.log(payload);

    const res = await addPayment(payload);
    if (res.error || res.errors) {
      message.error('失败，请重试');
      return;
    }
    message.success('开单成功');
    this.setState({
      uiState: {
        modalVisiableBilling: false,
      },
      billData: {
        newPayment: { shouldPay: 0, customPay: 0, usedBalance: 0, paymentType: '', paymentPS: '' },
      },
    });
  };

  render() {
    const { dataSource, uiState, billData } = this.state;
    return (
      <Card>
        <Modal
          title={formatMessage({ id: 'xiaofeidanliebiao.bujiao' })}
          width={1000}
          onCancel={() => {
            this.setState({ uiState: { ...uiState, modalVisiableBilling: false } });
          }}
          visible={uiState.modalVisiableBilling}
          maskClosable={false}
          destroyOnClose
          onOk={this.handleBilling}
        >
          <Skeleton loading={uiState.modalSkeletonVisiable} active>
            <div>
              <Table
                columns={this.detailsTableCol}
                bordered
                dataSource={billData.details}
                size="small"
              />
              <Alert
                message={
                  billData.isOnlyDepositBill
                    ? `${formatMessage({ id: 'xiaofeidanliebiao.bujiao.form6' })}(${
                        billData.deposit
                      }),${formatMessage({ id: 'xiaofeidanliebiao.bujiao.form7' })}`
                    : formatMessage({ id: 'xiaofeidanliebiao.bujiao.form18' })
                }
                type="info"
                showIcon
              />

              <Form layout="inline">
                <Row>
                  <Form.Item label={formatMessage({ id: 'xiaofeidanliebiao.bujiao.form8' })}>
                    {billData.userName}
                  </Form.Item>
                  <Form.Item label={formatMessage({ id: 'xiaofeidanliebiao.bujiao.form9' })}>
                    {billData.discount}%
                  </Form.Item>
                  <Form.Item label={formatMessage({ id: 'xiaofeidanliebiao.bujiao.form10' })}>
                    {billData.totalPrice}
                  </Form.Item>
                  <Form.Item label={formatMessage({ id: 'xiaofeidanliebiao.bujiao.form11' })}>
                    {billData.paid}
                  </Form.Item>
                </Row>
                <Row>
                  <Form.Item label={formatMessage({ id: 'xiaofeidanliebiao.bujiao.form12' })}>
                    <Select
                      style={{ width: 150 }}
                      onChange={(value, option) => {
                        billData.newPayment.paymentType = value;
                        billData.newPayment.usedBalance = 0;
                        if (option.key === '2') {
                          uiState.customPayDisable = false;
                          billData.newPayment.shouldPay = 0;
                          billData.newPayment.customPay = 0;
                        } else {
                          billData.newPayment.shouldPay = billData.totalPrice - billData.paid;
                          uiState.customPayDisable = true;
                        }
                        this.setState({ uiState: { ...uiState }, billData: { ...billData } });
                      }}
                    >
                      {billData.paymentStatus === 2 && (
                        <Option key="0" value={3}>
                          {formatMessage({ id: 'types.paymentTypes3' })}
                        </Option>
                      )}
                      {billData.paymentStatus === 1 && (
                        <Option key="1" value={4}>
                          {formatMessage({ id: 'types.paymentTypes4' })}
                        </Option>
                      )}
                      <Option key="2" value={1}>
                        {formatMessage({ id: 'types.paymentTypes1' })}
                      </Option>
                    </Select>
                  </Form.Item>
                  {billData.newPayment.paymentType === 1 && (
                    <Form.Item label={formatMessage({ id: 'xiaofeidanliebiao.bujiao.form13' })}>
                      <InputNumber
                        parser={value => value.replace(/[^0-9]/, '')}
                        min={0}
                        max={billData.totalPrice - billData.paid}
                        value={billData.newPayment.customPay}
                        onChange={value => {
                          billData.newPayment.usedBalance = 0;
                          if (value) {
                            billData.newPayment.customPay = value;
                            billData.newPayment.shouldPay = value;
                          } else {
                            billData.newPayment.customPay = 0;
                            billData.newPayment.shouldPay = 0;
                          }
                          this.setState({ billData: { ...billData } });
                        }}
                      />
                    </Form.Item>
                  )}
                  <Form.Item />
                  <Form.Item
                    label={`${formatMessage({ id: 'xiaofeidanliebiao.bujiao.form14' })}：${
                      billData.balanceLeft
                    }, ${formatMessage({ id: 'xiaofeidanliebiao.bujiao.form15' })}`}
                  >
                    <InputNumber
                      disabled={billData.newPayment.shouldPay === 0}
                      parser={value => value.replace(/[^0-9]/, '')}
                      min={0}
                      max={billData.balanceLeft}
                      value={billData.newPayment.usedBalance}
                      onChange={value => {
                        if (value) {
                          billData.newPayment.usedBalance = value;
                        } else {
                          billData.newPayment.usedBalance = 0;
                        }
                        if (
                          billData.newPayment.paymentType === 4 ||
                          billData.newPayment.paymentType === 3
                        ) {
                          billData.newPayment.shouldPay =
                            billData.totalPrice - billData.paid - billData.newPayment.usedBalance;
                        } else {
                          billData.newPayment.shouldPay =
                            billData.newPayment.customPay - billData.newPayment.usedBalance;
                        }
                        this.setState({ billData: { ...billData } });
                      }}
                    />
                  </Form.Item>
                </Row>
                <Row>
                  <Form.Item label={formatMessage({ id: 'xiaofeidanliebiao.bujiao.form16' })}>
                    <TextArea
                      rows="1"
                      onChange={e => {
                        billData.newPayment.paymentPS = e.target.value;
                      }}
                    />
                  </Form.Item>
                </Row>
                <Row>
                  <Form.Item>
                    {formatMessage({ id: 'xiaofeidanliebiao.bujiao.form17' })}:
                    {billData.newPayment.shouldPay}
                  </Form.Item>
                </Row>
              </Form>
            </div>
          </Skeleton>
        </Modal>

        <Modal
          title={formatMessage({ id: 'xiaofeidanliebiao.tuikuan' })}
          width={1000}
          onCancel={() => {
            this.setState({ uiState: { ...uiState, modalPayBackVisiable: false } });
          }}
          visible={uiState.modalPayBackVisiable}
          maskClosable={false}
          destroyOnClose
          onOk={this.handlePayback}
        >
          <Form layout="inline">
            <Row>
              <Form.Item label={formatMessage({ id: 'xiaofeidanliebiao.tuikuan.form1' })}>
                {billData.userName}
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'xiaofeidanliebiao.tuikuan.form2' })}>
                {billData.paid - billData.freezingBalance}
              </Form.Item>
            </Row>
            <Row>
              <Form.Item label={formatMessage({ id: 'xiaofeidanliebiao.tuikuan.form3' })}>
                <Select
                  style={{ width: 150 }}
                  onChange={(value, option) => {
                    billData.newPayment.paymentType = value;
                    billData.newPayment.usedBalance = 0;
                    if (option.key === '1') {
                      uiState.customPayBackVisible = true;
                      billData.newPayment.shouldPay = 0;
                      billData.newPayment.customPay = 0;
                    }
                    if (option.key === '0') {
                      billData.newPayment.shouldPay = billData.paid - billData.freezingBalance;
                      uiState.customPayBackVisible = false;
                    }
                    this.setState({ uiState: { ...uiState }, billData: { ...billData } });
                  }}
                >
                  <Option key="0" value={5}>
                    {formatMessage({ id: 'types.paymentTypes5' })}
                  </Option>
                  <Option key="1" value={6}>
                    {formatMessage({ id: 'types.paymentTypes6' })}
                  </Option>
                </Select>
              </Form.Item>
              {uiState.customPayBackVisible && (
                <Form.Item label={formatMessage({ id: 'xiaofeidanliebiao.tuikuan.form6' })}>
                  <InputNumber
                    parser={value => value.replace(/[^0-9]/, '')}
                    min={0}
                    max={billData.paid - billData.freezingBalance - 1}
                    value={billData.newPayment.customPay}
                    onChange={value => {
                      billData.newPayment.usedBalance = 0;
                      if (value) {
                        billData.newPayment.customPay = value;
                        billData.newPayment.shouldPay = value;
                      } else {
                        billData.newPayment.customPay = 0;
                        billData.newPayment.shouldPay = 0;
                      }
                      this.setState({ billData: { ...billData } });
                    }}
                  />
                </Form.Item>
              )}
            </Row>
            <Form.Item label={formatMessage({ id: 'xiaofeidanliebiao.tuikuan.form4' })}>
              <InputNumber
                parser={value => value.replace(/[^0-9]/, '')}
                min={0}
                max={
                  billData.newPayment.paymentType === 5
                    ? billData.paid - billData.freezingBalance
                    : billData.newPayment.customPay
                }
                value={billData.newPayment.usedBalance}
                onChange={value => {
                  if (value) {
                    billData.newPayment.usedBalance = value;
                    if (billData.newPayment.paymentType === 5) {
                      billData.newPayment.shouldPay =
                        billData.paid - billData.freezingBalance - value;
                    } else {
                      billData.newPayment.shouldPay = billData.newPayment.customPay - value;
                    }
                  } else {
                    billData.newPayment.usedBalance = 0;
                    if (billData.newPayment.paymentType === 5) {
                      billData.newPayment.shouldPay = billData.paid - billData.freezingBalance;
                    } else {
                      billData.newPayment.shouldPay = billData.newPayment.customPay;
                    }
                  }
                  this.setState({ billData: { ...billData } });
                }}
              />
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'xiaofeidanliebiao.tuikuan.form5' })}>
              {billData.newPayment.shouldPay}
            </Form.Item>
          </Form>
        </Modal>
        {/**
          Tab
         */}
        <Tabs>
          <TabPane
            tab={`${formatMessage({ id: 'xiaofeidanliebiao.tab1' })}(${
              dataSource.filter(ele => ele.isCompleted === 0).length
            })`}
            key="1"
          >
            <div className={styles.tableList}>
              <StandardTable
                scroll={{ x: 1600 }}
                selectedRows={[]}
                dataSource={dataSource.filter(ele => ele.isCompleted === 0)}
                columns={this.columns}
              />
            </div>
          </TabPane>
          <TabPane
            tab={`${formatMessage({ id: 'xiaofeidanliebiao.tab2' })}(${
              dataSource.filter(ele => ele.isCompleted === 1).length
            })`}
            key="2"
          >
            <div className={styles.tableList}>
              <StandardTable
                scroll={{ x: 1600 }}
                selectedRows={[]}
                dataSource={dataSource.filter(ele => ele.isCompleted === 1)}
                columns={this.columns}
              />
            </div>
          </TabPane>
          <TabPane
            tab={`${formatMessage({ id: 'xiaofeidanliebiao.tab3' })}(${
              dataSource.filter(ele => ele.isCompleted === 2).length
            })`}
            key="3"
          >
            <div className={styles.tableList}>
              <StandardTable
                scroll={{ x: 1600 }}
                selectedRows={[]}
                dataSource={dataSource.filter(ele => ele.isCompleted === 2)}
                columns={this.columns}
              />
            </div>
          </TabPane>
          <TabPane
            tab={`${formatMessage({ id: 'xiaofeidanliebiao.tab4' })}(${dataSource.length})`}
            key="4"
          >
            <div className={styles.tableList}>
              <StandardTable
                scroll={{ x: 1600 }}
                selectedRows={[]}
                dataSource={dataSource}
                columns={this.columns}
              />
            </div>
          </TabPane>
        </Tabs>
      </Card>
    );
  }
}

export default BilledListAssistant;
