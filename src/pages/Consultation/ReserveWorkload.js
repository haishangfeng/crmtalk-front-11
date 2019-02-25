/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-param-reassign */
import React, { PureComponent } from 'react';
import StandardTable from '@/components/StandardTable';
import { formatMessage } from 'umi/locale';

import {
  Card,
  Form,
  Button,
  Popconfirm,
  Icon,
  Select,
  Input,
  Skeleton,
  Modal,
  Tooltip,
  Collapse,
  DatePicker,
  message,
  Row,
  Spin,
} from 'antd';

import styles from './ReserveWorkload.less';
import {
  getConsultationWorks,
  deleteConsultationWork,
  addConsultationWork,
  updateConsultationWork,
  apolloGetCrBrToday,
} from '@/services/apollo/apolloTable';
import dictionariesMgr from '@/services/dictionariesMgr';
import { getUserMgr } from '@/services/userMgr';

const { Option } = Select;

class Reserveworkload extends PureComponent {
  state = {
    isLoading: false,
    drawerVisiable: false,
    newData: {
      id: '',
      key: '',
      workTime: '',
      TotalAmount: '',
      usedAmount: '',
      consultationType: '',
      dialogA: 0,
      dialogB: 0,
      dialogC: 0,
    },
    dataSource: [],
    dictionary: {
      advisoryWay: [],
    },
    todaysRecords: [],
    isFetchingTodayData: false,
    ui_modal_edit: false,
  };

  // 表格字段们
  columns = [
    {
      title: formatMessage({ id: 'zixungongzuoliang.col1' }),
      dataIndex: 'workTime',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'zixungongzuoliang.col2' }),
      dataIndex: 'consultationType',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'zixungongzuoliang.col3' }),
      dataIndex: 'TotalAmount',
      sorter: true,
      render: (dataIndex, record) => <div>{record.dialogA + record.dialogB + record.dialogC}</div>,
    },
    {
      title: formatMessage({ id: 'zixungongzuoliang.col4' }),
      dataIndex: 'usedAmount',
      sorter: true,
      render: (dataIndex, record) => <div>{record.dialogA + record.dialogB}</div>,
    },
    {
      title: formatMessage({ id: 'zixungongzuoliang.col5' }),
      dataIndex: 'dialogA',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'zixungongzuoliang.col6' }),
      dataIndex: 'dialogB',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'zixungongzuoliang.col7' }),
      dataIndex: 'dialogC',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'zixungongzuoliang.col8' }),
      dataIndex: 'creator',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'zixungongzuoliang.col9' }),
      dataIndex: 'operation',
      fixed: 'right',
      width: 100,
      render: (dataIndex, record) => (
        <div>
          <Tooltip title={formatMessage({ id: 'zixungongzuoliang.button1' })} mouseLeaveDelay={0}>
            <Button
              shape="circle"
              icon="edit"
              onClick={() => {
                this.setState({ ui_modal_edit: true, newData: { ...record } });
              }}
            />
          </Tooltip>
          <Popconfirm
            title={formatMessage({ id: 'zixungongzuoliang.button2' })}
            onConfirm={() => {
              this.handleDelete(record);
            }}
          >
            <Tooltip title={formatMessage({ id: 'zixungongzuoliang.button2' })} mouseLeaveDelay={0}>
              <Button shape="circle" icon="delete" />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  handleDelete = async record => {
    const { dataSource } = this.state;
    const result = await deleteConsultationWork(record);
    if (result === 'error') {
      message.error('删除失败');
      return;
    }
    message.success('删除成功');
    dataSource.splice(dataSource.indexOf(record), 1);
    this.setState({ dataSource: JSON.parse(JSON.stringify(dataSource)) });
  };

  onEditBtnClick = record => {
    this.setState({ newData: record, todaysRecords: [] });
  };

  onCancel = () => {
    this.setState({ drawerVisiable: false, newData: {}, todaysRecords: [] });
  };

  setIsLoad = isLoad => {
    this.setState({ isLoading: isLoad });
  };

  componentDidMount = async () => {
    this.setIsLoad(true);
    let tempData = await getConsultationWorks();
    if (tempData.error || tempData.errors) {
      message.error('加载失败，请刷新');
      return;
    }

    tempData = tempData.data.consultationWorks;
    tempData = tempData.map(item => ({
      ...item,
      key: item.id,
    }));
    const dic = (await dictionariesMgr.getConsultations()).filter(ele => ele.itemAvailiable);
    tempData.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    this.setState({
      dataSource: tempData,
      dictionary: { advisoryWay: dic },
    });

    this.setIsLoad(false);
  };

  validate = async () => {
    const { dataSource, newData } = this.state;
    if (newData.workTime === '' || newData.dialogC === '' || newData.advisoryWay === '') {
      message.error('信息不能为空');
      return;
    }
    // 新增
    const result = await addConsultationWork(newData);
    if (result === 'error') {
      this.setState({ drawerVisiable: false });
      message.error('新增失败');
    } else {
      const res = result.data.addConsultationWork;
      this.setState({ drawerVisiable: false });
      message.success('新增成功');
      res.key = res.id;
      res.TotalAmount = res.dialogA + res.dialogB + res.dialogC;
      res.usedAmount = res.dialogA + res.dialogB;
      const tempData = [res, ...dataSource];
      this.setState({
        newData: {},
        todaysRecords: [],
        drawerVisiable: false,
        dataSource: tempData,
      });
    }
  };

  render() {
    const {
      dataSource,
      isLoading,
      newData,
      dictionary,
      todaysRecords,
      isFetchingTodayData,
    } = this.state;

    return (
      <Collapse defaultActiveKey={['open']}>
        <Collapse.Panel header={formatMessage({ id: 'zixungongzuoliang.panel' })} key="open">
          <Card>
            <div>
              <Button
                type="primary"
                onClick={() => {
                  this.setState({ drawerVisiable: true });
                  const date = new Date();
                  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                  const time = date.toJSON().split('T')[0];
                  newData.workTime = time;
                  this.setState({ newData: { ...newData } });
                }}
                style={{ marginBottom: '10px' }}
              >
                <Icon type="plus" />
                {formatMessage({ id: 'zixungongzuoliang.button3' })}
              </Button>
              <Modal
                title={formatMessage({ id: 'zixungongzuoliang.form' })}
                width={320}
                onCancel={this.onCancel}
                onOk={this.validate}
                visible={this.state.drawerVisiable}
                destroyOnClose
              >
                <Spin spinning={isFetchingTodayData}>
                  <Form layout="inline" hideRequiredMark>
                    <Form.Item label={formatMessage({ id: 'zixungongzuoliang.col1' })}>
                      <DatePicker
                        // defaultValue={moment(newData.workTime)}
                        onChange={async value => {
                          if (value) {
                            newData.workTime = value.format('YYYY-MM-DD');
                            const tomorrowStamp =
                              new Date(newData.workTime).getTime() + 1000 * 60 * 60 * 24;
                            const tomorrow = new Date(tomorrowStamp).toJSON().substr(0, 10);

                            this.setState({ isFetchingTodayData: true });
                            const resp = await apolloGetCrBrToday(
                              newData.workTime,
                              tomorrow,
                              getUserMgr().userId
                            );
                            if (resp.error) {
                              message.error('对话量获取失败');
                              return;
                            }
                            console.log(resp.data.todaysConsultationWorks);

                            this.setState({
                              todaysRecords: resp.data.todaysConsultationWorks,
                              isFetchingTodayData: false,
                              newData: { ...newData },
                            });
                          } else {
                            newData.workTime = '';
                            newData.dialogA = 0;
                            newData.dialogB = 0;
                            this.setState({
                              todaysRecords: [],
                              newData: { ...newData },
                              isFetchingTodayData: false,
                            });
                          }
                        }}
                      />
                    </Form.Item>
                    <Form.Item label={formatMessage({ id: 'zixungongzuoliang.col2' })}>
                      <Select
                        style={{ width: 180 }}
                        onChange={value => {
                          newData.consultationType = value;
                          newData.dialogA = todaysRecords.filter(
                            ele => ele.advisoryWay === newData.consultationType && ele.isBooking
                          ).length;
                          newData.dialogB = todaysRecords.filter(
                            ele => ele.advisoryWay === newData.consultationType && !ele.isBooking
                          ).length;
                          this.setState({ newData: { ...newData } });
                        }}
                      >
                        {dictionary.advisoryWay.map(ele => (
                          <Option key={ele.id} value={ele.itemName}>
                            {ele.itemName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item label={formatMessage({ id: 'zixungongzuoliang.col5' })}>
                      {
                        todaysRecords.filter(
                          ele => ele.advisoryWay === newData.consultationType && ele.isBooking
                        ).length
                      }
                    </Form.Item>
                    <Row>
                      <Form.Item label={formatMessage({ id: 'zixungongzuoliang.col6' })}>
                        {
                          todaysRecords.filter(
                            ele => ele.advisoryWay === newData.consultationType && !ele.isBooking
                          ).length
                        }
                      </Form.Item>
                    </Row>
                    <Form.Item label={formatMessage({ id: 'zixungongzuoliang.col7' })}>
                      <Input
                        type="number"
                        placeholder={newData.dialogC}
                        onChange={e => {
                          newData.dialogC = parseInt(e.target.value, 10);
                        }}
                      />
                    </Form.Item>
                  </Form>
                </Spin>
              </Modal>
            </div>

            <div className={styles.tableList}>
              <Skeleton loading={isLoading}>
                <StandardTable
                  scroll={{ x: 1100 }}
                  selectedRows={[]}
                  dataSource={dataSource}
                  columns={this.columns}
                  onSelectRow={this.handleSelectRows}
                  onChange={this.handleStandardTableChange}
                />
              </Skeleton>
            </div>

            <Modal
              title="编辑工作量"
              width={320}
              onCancel={() => {
                this.setState({ ui_modal_edit: false, todaysRecords: [], newData: {} });
              }}
              onOk={async () => {
                const result = await updateConsultationWork(newData);
                if (result.error) {
                  message.error('更新失败');
                } else {
                  this.setState({ ui_modal_edit: false });
                  message.success('更新成功');
                  const data = dataSource.find(item => item.id === newData.id);
                  data.workTime = newData.workTime;
                  data.dialogA = newData.dialogA;
                  data.dialogB = newData.dialogB;
                  data.dialogC = newData.dialogC;
                  data.consultationType = newData.consultationType;
                  this.setState({
                    todaysRecords: [],
                    newData: { ...newData },
                    isFetchingTodayData: false,
                  });
                  this.setState({ dataSource: [...dataSource] });
                }
              }}
              visible={this.state.ui_modal_edit}
              destroyOnClose
            >
              <Spin spinning={isFetchingTodayData}>
                <Form layout="inline" hideRequiredMark>
                  <Form.Item label={formatMessage({ id: 'zixungongzuoliang.col1' })}>
                    <DatePicker
                      placeholder={newData.workTime}
                      // defaultValue={moment(newData.workTime).format('YYYY-MM-DD')}
                      onChange={async value => {
                        if (value) {
                          newData.workTime = value.format('YYYY-MM-DD');
                          const tomorrowStamp =
                            new Date(newData.workTime).getTime() + 1000 * 60 * 60 * 24;
                          const tomorrow = new Date(tomorrowStamp).toJSON().substr(0, 10);

                          this.setState({ isFetchingTodayData: true });

                          const resp = await apolloGetCrBrToday(
                            newData.workTime,
                            tomorrow,
                            getUserMgr().userId
                          );
                          if (resp.error) {
                            message.error('对话量获取失败');
                            return;
                          }
                          this.setState({
                            todaysRecords: resp.data.todaysConsultationWorks,
                            isFetchingTodayData: false,
                          });
                        } else {
                          newData.dialogA = 0;
                          newData.dialogB = 0;
                          this.setState({
                            todaysRecords: [],
                            newData: { ...newData },
                            isFetchingTodayData: false,
                          });
                        }
                      }}
                    />
                  </Form.Item>
                  <Form.Item label={formatMessage({ id: 'zixungongzuoliang.col2' })}>
                    <Select
                      style={{ width: 180 }}
                      defaultValue={newData.consultationType}
                      onChange={value => {
                        newData.consultationType = value;
                        newData.dialogA = todaysRecords.filter(
                          ele => ele.advisoryWay === newData.consultationType && ele.isBooking
                        ).length;
                        newData.dialogB = todaysRecords.filter(
                          ele => ele.advisoryWay === newData.consultationType && !ele.isBooking
                        ).length;
                        this.setState({ newData: { ...newData } });
                      }}
                    >
                      {dictionary.advisoryWay.map(ele => (
                        <Option key={ele.id} value={ele.itemName}>
                          {ele.itemName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item label={formatMessage({ id: 'zixungongzuoliang.col5' })}>
                    {newData.dialogA}
                  </Form.Item>
                  <Row>
                    <Form.Item label={formatMessage({ id: 'zixungongzuoliang.col6' })}>
                      {newData.dialogB}
                    </Form.Item>
                  </Row>
                  <Form.Item label={formatMessage({ id: 'zixungongzuoliang.col7' })}>
                    <Input
                      type="number"
                      value={newData.dialogC}
                      onChange={e => {
                        if (e.target.value) {
                          newData.dialogC = parseInt(e.target.value, 10);
                        } else newData.dialogC = 0;
                        this.setState({ newData: { ...newData } });
                      }}
                    />
                  </Form.Item>
                </Form>
              </Spin>
            </Modal>
          </Card>
        </Collapse.Panel>
      </Collapse>
    );
  }
}

export default Reserveworkload;
