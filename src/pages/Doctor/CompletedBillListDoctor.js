import React, { PureComponent } from 'react';
import {
  Card,
  Tooltip,
  Button,
  Modal,
  message,
  Tag,
  Form,
  Row,
  Select,
  DatePicker,
  Input,
  InputNumber,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import { formatMessage } from 'umi/locale';

import TextArea from 'antd/lib/input/TextArea';
import styles from './CompletedBillListDoctor.less';
import { getBills, addSurgery, addTreatment } from '@/services/apollo/apolloTable';
import colorsTag, { billStatus } from '@/types';
import formatTimeTommy from '@/util';

const { Option } = Select;

class CompletedBillList extends PureComponent {
  state = {
    newData: {
      surgery: {
        doctor: '',
        reservationTime: '',
        surgeryName: '',
        surgeryPS: '',
      },
      treatment: {
        doctor: '',
        treatmentName: '',
        treatmentTimes: 1,
        currentTreatmentTimes: 0,
        treatmentPS: '',
      },
    },
    uiState: {
      modalVisiableSurgery: false,
      modalVisiableTreatment: false,
    },
    dataSource: [],
  };

  // 表格字段们
  columns = [
    {
      title: formatMessage({ id: 'yiwancheng.table.col1' }),
      dataIndex: 'userName',
      width: 320,
    },
    {
      title: formatMessage({ id: 'yiwancheng.table.col2' }),
      dataIndex: 'paymentStatus',
      width: 320,
      render: dataIndex => <div>{billStatus[dataIndex]}</div>,
    },
    {
      title: formatMessage({ id: 'yiwancheng.table.col3' }),
      dataIndex: 'totalPrice',
      width: 320,
    },
    {
      title: formatMessage({ id: 'yiwancheng.table.col4' }),
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
      title: formatMessage({ id: 'yiwancheng.table.col5' }),
      dataIndex: 'operation',
      fixed: 'right',
      width: 100,
      render: (dataIndex, record) => (
        <div>
          <Tooltip
            title={formatMessage({ id: 'yiwancheng.shoushuanpai.form1' })}
            mouseLeaveDelay={0}
          >
            <Button
              shape="circle"
              icon="heart"
              onClick={() => {
                const { uiState, newData } = this.state;
                newData.surgery.billId = record.id;
                this.setState({
                  uiState: { ...uiState, modalVisiableSurgery: true },
                  newData: { ...newData, ...record },
                });
              }}
            />
          </Tooltip>
          <Tooltip title={formatMessage({ id: 'yiwancheng.liaocheng.form1' })} mouseLeaveDelay={0}>
            <Button
              shape="circle"
              icon="smile"
              onClick={() => {
                const { uiState, newData } = this.state;
                newData.treatment.billId = record.id;
                this.setState({
                  uiState: { ...uiState, modalVisiableTreatment: true },
                  newData: { ...newData, ...record },
                });
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  componentDidMount = async () => {
    let tempData = await getBills();

    if (tempData.error || tempData.errors) {
      message.error('失败');
      return;
    }
    tempData = tempData.data.bills;

    tempData = tempData.map(item => ({
      key: item.id,
      userName: item.user.name,
      totalPrice: item.totalPrice,
      ...item,
    }));

    tempData = tempData.filter(ele => ele.isCompleted === 1);
    this.setState({ dataSource: tempData });
  };

  handleAddSurgery = async () => {
    const { newData } = this.state;
    const resp = await addSurgery(newData.surgery);
    if (resp.error || resp.errors) {
      message.error('手术安排失败');
      return;
    }
    message.success('手术安排成功');
    this.onModalCancel();
  };

  handleAddTreatment = async () => {
    const { newData } = this.state;
    const resp = await addTreatment(newData.treatment);
    if (resp.error || resp.errors) {
      message.error('疗程安排失败');
      return;
    }
    message.success('疗程安排成功');
    this.onModalCancel();
  };

  onModalCancel = () => {
    const { uiState } = this.state;
    this.setState({
      uiState: { ...uiState, modalVisiableTreatment: false, modalVisiableSurgery: false },
      newData: {
        surgery: {
          doctor: '',
          reservationTime: '',
          surgeryName: '',
          surgeryPS: '',
        },
        treatment: {
          doctor: '',
          treatmentName: '',
          treatmentTimes: 1,
          currentTreatmentTimes: 0,
          treatmentPS: '',
        },
      },
    });
  };

  render() {
    const { dataSource, uiState, newData } = this.state;
    return (
      <Card>
        <Modal
          title={formatMessage({ id: 'yiwancheng.shoushuanpai.form1' })}
          width={600}
          onCancel={this.onModalCancel}
          visible={uiState.modalVisiableSurgery}
          destroyOnClose
          onOk={this.handleAddSurgery}
        >
          <Form layout="inline">
            <Row>
              <Form.Item label={formatMessage({ id: 'yiwancheng.shoushuanpai.form2' })}>
                {newData.userName}
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'yiwancheng.shoushuanpai.form3' })}>
                {newData.user && newData.user.sex}
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'yiwancheng.shoushuanpai.form4' })}>
                {newData.user && newData.user.age}
              </Form.Item>
            </Row>
            <Row>
              <Form.Item label={formatMessage({ id: 'yiwancheng.shoushuanpai.form5' })}>
                <Select
                  style={{ width: 150 }}
                  onChange={value => {
                    newData.surgery.doctor = value;
                  }}
                >
                  <Option key="0" value="王刚">
                    王刚
                  </Option>
                  <Option key="1" value="华农">
                    华农
                  </Option>
                  <Option key="2" value="杨永信">
                    杨永信
                  </Option>
                </Select>
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'yiwancheng.shoushuanpai.form6' })}>
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  onChange={value => {
                    if (value) newData.surgery.reservationTime = formatTimeTommy(value);
                  }}
                />
              </Form.Item>
            </Row>
            <Row style={{ marginTop: 10 }}>
              <Form.Item label={formatMessage({ id: 'yiwancheng.shoushuanpai.form7' })}>
                <Input
                  onChange={e => {
                    newData.surgery.surgeryName = e.target.value;
                  }}
                />
              </Form.Item>
            </Row>
            <Row style={{ marginTop: 10 }}>
              <Form.Item label={formatMessage({ id: 'yiwancheng.shoushuanpai.form8' })}>
                <TextArea
                  rows="2"
                  style={{ width: 430 }}
                  onChange={e => {
                    newData.surgery.surgeryPS = e.target.value;
                  }}
                />
              </Form.Item>
            </Row>
          </Form>
        </Modal>
        <Modal
          title={formatMessage({ id: 'yiwancheng.liaocheng.form1' })}
          width={600}
          onCancel={this.onModalCancel}
          visible={uiState.modalVisiableTreatment}
          destroyOnClose
          onOk={this.handleAddTreatment}
        >
          <Form layout="inline">
            <Row>
              <Form.Item label={formatMessage({ id: 'yiwancheng.liaocheng.form2' })}>
                {newData.userName}
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'yiwancheng.liaocheng.form3' })}>
                {newData.user && newData.user.sex}
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'yiwancheng.liaocheng.form4' })}>
                {newData.user && newData.user.age}
              </Form.Item>
            </Row>
            <Row>
              <Form.Item label={formatMessage({ id: 'yiwancheng.liaocheng.form5' })}>
                <Select
                  style={{ width: 150 }}
                  onChange={value => {
                    newData.treatment.doctor = value;
                  }}
                >
                  <Option key="0" value="王刚">
                    王刚
                  </Option>
                  <Option key="1" value="华农">
                    华农
                  </Option>
                  <Option key="2" value="杨永信">
                    杨永信
                  </Option>
                </Select>
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'yiwancheng.liaocheng.form6' })}>
                <InputNumber
                  parser={value => value.replace(/[^0-9]/, '')}
                  min={1}
                  max={9999}
                  value={newData.treatment.treatmentTimes}
                  onChange={value => {
                    if (value) newData.treatment.treatmentTimes = value;
                    else newData.treatment.treatmentTimes = 1;
                    this.setState({ newData: { ...newData } });
                  }}
                />
              </Form.Item>
            </Row>
            <Row style={{ marginTop: 10 }}>
              <Form.Item label={formatMessage({ id: 'yiwancheng.liaocheng.form7' })}>
                <Input
                  onChange={e => {
                    newData.treatment.treatmentName = e.target.value;
                  }}
                />
              </Form.Item>
            </Row>
            <Row style={{ marginTop: 10 }}>
              <Form.Item label={formatMessage({ id: 'yiwancheng.liaocheng.form8' })}>
                <TextArea
                  rows="2"
                  style={{ width: 430 }}
                  onChange={e => {
                    newData.treatment.treatmentPS = e.target.value;
                  }}
                />
              </Form.Item>
            </Row>
          </Form>
        </Modal>
        <div className={styles.tableList}>
          <StandardTable selectedRows={[]} dataSource={dataSource} columns={this.columns} />
        </div>
      </Card>
    );
  }
}

export default CompletedBillList;
