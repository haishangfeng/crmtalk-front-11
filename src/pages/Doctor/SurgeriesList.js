/* eslint-disable prefer-destructuring */
import React, { PureComponent } from 'react';
import {
  Card,
  Tooltip,
  Popconfirm,
  Button,
  Modal,
  message,
  Row,
  Form,
  Input,
  Select,
  DatePicker,
  Tabs,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import { formatMessage } from 'umi/locale';

import TextArea from 'antd/lib/input/TextArea';
import styles from './SurgeriesList.less';
import { getSurgeries, editSurgery } from '@/services/apollo/apolloTable';
import formatTimeTommy from '@/util';

const { Option } = Select;
const TabPane = Tabs.TabPane;

class SurgeriesList extends PureComponent {
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
      title: formatMessage({ id: 'shoushuliebiao.table.col1' }),
      dataIndex: 'userName',
      width: 50,
    },
    {
      title: formatMessage({ id: 'shoushuliebiao.table.col2' }),
      dataIndex: 'userSex',
      width: 50,
      render: dataIndex => (
        <div>
          {dataIndex === '0'
            ? formatMessage({ id: 'customerForm.form1000' })
            : formatMessage({ id: 'customerForm.form1001' })}
        </div>
      ),
    },
    {
      title: formatMessage({ id: 'shoushuliebiao.table.col3' }),
      dataIndex: 'userAge',
      width: 50,
    },
    {
      title: formatMessage({ id: 'shoushuliebiao.table.col4' }),
      width: 50,
      dataIndex: 'surgeryName',
    },
    {
      title: formatMessage({ id: 'shoushuliebiao.table.col5' }),
      dataIndex: 'surgeryStatus',
      width: 50,
      render: dataIndex => <div>{formatMessage({ id: `types.surgeryStatus${dataIndex}` })}</div>,
    },
    {
      title: formatMessage({ id: 'shoushuliebiao.table.col6' }),
      width: 50,
      dataIndex: 'doctor',
    },
    {
      title: formatMessage({ id: 'shoushuliebiao.table.col7' }),
      width: 50,
      dataIndex: 'surgeryPS',
    },
    {
      title: formatMessage({ id: 'shoushuliebiao.table.col8' }),
      dataIndex: 'reservationTime',
      width: 50,
    },
    {
      title: formatMessage({ id: 'shoushuliebiao.table.col9' }),
      dataIndex: 'operation',
      width: 60,
      render: (dataIndex, record) =>
        record.surgeryStatus === 0 ? (
          <div>
            <Tooltip title={formatMessage({ id: 'shoushuliebiao.form' })}>
              <Button
                shape="circle"
                icon="edit"
                onClick={() => {
                  const { uiState } = this.state;
                  this.setState({
                    uiState: { ...uiState, modalVisiableEdit: true },
                    newData: { ...record },
                  });
                }}
              />
            </Tooltip>
            <Popconfirm
              title={formatMessage({ id: 'shoushuliebiao.anniu1' })}
              onConfirm={async () => {
                const { dataSource } = this.state;
                const newData = JSON.parse(JSON.stringify(record));
                newData.surgeryStatus = 1;
                const resp = await editSurgery(newData);
                if (resp.error || resp.errors) {
                  message.error('失败');
                  return;
                }
                message.success('更新成功');
                const data = dataSource.find(ele => ele.id === newData.id);
                data.surgeryStatus = 1;
                this.setState({ dataSource: JSON.parse(JSON.stringify(dataSource)) });
              }}
            >
              <Tooltip title={formatMessage({ id: 'shoushuliebiao.anniu4' })}>
                <Button shape="circle" icon="check" />
              </Tooltip>
            </Popconfirm>
            <Popconfirm
              title={formatMessage({ id: 'shoushuliebiao.anniu2' })}
              onConfirm={async () => {
                const { dataSource } = this.state;
                const newData = JSON.parse(JSON.stringify(record));
                newData.surgeryStatus = 2;
                const resp = await editSurgery(newData);
                if (resp.error || resp.errors) {
                  message.error('取消失败');
                  return;
                }
                message.success('取消成功');
                const data = dataSource.find(ele => ele.id === newData.id);
                data.surgeryStatus = 2;
                this.setState({ dataSource: JSON.parse(JSON.stringify(dataSource)) });
              }}
            >
              <Tooltip title={formatMessage({ id: 'shoushuliebiao.anniu3' })}>
                <Button shape="circle" icon="close" />
              </Tooltip>
            </Popconfirm>
          </div>
        ) : (
          <div>
            <Button shape="circle" icon="edit" disabled />
            <Button shape="circle" icon="check" disabled />
            <Button shape="circle" icon="close" disabled />
          </div>
        ),
    },
  ];

  componentDidMount = async () => {
    const tempData = await getSurgeries();
    if (tempData.error || tempData.errors) {
      message.error('失败，请重试');
      return;
    }
    let payload = tempData.data.surgeries;

    payload = payload.map(item => ({
      key: item.id,
      userName: item.bill.user.name,
      userSex: item.bill.user.sex,
      userAge: item.bill.user.age,
      ...item,
    }));

    this.setState({ dataSource: payload });
  };

  handleEdit = async () => {
    const { newData, dataSource, uiState } = this.state;
    if (newData.surgeryPS && newData.doctor && newData.reservationTime && newData.surgeryName) {
      const resp = await editSurgery(newData);
      if (resp.error || resp.errors) {
        message.error('失败');
        return;
      }
      message.success('修改成功');
      const data = dataSource.find(ele => ele.id === newData.id);
      data.surgeryPS = newData.surgeryPS;
      data.doctor = newData.doctor;
      data.reservationTime = newData.reservationTime;
      data.surgeryName = newData.surgeryName;
      this.setState({ dataSource });
      this.setState({ uiState: { ...uiState, modalVisiableEdit: false } });
    } else {
      message.error('信息不能为空');
    }
  };

  render() {
    const { dataSource, uiState, newData } = this.state;
    return (
      <Card>
        <Modal
          title={formatMessage({ id: 'shoushuliebiao.form' })}
          width={600}
          onCancel={() => {
            this.setState({ uiState: { ...uiState, modalVisiableEdit: false } });
          }}
          onOk={this.handleEdit}
          visible={uiState.modalVisiableEdit}
          destroyOnClose
        >
          <Form layout="inline">
            <Row>
              <Form.Item label={formatMessage({ id: 'shoushuliebiao.table.col1' })}>
                {newData.userName}
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'shoushuliebiao.table.col2' })}>
                {newData.bill && newData.bill.user.sex}
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'shoushuliebiao.table.col3' })}>
                {newData.bill && newData.bill.user.age}
              </Form.Item>
            </Row>
            <Row>
              <Form.Item label={formatMessage({ id: 'yiwancheng.shoushuanpai.form5' })}>
                <Select
                  defaultValue={newData.doctor}
                  style={{ width: 150 }}
                  onChange={value => {
                    newData.doctor = value;
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
                    if (value) newData.reservationTime = formatTimeTommy(value);
                  }}
                />
              </Form.Item>
            </Row>
            <Row style={{ marginTop: 10 }}>
              <Form.Item label={formatMessage({ id: 'yiwancheng.shoushuanpai.form7' })}>
                <Input
                  placeholder={newData.surgeryName}
                  onChange={e => {
                    newData.surgeryName = e.target.value;
                  }}
                />
              </Form.Item>
            </Row>
            <Row style={{ marginTop: 10 }}>
              <Form.Item label={formatMessage({ id: 'yiwancheng.shoushuanpai.form8' })}>
                <TextArea
                  rows="2"
                  placeholder={newData.surgeryPS}
                  style={{ width: 430 }}
                  onChange={e => {
                    newData.surgeryPS = e.target.value;
                  }}
                />
              </Form.Item>
            </Row>
          </Form>
        </Modal>

        <Tabs
          onChange={activeKey => this.setState({ uiState: { ...uiState, opButton: activeKey } })}
        >
          <TabPane
            tab={`${formatMessage({ id: `types.surgeryStatus${0}` })}(${
              dataSource.filter(ele => ele.surgeryStatus === 0).length
            })`}
            key="1"
          >
            <div className={styles.tableList}>
              <StandardTable
                selectedRows={[]}
                dataSource={dataSource.filter(ele => ele.surgeryStatus === 0)}
                columns={this.columns}
                scroll={{ x: 1000 }}
              />
            </div>
          </TabPane>
          <TabPane
            tab={`${formatMessage({ id: `types.surgeryStatus${1}` })}(${
              dataSource.filter(ele => ele.surgeryStatus === 1).length
            })`}
            key="2"
          >
            <div className={styles.tableList}>
              <StandardTable
                selectedRows={[]}
                dataSource={dataSource.filter(ele => ele.surgeryStatus === 1)}
                columns={this.columns}
                scroll={{ x: 1000 }}
              />
            </div>
          </TabPane>
          <TabPane
            tab={`${formatMessage({ id: `types.surgeryStatus${2}` })}(${
              dataSource.filter(ele => ele.surgeryStatus === 2).length
            })`}
            key="3"
          >
            <div className={styles.tableList}>
              <StandardTable
                selectedRows={[]}
                dataSource={dataSource.filter(ele => ele.surgeryStatus === 2)}
                columns={this.columns}
                scroll={{ x: 1000 }}
              />
            </div>
          </TabPane>
        </Tabs>
      </Card>
    );
  }
}

export default SurgeriesList;
