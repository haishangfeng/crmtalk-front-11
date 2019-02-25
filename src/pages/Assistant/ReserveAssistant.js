/* eslint-disable prefer-destructuring */
import React, { PureComponent } from 'react';
import {
  Card,
  Tooltip,
  Popconfirm,
  Button,
  Modal,
  Select,
  Tabs,
  message,
  Row,
  Form,
  Input,
  DatePicker,
  Cascader,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import { formatMessage } from 'umi/locale';

import TextArea from 'antd/lib/input/TextArea';
import styles from './ReserveAssistant.less';
import { isArray } from 'util';
import { getBookingRecordsTable, updateBookingRecord } from '@/services/apollo/apolloTable';
import formatTimeTommy from '@/util';
import dictionariesMgr from '@/services/dictionariesMgr';
import { partialUpdateUserBasic } from '@/services/apollo/apolloUser';

const TabPane = Tabs.TabPane;
const { Option } = Select;

class ReservationAssistant extends PureComponent {
  state = {
    newData: {},
    uiState: {
      modalVisiableEdit: false,
      opButton: '1',
    },
    dataSource: [],
    dictionary: { where: [], toHospitalCate: [], mainProjects: [], tags: [] },
  };

  // 表格字段们
  columns = [
    {
      title: `${formatMessage({ id: 'jiezhen.table.col1' })}`,
      dataIndex: 'user.name',
      width: 150,
    },
    {
      title: `${formatMessage({ id: 'jiezhen.table.col2' })}`,
      dataIndex: 'user.sex',
      width: 150,
      render: dataIndex => (
        <div>
          {dataIndex === '0'
            ? formatMessage({ id: 'customerForm.form1000' })
            : formatMessage({ id: 'customerForm.form1001' })}
        </div>
      ),
    },
    {
      title: `${formatMessage({ id: 'jiezhen.table.col3' })}`,
      dataIndex: 'bookingStatus',
      width: 150,
      render: dataIndex => <div>{formatMessage({ id: `types.bookingStatus${dataIndex}` })}</div>,
    },
    {
      title: `${formatMessage({ id: 'jiezhen.table.col4' })}`,
      dataIndex: 'toHospitalCate',
      width: 150,
    },
    {
      title: `${formatMessage({ id: 'jiezhen.table.col5' })}`,
      dataIndex: 'assistant',
      width: 150,
    },
    {
      title: `${formatMessage({ id: 'jiezhen.table.col6' })}`,
      dataIndex: 'frontDesk',
      width: 280,
    },
    {
      title: `${formatMessage({ id: 'jiezhen.table.col7' })}`,
      dataIndex: 'time',
      width: 280,
    },
    {
      title: `${formatMessage({ id: 'jiezhen.table.col8' })}`,
      dataIndex: 'operation',
      fixed: 'right',
      width: 80,
      render: (dataIndex, record) => {
        const { uiState } = this.state;
        return (
          <div>
            {uiState.opButton === '2' && (
              <Tooltip title="分诊" mouseLeaveDelay={0}>
                <Button shape="circle" icon="user-add" disabled />
              </Tooltip>
            )}
            {uiState.opButton === '3' && (
              <Tooltip title="接诊" mouseLeaveDelay={0}>
                <Button
                  shape="circle"
                  icon="user-add"
                  onClick={() => this.setModalVisiableEdit(record)}
                />
              </Tooltip>
            )}
            {uiState.opButton === '5' && (
              <Tooltip title="收费" mouseLeaveDelay={0}>
                <Button shape="circle" icon="dollar" disabled />
              </Tooltip>
            )}
            {uiState.opButton === '6' && (
              <Tooltip title="手术安排" mouseLeaveDelay={0}>
                <Button
                  shape="circle"
                  icon="heart"
                  onClick={() => this.setModalVisiableEdit(record)}
                />
              </Tooltip>
            )}
            {uiState.opButton === '6' && (
              <Tooltip title="疗程安排">
                <Button
                  shape="circle"
                  icon="smile"
                  onClick={() => this.setModalVisiableEdit(record)}
                />
              </Tooltip>
            )}
            <Popconfirm title="确认删除？">
              <Tooltip title="删除">
                <Button shape="circle" icon="delete" />
              </Tooltip>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  setModalVisiableEdit = record => {
    const { uiState } = this.state;
    this.setState({
      uiState: { ...uiState, modalVisiableEdit: true },
      newData: JSON.parse(JSON.stringify(record)),
    });
  };

  componentDidMount = async () => {
    let tempData = (await getBookingRecordsTable()).data.bookingRecords;

    tempData = tempData.map(item => ({
      key: item.id,
      ...item,
      time: formatTimeTommy(item.time),
    }));

    this.setState({ dataSource: tempData });
    const dic = { where: [], toHospitalCate: [], mainProjects: [], tags: [] };
    const mainProjects = (await dictionariesMgr.getMainProjects()).filter(
      ele => ele.itemAvailiable === true
    );
    mainProjects.forEach(ele => {
      const children = dictionariesMgr
        .getChildren(ele.id, ele.itemName)
        .filter(ele2 => ele2.itemAvailiable === true);
      dic.mainProjects = dic.mainProjects.concat(children);
    });
    const tempTags = (await dictionariesMgr.getTags()).filter(ele => ele.itemAvailiable === true);
    tempTags.forEach(ele => {
      const children = dictionariesMgr
        .getChildren(ele.id, ele.itemName)
        .filter(ele2 => ele2.itemAvailiable === true);
      dic.tags = dic.tags.concat(children);
    });
    dic.toHospitalCate = (await dictionariesMgr.getTohospitalCates()).filter(
      ele => ele.itemAvailiable === true
    );
    dic.where = (await dictionariesMgr.getWheres()).filter(ele => ele.itemAvailiable === true);
    dic.where = dic.where.map(ele => {
      const children = dictionariesMgr.getChildren(ele.id, '一级区域');
      return {
        value: ele.itemName,
        label: ele.itemName,
        children: children.map(ele2 => ({
          value: ele2.itemName,
          label: ele2.itemName,
        })),
      };
    });
    this.setState({ dictionary: { ...dic } });
  };

  handleDeliver = async () => {
    const { newData, dataSource, uiState } = this.state;
    if (!newData.diagnosisResult || !newData.diagnosisSummary || !newData.diagnosisDetail) {
      message.error('信息不能为空');
      return;
    }
    newData.bookingStatus = 2;

    const resp = await partialUpdateUserBasic(newData.user);
    if (resp.error || resp.errors) {
      message.error('更新用户信息失败');
      return;
    }
    message.success('更新用户信息成功');
    const respone = await updateBookingRecord(newData);
    if (respone.error || respone.errors) {
      message.error('接诊失败');
      return;
    }
    message.success('接诊成功');
    dataSource.splice(dataSource.findIndex(ele => ele.id === newData.id), 1);
    this.setState({
      dataSource: JSON.parse(JSON.stringify(dataSource)),
      uiState: { ...uiState, modalVisiableEdit: false },
    });
  };

  render() {
    const { dataSource, uiState, newData, dictionary } = this.state;
    return (
      <Card>
        <Tabs
          onChange={activeKey => this.setState({ uiState: { ...uiState, opButton: activeKey } })}
        >
          <TabPane tab={`${formatMessage({ id: 'jiezhen.tab' })}(${dataSource.length})`} key="1">
            <div className={styles.tableList}>
              <StandardTable
                // scroll={{ x: 500 }}
                selectedRows={[]}
                dataSource={dataSource}
                columns={this.columns}
              />
            </div>
          </TabPane>
          <TabPane
            tab={`${formatMessage({ id: `types.bookingStatus${0}` })}(${
              dataSource.filter(ele => ele.bookingStatus === 0).length
            })`}
            key="2"
          >
            <div className={styles.tableList}>
              <StandardTable
                // scroll={{ x: 500 }}
                selectedRows={[]}
                dataSource={dataSource.filter(ele => ele.bookingStatus === 0)}
                columns={this.columns}
              />
            </div>
          </TabPane>
          <TabPane
            tab={`${formatMessage({ id: `types.bookingStatus${1}` })}(${
              dataSource.filter(ele => ele.bookingStatus === 1).length
            })`}
            key="3"
          >
            <div className={styles.tableList}>
              <StandardTable
                // scroll={{ x: 500 }}
                selectedRows={[]}
                dataSource={dataSource.filter(ele => ele.bookingStatus === 1)}
                columns={this.columns}
              />
            </div>
          </TabPane>
          <TabPane
            tab={`${formatMessage({ id: `types.bookingStatus${2}` })}(${
              dataSource.filter(ele => ele.bookingStatus === 2).length
            })`}
            key="4"
          >
            <div className={styles.tableList}>
              <StandardTable
                // scroll={{ x: 500 }}
                selectedRows={[]}
                dataSource={dataSource.filter(ele => ele.bookingStatus === 2)}
                columns={this.columns}
              />
            </div>
          </TabPane>
          <TabPane
            tab={`${formatMessage({ id: `types.bookingStatus${3}` })}(${
              dataSource.filter(ele => ele.bookingStatus === 3).length
            })`}
            key="5"
          >
            <div className={styles.tableList}>
              <StandardTable
                //  scroll={{ x: 500 }}
                selectedRows={[]}
                dataSource={dataSource.filter(ele => ele.bookingStatus === 3)}
                columns={this.columns}
              />
            </div>
          </TabPane>
        </Tabs>

        <Modal
          title="接诊"
          width={900}
          onCancel={() => {
            this.setState({ uiState: { ...uiState, modalVisiableEdit: false } });
          }}
          visible={uiState.modalVisiableEdit}
          destroyOnClose
          onOk={this.handleDeliver}
        >
          <Form layout="inline">
            <Row>
              <Form.Item label="姓名">
                <Input
                  style={{ width: 150 }}
                  value={newData.user && newData.user.name}
                  onChange={e => {
                    newData.user.name = e.target.value;
                    this.setState({ newData: { ...newData } });
                  }}
                />
              </Form.Item>
              <Form.Item label="手机">
                <Input
                  style={{ width: 150 }}
                  value={newData.user && newData.user.mobile}
                  onChange={e => {
                    newData.user.mobile = e.target.value;
                    this.setState({ newData: { ...newData } });
                  }}
                />
              </Form.Item>
              <Form.Item label="微信">
                <Input
                  style={{ width: 150 }}
                  value={newData.user && newData.user.wechat}
                  onChange={e => {
                    newData.user.wechat = e.target.value;
                    this.setState({ newData: { ...newData } });
                  }}
                />
              </Form.Item>
              <Form.Item label="QQ">
                <Input
                  style={{ width: 150 }}
                  value={newData.user && newData.user.qq}
                  onChange={e => {
                    newData.user.qq = e.target.value;
                    this.setState({ newData: { ...newData } });
                  }}
                />
              </Form.Item>
            </Row>
            <Row>
              <Form.Item label="性别">
                <Select
                  defaultValue={
                    newData.user && newData.user.sex === '0'
                      ? formatMessage({ id: 'customerForm.form1000' })
                      : formatMessage({ id: 'customerForm.form1001' })
                  }
                  onChange={(value, option) => {
                    newData.user.sex = option.key;
                  }}
                >
                  <Option value={formatMessage({ id: 'customerForm.form1000' })} key="0">
                    {formatMessage({ id: 'customerForm.form1000' })}
                  </Option>
                  <Option value={formatMessage({ id: 'customerForm.form1001' })} key="1">
                    {formatMessage({ id: 'customerForm.form1001' })}
                  </Option>
                </Select>
              </Form.Item>
              <Form.Item label="年龄">
                <Input
                  style={{ width: 40 }}
                  value={newData.user && newData.user.age}
                  onChange={e => {
                    if (e.target.value) {
                      newData.user.age = e.target.value;
                      newData.user.birthYear =
                        new Date().getFullYear() - parseInt(e.target.value, 10);
                      newData.user.birthDay = null;
                    } else {
                      newData.user.age = null;
                      newData.user.birthYear = null;
                      newData.user.birthDay = null;
                    }
                    this.setState({ newData: { ...newData } });
                  }}
                />
              </Form.Item>
              <Form.Item label="出生年份">
                <Input
                  style={{ width: 80 }}
                  value={newData.user && newData.user.birthYear}
                  onChange={e => {
                    if (e.target.value) {
                      newData.user.birthYear = e.target.value;
                      newData.user.age = new Date().getFullYear() - parseInt(e.target.value, 10);
                      newData.user.birthDay = null;
                    } else {
                      newData.user.age = null;
                      newData.user.birthYear = null;
                      newData.user.birthDay = null;
                    }
                    this.setState({ newData: { ...newData } });
                  }}
                />
              </Form.Item>
              <Form.Item label="出生日期">
                <DatePicker
                  style={{ width: 160 }}
                  placeholder={newData.user && newData.user.birthDay}
                  onChange={value => {
                    if (value) {
                      const date = value.format('YYYY-MM-DD');
                      newData.user.birthDay = date;
                      newData.user.age = new Date().getFullYear() - parseInt(date.slice(0, 5), 10);
                      newData.user.birthYear = new Date().getFullYear() - newData.user.age;
                    } else {
                      newData.user.age = null;
                      newData.user.birthYear = null;
                      newData.user.birthDay = null;
                    }
                    this.setState({ newData: { ...newData } });
                  }}
                />
              </Form.Item>
              <Form.Item label="区域">
                <Cascader
                  defaultValue={newData.user && newData.user.where.split(',')}
                  options={dictionary.where}
                  onChange={value => {
                    if (value) newData.user.where = value.toString();
                    else newData.user.where = null;
                    this.setState({ newData: { ...newData } });
                  }}
                />
              </Form.Item>

              <Row>
                <Form.Item label="主项目（多选）">
                  <Select
                    placeholder=""
                    mode="multiple"
                    style={{ width: 300 }}
                    defaultValue={
                      newData.user &&
                      (isArray(newData.user.mainProject)
                        ? newData.user.mainProject
                        : newData.user.mainProject.split(','))
                    }
                    onChange={value => {
                      if (value) newData.user.mainProject = value;
                      else newData.user.mainProject = value;
                      this.setState({ newData: { ...newData } });
                    }}
                  >
                    {dictionary.mainProjects.map(ele => (
                      <Option key={ele.id} value={ele.itemName}>
                        {ele.itemName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="关注项目（多选）">
                  <Select
                    placeholder=""
                    mode="multiple"
                    style={{ width: 290 }}
                    defaultValue={
                      newData.user &&
                      (isArray(newData.user.focusProject)
                        ? newData.user.focusProject
                        : newData.user.focusProject.split(','))
                    }
                    onChange={value => {
                      if (value) newData.user.focusProject = value;
                      else newData.user.focusProject = value;
                      this.setState({ newData: { ...newData } });
                    }}
                  >
                    {dictionary.mainProjects.map(ele => (
                      <Option key={ele.id} value={ele.itemName}>
                        {ele.itemName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Row>
              <Row>
                <Form.Item label="待开发项目（多选）">
                  <Select
                    mode="multiple"
                    style={{ width: 280 }}
                    defaultValue={
                      newData.user &&
                      (isArray(newData.user.toBeDevelopedProject)
                        ? newData.user.toBeDevelopedProject
                        : newData.user.toBeDevelopedProject.split(','))
                    }
                    onChange={value => {
                      if (value) newData.user.toBeDevelopedProject = value;
                      else newData.user.toBeDevelopedProject = value;
                      this.setState({ newData: { ...newData } });
                    }}
                  >
                    {dictionary.mainProjects.map(ele => (
                      <Option key={ele.id} value={ele.itemName}>
                        {ele.itemName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="本院已做项目（多选）">
                  <Select
                    mode="multiple"
                    style={{ width: 280 }}
                    defaultValue={
                      newData.user &&
                      (isArray(newData.user.haveDoneInThisHospital)
                        ? newData.user.haveDoneInThisHospital
                        : newData.user.haveDoneInThisHospital.split(','))
                    }
                    onChange={value => {
                      if (value) newData.user.haveDoneInThisHospital = value;
                      else newData.user.haveDoneInThisHospital = null;
                      this.setState({ newData: { ...newData } });
                    }}
                  >
                    {dictionary.mainProjects.map(ele => (
                      <Option key={ele.id} value={ele.itemName}>
                        {ele.itemName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Row>
              <Row>
                <Form.Item label="他院已做项目（多选）">
                  <Select
                    mode="multiple"
                    style={{ width: 280 }}
                    defaultValue={
                      newData.user &&
                      (isArray(newData.user.haveDoneInAnotherHospital)
                        ? newData.user.haveDoneInAnotherHospital
                        : newData.user.haveDoneInAnotherHospital.split(','))
                    }
                    onChange={value => {
                      if (value) newData.user.haveDoneInAnotherHospital = value;
                      else newData.user.haveDoneInAnotherHospital = null;
                      this.setState({ newData: { ...newData } });
                    }}
                  >
                    {dictionary.mainProjects.map(ele => (
                      <Option key={ele.id} value={ele.itemName}>
                        {ele.itemName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="客户标签（多选）">
                  <Select
                    mode="multiple"
                    style={{ width: 280 }}
                    defaultValue={
                      newData.user &&
                      (isArray(newData.user.tag) ? newData.user.tag : newData.user.tag.split(','))
                    }
                    onChange={value => {
                      if (value) newData.user.tag = value;
                      else newData.user.tag = null;
                      this.setState({ newData: { ...newData } });
                    }}
                  >
                    {dictionary.tags.map(ele => (
                      <Option key={ele.id} value={ele.itemName}>
                        {ele.itemName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Row>

              <h3>预约详情</h3>
              <Row>
                <Form.Item label="来院类别">
                  <Select
                    defaultValue={newData.toHospitalCate}
                    onChange={value => {
                      if (value) newData.toHospitalCate = value;
                      else newData.toHospitalCate = null;
                      this.setState({ newData: { ...newData } });
                    }}
                  >
                    {dictionary.toHospitalCate.map(ele => (
                      <Option key={ele.id} value={ele.itemName}>
                        {ele.itemName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="现场咨询师">
                  <Select
                    defaultValue={newData.assistant}
                    onChange={(value, option) => {
                      newData.assistant = option.key;
                      this.setState({ newData: { ...newData } });
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
                <Form.Item label="接诊结果">
                  <Select
                    style={{ width: 100 }}
                    defaultValue={newData.diagnosisResult}
                    onChange={(value, option) => {
                      newData.diagnosisResult = option.key;
                      this.setState({ newData: { ...newData } });
                    }}
                  >
                    <Option key="开单" value="开单">
                      开单
                    </Option>
                    <Option key="未开单" value="未开单">
                      未开单
                    </Option>
                    <Option key="模棱两可" value="模棱两可">
                      模棱两可
                    </Option>
                  </Select>
                </Form.Item>
                <Form.Item label="接诊小结">
                  <Input
                    style={{ width: 280 }}
                    value={newData.diagnosisSummary}
                    onChange={e => {
                      newData.diagnosisSummary = e.target.value;
                      this.setState({ newData: { ...newData } });
                    }}
                  />
                </Form.Item>
              </Row>
              <Row>
                <Form.Item label="接诊详情">
                  <TextArea
                    rows="1"
                    style={{ width: 760 }}
                    value={newData.diagnosisDetail}
                    onChange={e => {
                      newData.diagnosisDetail = e.target.value;
                      this.setState({ newData: { ...newData } });
                    }}
                  />
                </Form.Item>
              </Row>
            </Row>
          </Form>
        </Modal>
      </Card>
    );
  }
}

export default ReservationAssistant;
