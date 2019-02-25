/* eslint-disable no-param-reassign */
/* eslint-disable react/no-access-state-in-setstate */
import React, { PureComponent } from 'react';
import {
  Card,
  Form,
  Tooltip,
  Popconfirm,
  Button,
  Modal,
  Select,
  message,
  Input,
  Table,
  InputNumber,
  Row,
  Tag,
  Popover,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';

import Search from 'antd/lib/input/Search';
import styles from './ReservationWaitingBilling.less';
import {
  updateBookingRecord,
  getBookingRecordsTable,
  addBill,
} from '@/services/apollo/apolloTable';
import dictionariesMgr from '@/services/dictionariesMgr';

const { Option } = Select;

class ReservationWaitingBilling extends PureComponent {
  state = {
    newData: {},
    uiState: {
      modalVisiableEdit: false,
      shouldPayDisable: true,
    },
    billData: {
      userId: 0,
      balanceLeft: 0,
      paymentType: 2,
      totalPrice: 0,
      discount: 100,
      discountPrice: 0,
      customPrice: 0,
      deposit: 0,
      usedBalance: 0,
      shouldPay: 0,
      billDetail: [],
    },
    dataSource: [],
    tagsFromDictionary: [],
  };

  // 表格字段们
  columns = [
    {
      title: `${formatMessage({ id: 'kaidan.table.col1' })}`,
      dataIndex: 'name',
      width: 230,
    },
    {
      title: `${formatMessage({ id: 'kaidan.table.col2' })}`,
      dataIndex: 'sex',
      width: 230,
      render: dataIndex => (
        <div>
          {dataIndex === '0'
            ? formatMessage({ id: 'customerForm.form1000' })
            : formatMessage({ id: 'customerForm.form1001' })}
        </div>
      ),
    },
    {
      title: `${formatMessage({ id: 'kaidan.table.col3' })}`,
      dataIndex: 'bookingStatus',
      width: 230,
      render: dataIndex => <div>{formatMessage({ id: `types.bookingStatus${dataIndex}` })}</div>,
    },
    {
      title: `${formatMessage({ id: 'kaidan.table.col4' })}`,
      dataIndex: 'assistant',
      width: 230,
    },
    {
      title: `${formatMessage({ id: 'kaidan.table.col5' })}`,
      dataIndex: 'operation',
      width: 100,
      render: (dataIndex, record) => (
        <div>
          <Tooltip title="开单">
            <Button
              shape="circle"
              icon="align-left"
              onClick={() => {
                const { uiState } = this.state;
                this.setState({
                  uiState: { ...uiState, modalVisiableEdit: true },
                  newData: { ...record },
                  billData: {
                    bookingRecordId: record.id,
                    balanceLeft: record.user.flowBalance + record.user.freezingBalance,
                    userId: record.user.id,
                    paymentType: 2,
                    discount: 100,
                    deposit: 0,
                    usedBalance: 0,
                    customPrice: 0,
                    totalPrice: 0,
                    shouldPay: 0,
                    billDetail: [],
                  },
                });
              }}
            />
          </Tooltip>
          <Popconfirm title="确认删除？">
            <Tooltip title="删除">
              <Button shape="circle" icon="delete" />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // 开单的表单中的东西
  projectTableCol = [
    {
      title: `${formatMessage({ id: 'kaidan.form3' })}`,
      dataIndex: 'project',
      width: 300,
    },
    {
      width: 100,
      title: `${formatMessage({ id: 'kaidan.form6' })}`,
      dataIndex: 'unitPrice',
      render: (dataIndex, record) => (
        <InputNumber
          value={record.unitPrice}
          style={{ width: 100 }}
          min={0}
          parser={value => value.replace(/[^0-9]/, '')}
          onChange={value => {
            const { billData } = this.state;
            if (value) {
              record.unitPrice = value;
            } else {
              record.unitPrice = 0;
            }
            record.price = record.unitPrice * record.amount;

            let tmpTotalPrice = 0;
            billData.billDetail.forEach(item => {
              tmpTotalPrice += item.price;
            });

            if (billData.paymentType === 2)
              billData.shouldPay = (tmpTotalPrice * billData.discount) / 100;
            billData.totalPrice = tmpTotalPrice;
            billData.discountPrice = (tmpTotalPrice * billData.discount) / 100;
            this.setState({ billData: { ...billData } });
          }}
        />
      ),
    },

    {
      width: 100,
      title: `${formatMessage({ id: 'kaidan.form7' })}`,
      dataIndex: 'amount',
      render: (dataIndex, record) => (
        <InputNumber
          value={record.amount}
          min={0}
          parser={value => value.replace(/[^0-9]/, '')}
          style={{ width: 100 }}
          onChange={value => {
            const { billData } = this.state;
            if (value) {
              record.amount = value;
            } else record.amount = 0;
            record.price = record.unitPrice * record.amount;

            let tmpTotalPrice = 0;
            billData.billDetail.forEach(item => {
              tmpTotalPrice += item.price;
            });

            if (billData.paymentType === 2)
              billData.shouldPay = (tmpTotalPrice * billData.discount) / 100;
            billData.totalPrice = tmpTotalPrice;
            billData.discountPrice = (tmpTotalPrice * billData.discount) / 100;
            this.setState({ billData: { ...billData } });
          }}
        />
      ),
    },
    {
      width: 100,
      title: `${formatMessage({ id: 'kaidan.form8' })}`,
      dataIndex: 'quantifier',
    },
    {
      width: 100,
      title: `${formatMessage({ id: 'kaidan.form9' })}`,
      dataIndex: 'price',
    },
    {
      width: 200,
      title: `${formatMessage({ id: 'kaidan.form10' })}`,
      dataIndex: 'operation',
      render: (dataIndex, record) => (
        <div>
          <Tooltip title="上移">
            <Button shape="circle" icon="arrow-up" disabled />
          </Tooltip>
          <Tooltip title="下移">
            <Button shape="circle" icon="arrow-down" disabled />
          </Tooltip>
          <Popconfirm
            title="确认删除？"
            onConfirm={() => {
              const { billData, tagsFromDictionary } = this.state;
              tagsFromDictionary.find(ele => ele.key === record.key).disable = false;

              billData.billDetail.splice(billData.billDetail.indexOf(record), 1);

              this.setState({ billData: { ...billData } });

              let tmpTotalPrice = 0;
              billData.billDetail.forEach(item => {
                tmpTotalPrice += item.price;
              });

              if (billData.paymentType === 2)
                billData.shouldPay = (tmpTotalPrice * billData.discount) / 100;
              billData.totalPrice = tmpTotalPrice;
              billData.discountPrice = (tmpTotalPrice * billData.discount) / 100;
              this.setState({ billData: { ...billData } });
            }}
          >
            <Tooltip title="删除">
              <Button shape="circle" icon="delete" />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  componentDidMount = async () => {
    let tempData = await getBookingRecordsTable();
    if (tempData.error || tempData.errors) {
      message.error('失败');
      return;
    }
    tempData = tempData.data.bookingRecords;
    tempData = tempData.map(item => ({
      key: item.id,
      name: item.user.name,
      sex: item.user.sex,
      ...item,
    }));
    tempData = tempData.filter(ele => ele.bookingStatus === 2);
    console.log(tempData);

    const dictionary = await dictionariesMgr.getProductions();
    let dictionaryLevel2 = [];
    dictionary.forEach(ele => {
      // eslint-disable-next-line no-param-reassign
      const children = dictionariesMgr.getChildren(ele.id, ele.itemName);
      children.sort((a, b) => a.sortIndex - b.sortIndex);
      dictionaryLevel2 = dictionaryLevel2.concat(children);
    });
    dictionaryLevel2 = dictionaryLevel2.map(ele => {
      const ps = ele.ps.split(',');
      return {
        key: ele.id,
        id: ele.id,
        project: ele.itemName,
        parent: ele.itemParentName,
        unitPrice: parseInt(ps[0], 10),
        quantifier: ps[1],
        regularName: ps[2],
        editable: Boolean(ps[3]),
        amount: 1,
        price: parseInt(ps[0], 10),
        disable: false,
        ...ele,
      };
    });
    this.setState({ dataSource: tempData, tagsFromDictionary: dictionaryLevel2 });
  };

  handleTagClick = tagChoose => {
    const { billData } = this.state;
    const tag = JSON.parse(JSON.stringify(tagChoose));
    tagChoose.disable = true;
    billData.billDetail.push(tag);

    this.setState({ billData: { ...billData } });

    let tmpTotalPrice = 0;
    billData.billDetail.forEach(item => {
      tmpTotalPrice += item.price;
    });

    if (billData.paymentType === 2) billData.shouldPay = (tmpTotalPrice * billData.discount) / 100;
    billData.totalPrice = tmpTotalPrice;
    billData.discountPrice = (tmpTotalPrice * billData.discount) / 100;
    this.setState({ billData: { ...billData } });
  };

  handleDeliver = async () => {
    const { newData, dataSource } = this.state;

    newData.bookingStatus = 3;
    const respone = await updateBookingRecord(newData);
    if (respone.error || respone.errors) {
      message.error('开单成功');
      return;
    }
    message.success('开单成功');
    dataSource.splice(dataSource.findIndex(ele => ele.id === newData.id), 1);
    this.setState({
      dataSource: JSON.parse(JSON.stringify(dataSource)),
    });
  };

  handleOk = async () => {
    const { billData, tagsFromDictionary } = this.state;
    let payload = { ...billData };
    if (payload.shouldPay === 0 && payload.usedBalance === 0) {
      message.error('本单金额为0');
      return;
    }
    if (payload.paymentType === 0) {
      payload = {
        ...payload,
        isOnlyDepositBill: true,
        depositReadyIn: payload.shouldPay + payload.usedBalance,
      };
    } else {
      payload = { ...payload, isOnlyDepositBill: false, depositReadyIn: 0 };
    }

    const result = await addBill(payload);
    if (result.error || result.errors) {
      message.error('添加失败');
      return;
    }
    message.success('添加成功');

    // 更改预约状态;
    // await this.handleDeliver();

    tagsFromDictionary.forEach(ele => {
      ele.disable = false;
    });
    this.setState({
      uiState: {
        modalVisiableEdit: false,
        shouldPayDisable: true,
      },
      billData: {},
    });
  };

  render() {
    const { dataSource, uiState, newData, billData, tagsFromDictionary } = this.state;

    return (
      <PageHeaderWrapper>
        <Modal
          style={{ top: 20 }}
          destroyOnClose
          maskClosable={false}
          title={formatMessage({ id: 'kaidan.form1' })}
          width={1050}
          onCancel={() => {
            tagsFromDictionary.forEach(ele => {
              ele.disable = false;
            });
            this.setState({
              uiState: {
                modalVisiableEdit: false,
                shouldPayDisable: true,
              },
              billData: {},
            });
          }}
          visible={uiState.modalVisiableEdit}
          onOk={this.handleOk}
        >
          <Form layout="inline">
            <Form.Item label={formatMessage({ id: 'kaidan.form2' })}>
              <Input placeholder={newData.name} disabled />
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'kaidan.form3' })}>
              <Search enterButton={formatMessage({ id: 'kaidan.form18' })} style={{ width: 300 }} />
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'kaidan.form4' })}>
              <Search
                enterButton={formatMessage({ id: 'kaidan.form19' })}
                style={{ width: 300 }}
                placeholder={formatMessage({ id: 'kaidan.form20' })}
              />
            </Form.Item>
            <Row>
              <Form.Item>
                {tagsFromDictionary.map(tag => (
                  <Tag
                    key={tag.id}
                    visible={!tag.disable}
                    onClick={() => this.handleTagClick(tag)}
                    color="#2db7f5"
                  >
                    <Popover
                      title={tag.project}
                      content={`${formatMessage({ id: 'kaidan.form21' })}:
                    ${tag.parent}  ${formatMessage({ id: 'kaidan.form6' })}:
                    ${tag.unitPrice}  ${formatMessage({ id: 'kaidan.form8' })}:${tag.quantifier}`}
                    >
                      {tag.project}
                    </Popover>
                  </Tag>
                ))}
              </Form.Item>
            </Row>

            <Table
              size="small"
              // scroll={{ y: 300 }}
              pagination={{ pageSize: 3 }}
              columns={this.projectTableCol}
              bordered
              style={{ marginTop: 20 }}
              dataSource={billData.billDetail}
            />
            <Row style={{ marginTop: 20 }}>
              <Form.Item label={formatMessage({ id: 'kaidan.form11' })}>
                <Input disabled value={billData.totalPrice} />
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'kaidan.form12' })}>
                <InputNumber
                  formatter={value => `% ${value}`}
                  placeholder="100"
                  parser={value => value.replace(/[^0-9]/, '')}
                  value={billData.discount}
                  onChange={value => {
                    if (value) {
                      billData.discount = value;
                      const newDiscountPrice = Math.floor(
                        (billData.totalPrice * billData.discount) / 100
                      );
                      billData.discountPrice = newDiscountPrice;
                      if (billData.paymentType === 2) billData.shouldPay = newDiscountPrice;
                    } else {
                      billData.discount = 0;
                      billData.discountPrice = 0;
                      if (billData.paymentType === 2) billData.shouldPay = 0;
                    }
                    this.setState({ billData: { ...billData } });
                  }}
                />
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'kaidan.form13' })}>
                <Input disabled value={billData.discountPrice} />
              </Form.Item>
            </Row>
            <Row>
              <Form.Item label={formatMessage({ id: 'kaidan.form14' })}>
                <Select
                  defaultValue={formatMessage({ id: 'types.paymentTypes2' })}
                  style={{ width: 150 }}
                  onChange={(value, option) => {
                    if (option.key !== '0') {
                      uiState.shouldPayDisable = false;
                      this.setState({
                        billData: {
                          ...billData,
                          customPrice: 0,
                          usedBalance: 0,
                          shouldPay: 0,
                          paymentType: value,
                        },
                      });
                    } else {
                      uiState.shouldPayDisable = true;
                      this.setState({
                        billData: {
                          ...billData,
                          shouldPay: billData.discountPrice,
                          usedBalance: 0,
                          paymentType: value,
                        },
                      });
                    }
                  }}
                >
                  <Option key="0" value={2}>
                    {formatMessage({ id: 'types.paymentTypes2' })}
                  </Option>
                  <Option key="1" value={0}>
                    {formatMessage({ id: 'types.paymentTypes0' })}
                  </Option>
                  <Option key="2" value={1}>
                    {formatMessage({ id: 'types.paymentTypes1' })}
                  </Option>
                </Select>
              </Form.Item>
              {billData.paymentType !== 2 && (
                <Form.Item label={formatMessage({ id: 'kaidan.form17' })}>
                  <InputNumber
                    disabled={uiState.shouldPayDisable}
                    parser={value => value.replace(/[^0-9]/, '')}
                    min={0}
                    max={billData.discountPrice}
                    value={billData.customPrice}
                    onChange={value => {
                      billData.usedBalance = 0;
                      if (value) {
                        billData.customPrice = value;
                        billData.shouldPay = value;
                      } else {
                        billData.customPrice = 0;
                        billData.shouldPay = 0;
                      }
                      this.setState({ billData: { ...billData } });
                    }}
                  />
                </Form.Item>
              )}
            </Row>
            <Row>
              <Form.Item
                label={`${formatMessage({ id: 'kaidan.form15' })}${billData.balanceLeft}`}
              />
              <Form.Item>
                <InputNumber
                  parser={value => value.replace(/[^0-9]/, '')}
                  min={0}
                  disabled={billData.shouldPay === 0}
                  max={billData.balanceLeft}
                  value={billData.usedBalance}
                  onChange={value => {
                    if (value) {
                      billData.usedBalance = value;
                    } else {
                      billData.usedBalance = 0;
                    }
                    if (billData.paymentType === 2) {
                      billData.shouldPay = billData.discountPrice - billData.usedBalance;
                    } else {
                      billData.shouldPay = billData.customPrice - billData.usedBalance;
                    }
                    this.setState({ billData: { ...billData } });
                  }}
                />
              </Form.Item>
            </Row>
            <Form.Item label={formatMessage({ id: 'kaidan.form16' })}>
              <h4>{billData.shouldPay}</h4>
            </Form.Item>
          </Form>
        </Modal>
        <Card>
          <div className={styles.tableList}>
            <StandardTable selectedRows={[]} dataSource={dataSource} columns={this.columns} />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ReservationWaitingBilling;
