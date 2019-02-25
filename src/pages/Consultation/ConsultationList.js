import React, { PureComponent } from 'react';
import {
  Card,
  Tooltip,
  Button,
  Popconfirm,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  message,
  Skeleton,
} from 'antd';
import StandardTable from '@/components/StandardTable';

import { formatMessage } from 'umi/locale';
import moment from 'moment';
import styles from './ConsultationList.less';
import {
  getConsultingRecordsTable,
  addReturnVisitTask,
  addReturnVisitRecord,
} from '@/services/apollo/apolloTable';
import formatTimeTommy from '@/util';
import dictionariesMgr, { DictionaryItem } from '@/services/dictionariesMgr';
import TextArea from 'antd/lib/input/TextArea';
import { getAdmins } from '@/services/apollo/apolloAdmin';

const { Option } = Select;
class ConsultationList extends PureComponent {
  state = {
    isLoading: false,
    selectedRows: [],
    dataSource: [],
    modalVisiableTask: false,
    modalVisiableRecord: false,
    modalVisiableEdit: false,
    newData: [],
    dictionary: {
      type: [],
      topic: [],
      result: [],
      way: [],
      flow: [],
      admins: [],
      consultations: [],
      consultationsResults: [],
    },
    userInfo: [],
  };

  // 表格字段们
  columns = [
    {
      title: formatMessage({ id: 'ConconsulationList.table.col1' }),
      dataIndex: 'user.name',
      sorter: true,
      width: 130,
      fixed: 'left',
    },
    {
      title: formatMessage({ id: 'ConconsulationList.table.col2' }),
      dataIndex: 'user.sex',
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
      title: formatMessage({ id: 'ConconsulationList.table.col3' }),
      dataIndex: 'user.age',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'ConconsulationList.table.col4' }),
      dataIndex: 'advisoryWay',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'ConconsulationList.table.col5' }),
      dataIndex: 'user.bigFrom',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'ConconsulationList.table.col6' }),
      dataIndex: 'user.where',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'ConconsulationList.table.col7' }),
      dataIndex: 'advisorySummary',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'ConconsulationList.table.col8' }),
      dataIndex: 'creator',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'ConconsulationList.table.col9' }),
      dataIndex: 'createdAt',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'ConconsulationList.table.col10' }),
      dataIndex: 'advisoryDetail',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'ConconsulationList.table.col11' }),
      dataIndex: 'operation',
      fixed: 'right',
      width: 210,
      render: (dataIndex, record) => (
        <div>
          <Tooltip
            title={formatMessage({ id: 'ConconsulationList.operation.operation1' })}
            mouseLeaveDelay={0}
          >
            <Button
              shape="circle"
              icon="edit"
              onClick={() => {
                const date = new Date();
                date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                this.setState({ modalVisiableEdit: true });
                this.setState({ newData: { ...record } });
                this.setState({ userInfo: { ...record.user } });
              }}
            />
          </Tooltip>

          <Popconfirm
            title={formatMessage({ id: 'ConconsulationList.tip.tip1' })}
            onConfirm={() => this.handleDelete(record)}
          >
            <Tooltip
              title={formatMessage({ id: 'ConconsulationList.operation.operation2' })}
              mouseLeaveDelay={0}
            >
              <Button shape="circle" icon="delete" />
            </Tooltip>
          </Popconfirm>
          <Tooltip
            title={formatMessage({ id: 'ConconsulationList.operation.operation3' })}
            mouseLeaveDelay={0}
          >
            <Button
              shape="circle"
              icon="smile"
              onClick={() => {
                const date = new Date();
                date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                const returnVisitDate = date.toJSON().split('T')[0];
                this.setState({ modalVisiableTask: true });
                this.setState({ newData: { ...record, returnVisitDate } });
                this.setState({ userInfo: { ...record.user } });
              }}
            />
          </Tooltip>
          <Tooltip
            title={formatMessage({ id: 'ConconsulationList.operation.operation4' })}
            mouseLeaveDelay={0}
          >
            <Button
              shape="circle"
              icon="book"
              onClick={() => {
                const date = new Date();
                date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                this.setState({ newData: { ...record } });
                this.setState({ userInfo: { ...record.user } });
                this.setState({ modalVisiableRecord: true });
              }}
            />
          </Tooltip>
          <Tooltip
            title={formatMessage({ id: 'ConconsulationList.operation.operation5' })}
            mouseLeaveDelay={0}
          >
            <Button shape="circle" icon="bell" />
          </Tooltip>
          <Tooltip
            title={formatMessage({ id: 'ConconsulationList.operation.operation6' })}
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

  componentDidMount = async () => {
    this.setIsLoad(true);
    const { dictionary } = this.state;
    const dic = {
      type: [],
      topic: [],
      result: [],
      way: [],
      flow: [],
      admins: [],
      consultations: [],
      consultationsResults: [],
    };
    let tempData = (await getConsultingRecordsTable()).data.consultingRecords;
    const tempAdmins = await getAdmins();

    dic.type = (await dictionariesMgr.getChildrenByRoot(DictionaryItem.TraceType)).filter(
      ele => ele.itemAvailiable === true
    );
    dic.topic = (await dictionariesMgr.getChildrenByRoot(DictionaryItem.TraceProject)).filter(
      ele => ele.itemAvailiable === true
    );
    dic.result = (await dictionariesMgr.getChildrenByRoot(DictionaryItem.TraceResult)).filter(
      ele => ele.itemAvailiable === true
    );
    dic.way = (await dictionariesMgr.getChildrenByRoot(DictionaryItem.TraceWay)).filter(
      ele => ele.itemAvailiable === true
    );
    dic.flow = (await dictionariesMgr.getChildrenByRoot(DictionaryItem.TraceUserTo)).filter(
      ele => ele.itemAvailiable === true
    );
    dic.admins = tempAdmins.data.admins.map(ele => ({
      itemName: ele.name,
      key: ele.id,
    }));

    dic.consultations = (await dictionariesMgr.getConsultations()).filter(
      ele => ele.itemAvailiable
    );
    dic.consultationsResults = (await dictionariesMgr.getConsultationsResult()).filter(
      ele => ele.itemAvailiable
    );
    tempData = tempData.map(item => ({
      key: item.id,
      ...item,
      createdAt: formatTimeTommy(item.createdAt),
    }));
    tempData.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    this.setState({ dataSource: tempData });
    this.setState({ dictionary: { ...dictionary, ...dic } });
    this.setIsLoad(false);
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleOk = async () => {
    const { newData, dataSource, userInfo } = this.state;
    newData.status = formatMessage({ id: 'ConconsulationList.tip.tip2' });
    newData.name = userInfo.name;
    newData.sex = userInfo.sex;
    newData.age = userInfo.age;
    if (newData.type && newData.returnVisitDate && newData.topic && newData.visitor) {
      //
    } else {
      message.error(formatMessage({ id: 'ConconsulationList.tip.tip3' }));
      return;
    }
    const result = await addReturnVisitTask(newData);
    if (result === 'error') {
      message.error(formatMessage({ id: 'ConconsulationList.tip.tip4' }));
      this.setState({ dataSource });
    } else {
      message.success(formatMessage({ id: 'ConconsulationList.tip.tip5' }));
      this.setState({ dataSource });
      this.setState({ modalVisiableTask: false });
    }
  };

  handleAddRecord = async () => {
    const { newData } = this.state;
    this.setState({ modalVisiableRecord: false });
    const result = await addReturnVisitRecord(newData);
    if (result === 'error') {
      message.error('添加失败');
    } else {
      message.success('添加成功');
    }
  };

  render() {
    const {
      selectedRows,
      dataSource,
      modalVisiableTask,
      modalVisiableRecord,
      modalVisiableEdit,
      newData,
      dictionary,
      userInfo,
      isLoading,
    } = this.state;
    return (
      <Card>
        <Modal
          title="添加回访记录"
          visible={modalVisiableEdit}
          onOk={this.handleAddRecord}
          width={320}
          destroyOnClose
          onCancel={() => {
            this.setState({ modalVisiableEdit: false });
          }}
        >
          <Form layout="inline">
            <Row>
              <Form.Item label={formatMessage({ id: 'ConconsulationList.form.form2' })}>
                {userInfo.name}
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'ConconsulationList.form.form3' })}>
                {userInfo.sex}
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'ConconsulationList.form.form4' })}>
                {userInfo.age}
              </Form.Item>
            </Row>

            <Form.Item label={formatMessage({ id: 'customerForm.form41' })}>
              <Select
                allowClear
                style={{ width: 157 }}
                onChange={value => {
                  newData.advisoryWay = value;
                }}
              >
                {dictionary.consultations.map(ele => (
                  <Option key={ele.id} value={ele.itemName}>
                    {ele.itemName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'customerForm.form42' })}>
              <Select
                allowClear
                style={{ width: 157 }}
                onChange={value => {
                  newData.advisoryResult = value;
                }}
              >
                {dictionary.consultationsResults.map(ele => (
                  <Option key={ele.id} value={ele.itemName}>
                    {ele.itemName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'customerForm.form43' })}>
              <Input
                style={{ width: 157 }}
                rows="1"
                onChange={e => {
                  newData.advisoryDetail = e.target.value;
                }}
              />
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'customerForm.form44' })}>
              <TextArea
                style={{ width: 157 }}
                rows="2"
                onChange={e => {
                  newData.addvisorySummary = e.target.value;
                }}
              />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="添加回访记录"
          visible={modalVisiableRecord}
          onOk={this.handleAddRecord}
          width={320}
          destroyOnClose
          onCancel={() => {
            this.setState({ modalVisiableRecord: false });
          }}
        >
          <Form layout="inline">
            <Row>
              <Form.Item label={formatMessage({ id: 'ConconsulationList.form.form2' })}>
                {userInfo.name}
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'ConconsulationList.form.form3' })}>
                {userInfo.sex}
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'ConconsulationList.form.form4' })}>
                {userInfo.age}
              </Form.Item>
            </Row>
            <Form.Item label="回访方式">
              <Select
                placeholder="回访方式"
                style={{ width: 157 }}
                onChange={value => {
                  newData.way = value;
                }}
              >
                {dictionary.way.map(ele => (
                  <Option key={ele.id} value={ele.itemName}>
                    {ele.itemName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="回访主题">
              <Input
                placeholder="回访主题"
                onChange={e => {
                  newData.topic = e.target.value;
                }}
              />
            </Form.Item>

            <Form.Item label="回访记录">
              <TextArea
                placeholder="回访记录"
                onChange={e => {
                  newData.detail = e.target.value;
                }}
              />
            </Form.Item>

            <Form.Item label="回访结果">
              <Select
                placeholder="回访结果"
                style={{ width: 157 }}
                onChange={value => {
                  newData.result = value;
                }}
              >
                {dictionary.result.map(ele => (
                  <Option key={ele.id} value={ele.itemName}>
                    {ele.itemName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="客户流向">
              <Select
                placeholder="客户流向"
                style={{ width: 157 }}
                onChange={value => {
                  newData.flow = value;
                }}
              >
                {dictionary.flow.map(ele => (
                  <Option key={ele.id} value={ele.itemName}>
                    {ele.itemName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title={formatMessage({
            id: 'ConconsulationList.form.form1',
          })}
          visible={modalVisiableTask}
          onOk={this.handleOk}
          width={600}
          destroyOnClose
          onCancel={() => {
            this.setState({ modalVisiableTask: false });
          }}
        >
          <Form layout="inline">
            <Row>
              <Form.Item label={formatMessage({ id: 'ConconsulationList.form.form2' })}>
                {userInfo.name}
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'ConconsulationList.form.form3' })}>
                {userInfo.sex}
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'ConconsulationList.form.form4' })}>
                {userInfo.age}
              </Form.Item>
            </Row>
            <Form.Item label={formatMessage({ id: 'ConconsulationList.form.form5' })}>
              <Select
                style={{ width: 157 }}
                onChange={value => {
                  newData.type = value;
                }}
              >
                {dictionary.type.map(ele => (
                  <Option key={ele.id} value={ele.itemName}>
                    {ele.itemName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label={formatMessage({ id: 'ConconsulationList.form.form6' })}>
              <Input
                value={newData.topic}
                style={{ width: 120 }}
                onChange={e => {
                  newData.topic = e.target.value;
                  this.setState({ newData: { ...newData } });
                }}
              />
              <Select
                showSearch
                value={formatMessage({
                  id: 'ConconsulationList.form.form7',
                })}
                style={{ width: 80 }}
                onChange={value => {
                  newData.topic = value;
                  this.setState({ newData: { ...newData } });
                }}
              >
                {dictionary.topic.map(ele => (
                  <Option key={ele.id} value={ele.itemName}>
                    {ele.itemName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label={formatMessage({ id: 'ConconsulationList.form.form8' })}>
              <Select
                showSearch
                style={{ width: 140 }}
                onChange={value => {
                  newData.visitor = value;
                  this.setState({ newData: { ...newData } });
                }}
              >
                {dictionary.admins.map(ele => (
                  <Option key={ele.key} value={ele.itemName}>
                    {ele.itemName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'ConconsulationList.form.form9' })}>
              <DatePicker
                style={{ width: 200 }}
                defaultValue={moment(newData.returnVisitDate)}
                onChange={value => {
                  if (value) {
                    newData.returnVisitDate = value.format('YYYY-MM-DD');
                  }
                }}
              />
            </Form.Item>
          </Form>
        </Modal>
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
