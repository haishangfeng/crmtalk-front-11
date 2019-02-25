import React, { PureComponent } from 'react';
import {
  Card,
  Form,
  Button,
  Skeleton,
  Tooltip,
  Select,
  Modal,
  message,
  Row,
  Col,
  Input,
  Cascader,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import { formatMessage } from 'umi/locale';

import styles from './customerList.less';
import {
  getUsersDetail,
  deleteUser,
  getUserBasicById,
  updateUserBasic,
  addBookingRecordWithConsultation,
} from '@/services/apollo/apolloUser';
import dictionariesMgr, { DictionaryItem } from '@/services/dictionariesMgr';
import TextArea from 'antd/lib/input/TextArea';
import { getUserMgr } from '@/services/userMgr';
import formatTimeTommy from '@/util';

const { Option } = Select;

class CustomerListFD extends PureComponent {
  state = {
    isLoading: false,
    selectedRows: [],
    dataSource: [],
    uiState: {
      modalDeliver: false,
      modalEditUser: false,
      isloadingEditModal: true,
    },
    newData: {
      name: '',
      sex: '',
      age: '',
      moblie: '',
      toHospitalCate: '',
    },
    newUserData: {
      mainProject: '',
      focusProject: '',
      toBeDevelopedProject: '',
      haveDoneInThisHospital: '',
      haveDoneInAnotherHospital: '',
      tag: '',
    },
    dictionary: {
      toHospitalCate: [],
      car: [],
      marriage: [],
      mainProjects: [],
      tags: [],
      consultations: [],
      consultationsResults: [],
      phoneModel: [],
      vipLevel: [],
      where: [],
    },
  };

  // 表格字段们
  columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      sorter: true,
      width: 130,
    },
    {
      title: 'VipLevel',
      dataIndex: 'vipLevel',
      sorter: true,
      width: 120,
    },
    {
      title: '性别',
      dataIndex: 'sex',
      sorter: true,
      width: 80,
      render: dataIndex => (
        <div>
          {dataIndex === '0'
            ? formatMessage({ id: 'customerForm.form1000' })
            : formatMessage({ id: 'customerForm.form1001' })}
        </div>
      ),
    },
    {
      title: '年龄',
      dataIndex: 'age',
      sorter: true,
      width: 80,
    },
    {
      title: '地区',
      dataIndex: 'where',
      sorter: true,
      width: 80,
    },
    {
      title: '主来源',
      dataIndex: 'bigFrom',
      sorter: true,
      width: 120,
    },
    {
      title: '主项目',
      dataIndex: 'mainProject',
      sorter: true,
      width: 120,
    },
    {
      title: '咨询次数',
      dataIndex: 'consultationCount',
      sorter: true,
    },
    {
      title: '预约次数',
      dataIndex: 'bookingCount',
      sorter: true,
    },
    {
      title: '到院次数',
      dataIndex: 'hasBeenHospitalCount',
      sorter: true,
    },
    {
      title: '开单次数',
      dataIndex: 'billsCount',
      sorter: true,
    },
    {
      title: '登记归属',
      dataIndex: 'creator',
      sorter: true,
    },
    {
      title: '登记时间',
      dataIndex: 'createdAt',
      sorter: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      fixed: 'right',
      width: 240,
      render: (dataIndex, record) => (
        <div>
          <Tooltip title="快速分诊">
            <Button
              shape="circle"
              icon="user-add"
              onClick={() => {
                const { uiState } = this.state;
                this.setState({
                  uiState: { ...uiState, modalDeliver: true },
                  newData: { ...record },
                });
              }}
            />
          </Tooltip>
          <Tooltip title="编辑客户资料">
            <Button
              shape="circle"
              icon="edit"
              onClick={async () => {
                const { uiState } = this.state;
                this.setState({
                  uiState: { ...uiState, isloadingEditModal: true, modalEditUser: true },
                });
                const res = await getUserBasicById(record.id);
                if (res.error || res.errors) return;
                const payload = res.data.userBasicById;

                this.setState({ newUserData: { ...payload } });
                this.setState({
                  uiState: { ...uiState, isloadingEditModal: false, modalEditUser: true },
                });
              }}
            />
          </Tooltip>
          <Tooltip title="添加回访任务">
            <Button shape="circle" icon="smile" />
          </Tooltip>
          <Tooltip title="添加回访记录">
            <Button shape="circle" icon="book" />
          </Tooltip>
          <Tooltip title="添加咨询预约">
            <Button shape="circle" icon="bell" />
          </Tooltip>
          <Tooltip title="发送短信">
            <Button shape="circle" icon="message" />
          </Tooltip>
        </div>
      ),
    },
  ];

  setIsLoad = isLoad => {
    this.setState({ isLoading: isLoad });
  };

  getIsCheck = () => this.dataSource.status;

  componentDidMount = async () => {
    const dic = {
      toHospitalCate: [],
      car: [],
      marriage: [],
      tags: [],
      mainProjects: [],
    };
    this.setIsLoad(true);

    let tempData = await getUsersDetail();
    if (tempData.error || tempData.errors) {
      message.error('发生错误，请刷新重试');
      return;
    }
    tempData = tempData.data.usersDetailWDView.map(item => ({
      key: item.id,
      ...item,
      createdAt: formatTimeTommy(item.createdAt),
    }));
    dic.phoneModel = (await dictionariesMgr.getChildrenByRoot(DictionaryItem.Phone)).filter(
      ele => ele.itemAvailiable === true
    );
    dic.consultations = (await dictionariesMgr.getConsultations()).filter(
      ele => ele.itemAvailiable === true
    );
    dic.consultationsResults = (await dictionariesMgr.getConsultationsResult()).filter(
      ele => ele.itemAvailiable === true
    );
    dic.vipLevel = (await dictionariesMgr.getChildrenByRoot(DictionaryItem.Vips)).filter(
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
    dic.toHospitalCate = await dictionariesMgr.getTohospitalCates();
    dic.car = await dictionariesMgr.getChildrenByRoot(DictionaryItem.Car);
    dic.marriage = await dictionariesMgr.getChildrenByRoot(DictionaryItem.Marriage);
    const temp = (await dictionariesMgr.getMainProjects()).filter(ele => ele.itemAvailiable);
    temp.forEach(ele => {
      const children = dictionariesMgr
        .getChildren(ele.id, ele.itemName)
        .filter(ele2 => ele2.itemAvailiable);
      dic.mainProjects = dic.mainProjects.concat(children);
    });
    const tempTags = (await dictionariesMgr.getTags()).filter(ele => ele.itemAvailiable);
    tempTags.forEach(ele => {
      const children = dictionariesMgr
        .getChildren(ele.id, ele.itemName)
        .filter(ele2 => ele2.itemAvailiable);
      dic.tags = dic.tags.concat(children);
    });

    console.log(tempData);

    this.setState({ dictionary: dic });
    this.setState({ dataSource: tempData });
    this.setIsLoad(false);
  };

  handleOkNewBooking = async () => {
    // TODO：判断是否已有预约
    // ...
    const { newData, uiState, dataSource } = this.state;
    if (typeof newData.assistant === 'undefined' || typeof newData.toHospitalCate === 'undefined') {
      message.error('信息不能为空');
      return;
    }
    newData.bookingStatus = 1;
    newData.time = new Date().toString();
    newData.userId = newData.id;
    const { name, userId } = getUserMgr();
    newData.frontDesk = name;
    newData.frontDeskId = userId;
    const payload = {
      bookingRecord: {
        toHospitalCate: newData.toHospitalCate,
        time: newData.time,
        userId: newData.userId,
        bookingStatus: newData.bookingStatus,
        frontDesk: newData.frontDesk,
        frontDeskId: newData.frontDeskId,
        assistant: newData.assistant,
      },
      consultationRecord: {
        userId: newData.userId,
        advisoryWay: newData.advisoryWay,
        advisoryResult: newData.advisoryResult,
        advisorySummary: newData.advisoryDetail,
        advisoryDetail: newData.advisorySummary,
      },
    };

    const resp = await addBookingRecordWithConsultation(payload);
    if (resp.error || resp.errors) {
      message.error('添加失败');
      return;
    }
    message.success('添加成功');
    const data = dataSource.find(item => item.id === newData.id);
    data.bookingCount += 1;
    data.consultationCount += 1;
    this.setState({ dataSource });
    this.setState({ uiState: { ...uiState, modalDeliver: false } });
  };

  handleOkEditUser = async () => {
    //
    const { newUserData, dataSource, uiState } = this.state;
    const response = await updateUserBasic(newUserData);
    if (response.error || response.errors) {
      message.error('更新客户基本信息失败');
      return;
    }
    const payload = response.data.updateUserBasic;
    message.success('更新客户基本信息成功');
    const data = dataSource.find(item => item.id === payload.id);

    data.name = payload.name;
    data.vipLevel = payload.vipLevel;
    data.sex = payload.sex;
    data.age = payload.age;
    data.where = payload.where;
    data.mainProject = payload.mainProject;
    this.setState({ dataSource });

    this.setState({ uiState: { ...uiState, modalEditUser: false } });
  };

  handleDelete = async record => {
    const { dataSource } = this.state;
    const res = await deleteUser(record);
    if (res.error || res.errors) {
      message.error('删除失败');
      return;
    }
    message.success('删除成功');
    dataSource.splice(dataSource.indexOf(record), 1);

    this.setState({ dataSource: JSON.parse(JSON.stringify(dataSource)) });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  render() {
    const {
      selectedRows,
      dataSource,
      isLoading,
      uiState,
      newData,
      newUserData,
      dictionary,
    } = this.state;
    return (
      <Card>
        <div className={styles.tableList}>
          <Skeleton loading={isLoading}>
            <StandardTable
              scroll={{ x: 1800 }}
              selectedRows={selectedRows}
              dataSource={dataSource}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </Skeleton>
        </div>
        <Modal
          title="快速分诊"
          destroyOnClose
          visible={uiState.modalDeliver}
          onCancel={() => {
            this.setState({ uiState: { ...uiState, modalDeliver: false } });
            this.setState({ newData: {} });
          }}
          onOk={this.handleOkNewBooking}
        >
          <Form layout="inline">
            <Row>
              <Form.Item label="姓名">{newData.name}</Form.Item>
              <Form.Item label="性别">
                {newData.sex === '0'
                  ? formatMessage({ id: 'customerForm.form1000' })
                  : formatMessage({ id: 'customerForm.form1001' })}
              </Form.Item>
              <Form.Item label="主项目">{newData.mainProject}</Form.Item>
            </Row>
            <Row>
              <Form.Item label="来院类别">
                <Select
                  placeholder={newData.toHospitalCate}
                  style={{ width: 150 }}
                  onChange={value => {
                    newData.toHospitalCate = value;
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
                  placeholder={newData.assistant}
                  style={{ width: 150 }}
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
            </Row>
            <Row>
              <Form.Item label="咨询方式">
                <Select
                  style={{ width: 150 }}
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
              <Form.Item label="咨询结果">
                <Select
                  style={{ width: 150 }}
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
              <Form.Item label="咨询小结" />
              <TextArea
                rows="1"
                onChange={e => {
                  newData.advisoryDetail = e.target.value;
                }}
              />
              <Form.Item label="咨询详情" />
              <TextArea
                rows="1"
                onChange={e => {
                  newData.advisorySummary = e.target.value;
                }}
              />
            </Row>
          </Form>
        </Modal>

        <Modal
          title="编辑客户信息"
          destroyOnClose
          width={800}
          visible={uiState.modalEditUser}
          onCancel={() => {
            this.setState({ uiState: { ...uiState, modalEditUser: false } });
            this.setState({ newUserData: {} });
          }}
          onOk={this.handleOkEditUser}
        >
          <Skeleton loading={uiState.isloadingEditModal}>
            <Form layout="vertical" hideRequiredMark>
              <Row gutter={16} style={{ marginBottom: 4 }}>
                <Col span={6}>
                  <Input
                    placeholder={`姓名：${newUserData.name}`}
                    onChange={e => {
                      newUserData.name = e.target.value;
                    }}
                  />
                </Col>
                <Col span={6}>
                  <Select
                    placeholder={`性别:${
                      newUserData.sex === '0'
                        ? formatMessage({ id: 'customerForm.form1000' })
                        : formatMessage({ id: 'customerForm.form1001' })
                    }`}
                    onChange={(value, option) => {
                      newUserData.sex = option.key;
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
                <Col span={6}>
                  <Input
                    type="number"
                    placeholder={`年龄：${newUserData.age}`}
                    onChange={e => {
                      newUserData.age = e.target.value;
                    }}
                  />
                </Col>
                <Col span={6}>
                  <Input
                    placeholder={`手机：${newUserData.mobile}`}
                    onChange={e => {
                      newUserData.mobile = e.target.value;
                    }}
                  />
                </Col>
              </Row>

              <Row gutter={16} style={{ marginBottom: 4 }}>
                <Col span={6}>
                  <Select
                    placeholder={`VipLevel:${newUserData.vipLevel}`}
                    onChange={value => {
                      newUserData.vipLevel = value;
                    }}
                  >
                    {dictionary.vipLevel.map(ele => (
                      <Option key={ele.id} value={ele.itemName}>
                        {ele.itemName}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col span={6}>
                  <Input
                    placeholder={`身份证:${newUserData.idCard}`}
                    onChange={e => {
                      newUserData.idCard = e.target.value;
                    }}
                  />
                </Col>
                <Col span={6}>
                  <Select
                    placeholder={`手机型号:${newUserData.phoneModel}`}
                    onChange={value => {
                      newUserData.phoneModel = value;
                    }}
                  >
                    {dictionary.phoneModel.map(ele => (
                      <Option key={ele.id} value={ele.itemName}>
                        {ele.itemName}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col span={6}>
                  <Input
                    placeholder={`QQ:${newUserData.qq}`}
                    onChange={e => {
                      newUserData.qq = e.target.value;
                    }}
                  />
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: 4 }}>
                <Col span={6}>
                  <Cascader
                    options={dictionary.where}
                    placeholder={`区域:${newUserData.where}`}
                    onChange={value => {
                      newUserData.where = value.toString();
                    }}
                  />
                </Col>
                <Col span={6}>
                  <Input
                    placeholder={`微信：${newUserData.wechat}`}
                    onChange={e => {
                      newUserData.wechat = e.target.value;
                    }}
                  />
                </Col>
                <Col span={6}>
                  <Select
                    placeholder={`婚姻：${newUserData.marriage}`}
                    onChange={value => {
                      newUserData.marriage = value;
                    }}
                  >
                    {dictionary.marriage.map(ele => (
                      <Option key={ele.id} value={ele.itemName}>
                        {ele.itemName}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col span={6}>
                  <Select
                    placeholder={`汽车：${newUserData.carModel}`}
                    onChange={value => {
                      newUserData.carModel = value;
                    }}
                  >
                    {dictionary.car.map(ele => (
                      <Option key={ele.id} value={ele.itemName}>
                        {ele.itemName}
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>

              <Row gutter={16} style={{ marginBottom: 4 }}>
                <Col span={120}>
                  <Select
                    placeholder={`主项目：${newUserData.mainProject}`}
                    mode="multiple"
                    onChange={value => {
                      newUserData.mainProject = value;
                    }}
                  >
                    {dictionary.mainProjects.map(ele => (
                      <Option key={ele.id} value={ele.itemName}>
                        {ele.itemName}
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: 4 }}>
                <Col span={120}>
                  <Select
                    placeholder={`关注项目：${newUserData.focusProject}`}
                    mode="multiple"
                    onChange={value => {
                      newUserData.focusProject = value;
                    }}
                  >
                    {dictionary.mainProjects.map(ele => (
                      <Option key={ele.id} value={ele.itemName}>
                        {ele.itemName}
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: 4 }}>
                <Col span={120}>
                  <Select
                    placeholder={`待开发项目：${newUserData.toBeDevelopedProject}`}
                    mode="multiple"
                    onChange={value => {
                      newUserData.toBeDevelopedProject = value;
                    }}
                  >
                    {dictionary.mainProjects.map(ele => (
                      <Option key={ele.id} value={ele.itemName}>
                        {ele.itemName}
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>
              <Row gutter={20} style={{ marginBottom: 4 }}>
                <Col span={120}>
                  <Select
                    placeholder={`本院已做项目：${newUserData.haveDoneInThisHospital}`}
                    mode="multiple"
                    onChange={value => {
                      newUserData.haveDoneInThisHospital = value;
                    }}
                  >
                    {dictionary.mainProjects.map(ele => (
                      <Option key={ele.id} value={ele.itemName}>
                        {ele.itemName}
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: 4 }}>
                <Col span={120}>
                  <Select
                    placeholder={`他院已做项目：${newUserData.haveDoneInAnotherHospital}`}
                    mode="multiple"
                    onChange={value => {
                      newUserData.haveDoneInAnotherHospital = value;
                    }}
                  >
                    {dictionary.mainProjects.map(ele => (
                      <Option key={ele.id} value={ele.itemName}>
                        {ele.itemName}
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: 4 }}>
                <Col span={120}>
                  <Select
                    placeholder={`客户标签：${newUserData.tag}`}
                    mode="multiple"
                    onChange={value => {
                      newUserData.tag = value;
                    }}
                  >
                    {dictionary.tags.map(ele => (
                      <Option key={ele.id} value={ele.itemName}>
                        {ele.itemName}
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            </Form>
          </Skeleton>
        </Modal>
      </Card>
    );
  }
}

export default CustomerListFD;
