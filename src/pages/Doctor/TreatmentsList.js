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
  InputNumber,
  Tabs,
} from 'antd';
import StandardTable from '@/components/StandardTable';

import TextArea from 'antd/lib/input/TextArea';
import { formatMessage } from 'umi/locale';

import styles from './SurgeriesList.less';
import { getTreatments, editTreatment, opTreatment } from '@/services/apollo/apolloTable';

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

  columns = [
    {
      title: formatMessage({ id: 'liaocheng.table.col1' }),
      dataIndex: 'userName',
      width: 50,
    },
    {
      title: formatMessage({ id: 'liaocheng.table.col2' }),
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
      title: formatMessage({ id: 'liaocheng.table.col3' }),
      dataIndex: 'userAge',
      width: 50,
    },
    {
      title: formatMessage({ id: 'liaocheng.table.col4' }),
      width: 50,
      dataIndex: 'doctor',
    },
    {
      title: formatMessage({ id: 'liaocheng.table.col5' }),
      width: 50,
      dataIndex: 'treatmentName',
    },
    {
      title: formatMessage({ id: 'liaocheng.table.col6' }),
      width: 50,
      dataIndex: 'treatmentTimes',
    },
    {
      title: formatMessage({ id: 'liaocheng.table.col7' }),
      width: 60,
      dataIndex: 'currentTreatmentTimes',
    },
    {
      title: formatMessage({ id: 'liaocheng.table.col8' }),
      dataIndex: 'treatmentStatus',
      width: 60,
      render: dataIndex => <div>{formatMessage({ id: `types.treatmentStatus${dataIndex}` })}</div>,
    },
    {
      title: formatMessage({ id: 'liaocheng.table.col9' }),
      width: 50,
      dataIndex: 'treatmentPS',
    },
    {
      title: formatMessage({ id: 'liaocheng.table.col10' }),
      dataIndex: 'operation',
      width: 80,
      render: (dataIndex, record) => (
        <div>
          <Tooltip title={formatMessage({ id: 'liaocheng.form' })}>
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
            title={formatMessage({ id: 'liaocheng.button2' })}
            onConfirm={async () => {
              const { dataSource } = this.state;
              const newData = JSON.parse(JSON.stringify(record));
              const resp = await opTreatment(newData);
              if (resp.error || resp.errors) {
                message.error('执行失败');
                return;
              }
              message.success('执行成功');
              const payload = resp.data.opTreatment;
              const data = dataSource.find(ele => ele.id === newData.id);
              data.treatmentStatus = payload.treatmentStatus;
              data.currentTreatmentTimes = payload.currentTreatmentTimes;
              this.setState({ dataSource: JSON.parse(JSON.stringify(dataSource)) });
            }}
          >
            <Tooltip title={formatMessage({ id: 'liaocheng.button1' })}>
              <Button shape="circle" icon="check" />
            </Tooltip>
          </Popconfirm>
          <Popconfirm
            title={formatMessage({ id: 'liaocheng.button22' })}
            onConfirm={async () => {
              const { dataSource } = this.state;
              const newData = JSON.parse(JSON.stringify(record));
              newData.treatmentStatus = 3;
              const resp = await editTreatment(newData);
              if (resp.error || resp.errors) {
                message.error('取消失败');
                return;
              }
              message.success('取消成功');
              const data = dataSource.find(ele => ele.id === newData.id);
              data.treatmentStatus = 3;
              this.setState({ dataSource: JSON.parse(JSON.stringify(dataSource)) });
            }}
          >
            <Tooltip title={formatMessage({ id: 'liaocheng.button3' })}>
              <Button shape="circle" icon="close" />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  componentDidMount = async () => {
    const tempData = await getTreatments();
    if (tempData.error || tempData.errors) {
      message.error('失败，请重试');
      return;
    }
    let payload = tempData.data.treatments;

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
    if (newData.treatmentName && newData.doctor && newData.treatmentPS && newData.treatmentTimes) {
      const resp = await editTreatment(newData);
      if (resp.error || resp.errors) {
        message.error('失败');
        return;
      }
      message.success('修改成功');
      const data = dataSource.find(ele => ele.id === newData.id);
      data.doctor = newData.doctor;
      data.treatmentName = newData.treatmentName;
      data.treatmentPS = newData.treatmentPS;
      data.treatmentTimes = newData.treatmentTimes;
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
          title={formatMessage({ id: 'liaocheng.form' })}
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
              <Form.Item label={formatMessage({ id: 'liaocheng.table.col1' })}>
                {newData.userName}
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'liaocheng.table.col2' })}>
                {newData.bill && newData.bill.user.sex}
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'liaocheng.table.col3' })}>
                {newData.bill && newData.bill.user.age}
              </Form.Item>
            </Row>
            <Row>
              <Form.Item label={formatMessage({ id: 'yiwancheng.liaocheng.form5' })}>
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
            </Row>
            <Row style={{ marginTop: 10 }}>
              <Form.Item label={formatMessage({ id: 'yiwancheng.liaocheng.form7' })}>
                <Input
                  placeholder={newData.treatmentName}
                  onChange={e => {
                    newData.treatmentName = e.target.value;
                  }}
                />
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'yiwancheng.liaocheng.form6' })}>
                <InputNumber
                  parser={value => value.replace(/[^0-9]/, '')}
                  min={1}
                  max={9999}
                  value={newData.treatmentTimes}
                  onChange={value => {
                    if (value) newData.treatmentTimes = value;
                    else newData.treatmentTimes = 1;
                    this.setState({ newData: { ...newData } });
                  }}
                />
              </Form.Item>
            </Row>
            <Row style={{ marginTop: 10 }}>
              <Form.Item label={formatMessage({ id: 'yiwancheng.liaocheng.form8' })}>
                <TextArea
                  rows="2"
                  placeholder={newData.treatmentPS}
                  style={{ width: 430 }}
                  onChange={e => {
                    newData.treatmentPS = e.target.value;
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
            tab={`${formatMessage({ id: `types.treatmentStatus${0}` })}(${
              dataSource.filter(ele => ele.treatmentStatus === 0).length
            })`}
            key="1"
          >
            <div className={styles.tableList}>
              <StandardTable
                scroll={{ x: 1000 }}
                selectedRows={[]}
                dataSource={dataSource.filter(ele => ele.treatmentStatus === 0)}
                columns={this.columns}
              />
            </div>
          </TabPane>
          <TabPane
            tab={`${formatMessage({ id: `types.treatmentStatus${1}` })}(${
              dataSource.filter(ele => ele.treatmentStatus === 1).length
            })`}
            key="2"
          >
            <div className={styles.tableList}>
              <StandardTable
                scroll={{ x: 1000 }}
                selectedRows={[]}
                dataSource={dataSource.filter(ele => ele.treatmentStatus === 1)}
                columns={this.columns}
              />
            </div>
          </TabPane>
          <TabPane
            tab={`${formatMessage({ id: `types.treatmentStatus${2}` })}(${
              dataSource.filter(ele => ele.treatmentStatus === 2).length
            })`}
            key="3"
          >
            <div className={styles.tableList}>
              <StandardTable
                scroll={{ x: 1000 }}
                selectedRows={[]}
                dataSource={dataSource.filter(ele => ele.treatmentStatus === 2)}
                columns={this.columns}
              />
            </div>
          </TabPane>
          <TabPane
            tab={`${formatMessage({ id: `types.treatmentStatus${3}` })}(${
              dataSource.filter(ele => ele.treatmentStatus === 3).length
            })`}
            key="4"
          >
            <div className={styles.tableList}>
              <StandardTable
                scroll={{ x: 1000 }}
                selectedRows={[]}
                dataSource={dataSource.filter(ele => ele.treatmentStatus === 3)}
                columns={this.columns}
              />
            </div>
          </TabPane>
        </Tabs>
      </Card>
    );
  }
}

export default SurgeriesList;
