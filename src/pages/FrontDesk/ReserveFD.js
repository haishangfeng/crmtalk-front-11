import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Card,
  Form,
  Tooltip,
  Popconfirm,
  Button,
  Modal,
  Select,
  message,
  Col,
  Row,
  Input,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';

import styles from './ReserveFD.less';
import { updateBookingRecord, getBookingRecordsTable } from '@/services/apollo/apolloTable';
import { getUserMgr } from '@/services/userMgr';
import formatTimeTommy from '@/util';

const { Option } = Select;
@connect(({ rule, loading }) => ({
  rule,
  loading: loading.models.rule,
}))
@Form.create()
class ReservationFrontDesk extends PureComponent {
  state = {
    newData: {},
    uiState: {
      modalVisiableEdit: false,
    },
    dataSource: [],
  };

  // 表格字段们
  columns = [
    {
      title: formatMessage({ id: 'reservefd.form1' }),
      dataIndex: 'name',
      width: 230,
    },
    {
      title: formatMessage({ id: 'reservefd.form2' }),
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
      title: formatMessage({ id: 'reservefd.form3' }),
      dataIndex: 'bookingStatus',
      width: 230,
      render: dataIndex => <div>{formatMessage({ id: `types.bookingStatus${dataIndex}` })}</div>,
    },
    {
      title: formatMessage({ id: 'reservefd.form4' }),
      dataIndex: 'creator',
      width: 230,
    },
    {
      title: formatMessage({ id: 'reservefd.form5' }),
      dataIndex: 'time',
      width: 230,
    },
    {
      title: formatMessage({ id: 'reservefd.form6' }),
      dataIndex: 'operation',
      fixed: 'right',
      width: 80,
      render: (dataIndex, record) => (
        <div>
          <Tooltip title={formatMessage({ id: 'reservefd.form7' })} mouseLeaveDelay={0}>
            <Button
              shape="circle"
              icon="user-add"
              onClick={() => {
                const { uiState } = this.state;
                this.setState({
                  uiState: { ...uiState, modalVisiableEdit: true },
                  newData: { ...record },
                });
              }}
            />
          </Tooltip>
          <Popconfirm title={formatMessage({ id: 'reservefd.form9' })}>
            <Tooltip title={formatMessage({ id: 'reservefd.form10' })} mouseLeaveDelay={0}>
              <Button shape="circle" icon="delete" />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  componentDidMount = async () => {
    let tempData = (await getBookingRecordsTable()).data.bookingRecords;

    tempData = tempData.map(item => ({
      key: item.id,
      ...item.user,
      ...item,
      time: formatTimeTommy(item.time),
    }));
    tempData = tempData.filter(ele => ele.bookingStatus === 0);

    this.setState({ dataSource: tempData });
  };

  handleDeliver = async () => {
    const { newData, dataSource, uiState } = this.state;
    if (typeof newData.assistant === 'undefined') {
      message.error('信息不能为空');
      return;
    }
    newData.bookingStatus = 1;
    newData.frontDesk = getUserMgr().name;
    newData.frontDeskId = getUserMgr().userId;

    const respone = await updateBookingRecord(newData);
    if (respone.error || respone.errors) {
      message.error('分诊失败');
      return;
    }
    message.success('分诊成功');
    dataSource.splice(dataSource.findIndex(ele => ele.id === newData.id), 1);
    this.setState({
      dataSource: JSON.parse(JSON.stringify(dataSource)),
      uiState: { ...uiState, modalVisiableEdit: false },
    });
  };

  render() {
    const { dataSource, uiState, newData } = this.state;
    return (
      <PageHeaderWrapper>
        <Modal
          title={formatMessage({ id: 'reservefd.form7' })}
          width={800}
          onCancel={() => {
            this.setState({ uiState: { ...uiState, modalVisiableEdit: false } });
          }}
          visible={uiState.modalVisiableEdit}
          destroyOnClose
          onOk={this.handleDeliver}
        >
          <Form layout="inline" hideRequiredMark>
            <Row gutter={16}>
              <Col lg={6} md={12} sm={24}>
                <Input
                  value={newData.name}
                  onChange={e => {
                    newData.name = e.target.value;
                    this.setState({ newData: { ...newData } });
                  }}
                />
              </Col>
              <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
                <Select
                  defaultValue={
                    newData.sex === '0'
                      ? formatMessage({ id: 'customerForm.form1000' })
                      : formatMessage({ id: 'customerForm.form1001' })
                  }
                  onChange={(value, option) => {
                    dataSource.sex = option.key;
                  }}
                >
                  <Option value={formatMessage({ id: 'customerForm.form1000' })} key="0">
                    {formatMessage({ id: 'customerForm.form1000' })}
                  </Option>
                  <Option value={formatMessage({ id: 'customerForm.form1001' })} key="1">
                    {formatMessage({ id: 'customerForm.form1001' })}
                  </Option>
                </Select>
              </Col>
              <Col xl={{ span: 6, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
                <Input
                  type="number"
                  value={newData.age}
                  onChange={e => {
                    newData.age = e.target.value;
                    this.setState({ newData: { ...newData } });
                  }}
                />
              </Col>
            </Row>
          </Form>
          <Form.Item label={formatMessage({ id: 'reservefd.form8' })}>
            <Select
              style={{ width: 180 }}
              onChange={(value, option) => {
                newData.assistant = option.key;
              }}
            >
              <Option key="李宁" value="李宁">
                李宁
              </Option>
              <Option key="王星" value="王星">
                王星
              </Option>
              <Option key="乐高" value="乐高">
                乐高
              </Option>
            </Select>
          </Form.Item>
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

export default ReservationFrontDesk;
