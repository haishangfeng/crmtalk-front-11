import React, { PureComponent } from 'react';
import {
  Card,
  Button,
  Popconfirm,
  Select,
  Icon,
  Skeleton,
  Modal,
  Tooltip,
  Collapse,
  Switch,
  message,
  Input,
  Form,
  Row,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import { formatMessage } from 'umi/locale';

import styles from './adminsManage.less';
import {
  getAdmins,
  updateAdmin,
  updateAdminAvailiable,
  getDepartments,
  deleteAdmin,
  apolloSignup,
} from '@/services/apollo/apolloAdmin';
import formatTimeTommy from '@/util';

const { Option } = Select;

class adminsManage extends PureComponent {
  state = {
    departments: [],
    isLoading: false,
    modalVisiableAdd: false,
    modalVisiableEdit: false,
    selectedRows: [],
    // formValues: {},
    newData: {
      availiable: false,
      name: '',
      departmentId: '',
      password: '',
    },
    dataSource: [
      {
        key: 0,
        id: '',
        userName: '',
        name: '',
        departmentName: '',
        availiable: false,
        createdAt: '',
      },
    ],
  };

  // 表格字段们
  columns = [
    {
      title: formatMessage({ id: 'adminguanli.col1' }),
      dataIndex: 'id',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'adminguanli.col2' }),
      dataIndex: 'userName',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'adminguanli.col3' }),
      dataIndex: 'name',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'adminguanli.col4' }),
      dataIndex: 'departmentName',
      sorter: true,
      width: 150,
    },
    {
      title: formatMessage({ id: 'adminguanli.col5' }),
      dataIndex: 'availiable',
      render: (dataIndex, record) => (
        <Switch
          defaultChecked={dataIndex}
          loading={false}
          onChange={value => this.handleSwitch(value, record)}
        />
      ),
      width: 100,
    },
    {
      title: formatMessage({ id: 'adminguanli.col6' }),
      dataIndex: 'createdAt',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'adminguanli.col7' }),
      dataIndex: 'operation',
      fixed: 'right',
      width: 100,
      render: (dataIndex, record) => (
        <div>
          <Tooltip title={formatMessage({ id: 'adminguanli.btn1' })} mouseLeaveDelay={0}>
            <Button shape="circle" icon="edit" onClick={() => this.onEditBtnClick(record)} />
          </Tooltip>
          <Popconfirm
            title={formatMessage({ id: 'adminguanli.btn3' })}
            onConfirm={() => this.handleDelete(record)}
          >
            <Tooltip title={formatMessage({ id: 'adminguanli.btn2' })} mouseLeaveDelay={0}>
              <Button shape="circle" icon="delete" />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  onEditBtnClick = record => {
    const { newData } = this.state;
    this.setState({
      modalVisiableEdit: true,
      newData: { ...record, password: newData.password, departmentId: newData.departmentId },
    });
  };

  onAddBtnClick = () => {
    this.setState({ modalVisiableAdd: true });
  };

  onCancel = () => {
    this.setState({ modalVisiableAdd: false, modalVisiableEdit: false });
  };

  setIsLoad = isLoad => {
    this.setState({ isLoading: isLoad });
  };

  // 组件初始化
  componentDidMount = async () => {
    this.setIsLoad(true);
    let tempData = await getAdmins();
    let tempDepartments = await getDepartments();
    if (tempData.error || tempDepartments.error) {
      message.error('失败请稍后重试');
      return;
    }
    tempData = tempData.data.admins.map(ele => ({
      ...ele,
      key: ele.id,
      createdAt: formatTimeTommy(ele.createdAt),
    }));
    tempDepartments = tempDepartments.data.departments.map(ele => ({
      ...ele,
      key: ele.id,
    }));

    this.setState({ dataSource: tempData, departments: tempDepartments });
    this.setIsLoad(false);
  };

  handleDelete = async record => {
    const { dataSource } = this.state;
    const result = await deleteAdmin(record);
    if (result.error || result.errors) {
      message.error('删除失败');
      return;
    }
    message.success('删除成功');
    dataSource.splice(dataSource.indexOf(record), 1);

    this.setState({ dataSource: JSON.parse(JSON.stringify(dataSource)) });
  };

  handleAdd = async () => {
    const { newData, dataSource } = this.state;
    if (newData.name === '' || newData.password === '' || newData.departmentId === '') {
      message.error('信息不能为空');
      return;
    }

    let result = await apolloSignup(newData);
    result = result.data.signup;

    if (result.error || result.errors) {
      message.error('新增失败');
      return;
    }
    result.key = result.id;
    const tempDataSourceLevel1 = dataSource.concat(result);

    message.success('新增成功');
    this.setState({
      modalVisiableAdd: false,
      dataSource: tempDataSourceLevel1,
      newData: {
        availiable: false,
        name: '',
        departmentId: '',
        password: '',
      },
    });
  };

  handleOkEdit = async () => {
    const { newData, dataSource } = this.state;

    if (newData.password === '' || newData.departmentId === '') {
      message.error('新密码不能为空');
      return;
    }
    const res = await updateAdmin(newData);
    if (res.error || res.errors) {
      message.error('更新失败');
      return;
    }
    const data = dataSource.find(ele => ele.id === newData.id);
    data.name = newData.name;
    data.departmentName = newData.departmentName;
    message.success('更新成功');
    this.setState({
      dataSource,
      modalVisiableEdit: false,
      newData: {
        availiable: false,
        name: '',
        departmentId: '',
        password: '',
      },
    });
  };

  handleSwitch = async (value, record) => {
    const { dataSource } = this.state;
    const res = await updateAdminAvailiable({ id: record.id, availiable: value });

    if (res.error || res.errors) {
      message.error('更新失败');
      this.setState({ dataSource: [] });
      this.setState({ dataSource });
      // this.setState({ dataSource: temp });
      return;
    }
    message.success('更新成功');
    // const res = await updateAdmin({
    //   id: record.id,
    //   name:  record.name,
    //   password:
    //   availiable:
    //   departmentId:  "${args.departmentId}"
    // });
    // if (result === 'error') {
    //   message.error('更新失败');
    //   this.setState({ dataSource });
    //   return;
    // }
    // if (isLevel1) dataSourceLevel1.find(item => item.id === record.id).itemAvailiable = value;
    // else dataSource.find(item => item.id === record.id).itemAvailiable = value;
    // message.success('更新成功');
    // if (isLevel1) this.setState({ dataSourceLevel1 });
    // if (isLevel1) this.setState({ dataSource });
  };

  render() {
    const {
      selectedRows,
      dataSource,
      isLoading,
      modalVisiableAdd,
      modalVisiableEdit,
      newData,
      departments,
    } = this.state;
    return (
      <Collapse defaultActiveKey={['open']}>
        <Collapse.Panel header={formatMessage({ id: 'adminguanli.home' })} key="open">
          <Modal
            title={formatMessage({ id: 'adminguanli.add.home' })}
            width={700}
            onCancel={this.onCancel}
            visible={modalVisiableAdd}
            destroyOnClose
            onOk={this.handleAdd}
          >
            <Form layout="inline">
              <Row>
                <Form.Item label={formatMessage({ id: 'adminguanli.col3' })}>
                  <Input
                    placeholder=""
                    onChange={e => {
                      newData.name = e.target.value;
                    }}
                  />
                </Form.Item>
                <Form.Item label={formatMessage({ id: 'adminguanli.col4' })}>
                  <Select
                    style={{ width: 213 }}
                    onChange={(value, option) => {
                      newData.departmentId = option.key;
                      newData.departmentName = value;
                    }}
                  >
                    {departments.map(ele => (
                      <Option key={ele.id} value={ele.name}>
                        {ele.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Row>
              <Row style={{ marginTop: 10 }}>
                <Form.Item label={formatMessage({ id: 'adminguanli.col2' })}>
                  <Input
                    placeholder=""
                    onChange={e => {
                      newData.userName = e.target.value;
                    }}
                  />
                </Form.Item>
              </Row>
              <Row>
                <Form.Item label={formatMessage({ id: 'adminguanli.edit.form1' })}>
                  <Input
                    onChange={e => {
                      newData.password = e.target.value;
                    }}
                  />
                </Form.Item>
              </Row>
            </Form>
          </Modal>

          <Modal
            title={formatMessage({ id: 'adminguanli.edit.home' })}
            width={700}
            onCancel={this.onCancel}
            visible={modalVisiableEdit}
            onOk={this.handleOkEdit}
            destroyOnClose
          >
            <Form layout="inline">
              <Row>
                <Form.Item label={formatMessage({ id: 'adminguanli.add.form1' })}>
                  <Input
                    value={newData.name}
                    onChange={e => {
                      newData.name = e.target.value;
                      this.setState({ newData: { ...newData } });
                    }}
                  />
                </Form.Item>
                <Form.Item label={formatMessage({ id: 'adminguanli.add.form2' })}>
                  <Select
                    style={{ width: 213 }}
                    onChange={(value, option) => {
                      newData.departmentId = option.key;
                      newData.departmentName = value;
                    }}
                  >
                    {departments.map(ele => (
                      <Option key={ele.id} value={ele.name}>
                        {ele.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Row>
              <Row style={{ marginTop: 10 }}>
                <Form.Item label={formatMessage({ id: 'adminguanli.col2' })}>
                  <div>{newData.userName}</div>
                </Form.Item>
              </Row>
              <Row>
                <Form.Item label={formatMessage({ id: 'adminguanli.edit.form1' })}>
                  <Input
                    placeholder=""
                    onChange={e => {
                      newData.password = e.target.value;
                    }}
                  />
                </Form.Item>
              </Row>
            </Form>
          </Modal>

          <Card>
            <div>
              <Button type="primary" onClick={this.onAddBtnClick} style={{ marginBottom: '10px' }}>
                <Icon type="plus" />
                {formatMessage({ id: 'adminguanli.add' })}
              </Button>
            </div>
            <div className={styles.tableList}>
              <Skeleton loading={isLoading}>
                <StandardTable
                  scroll={{ x: 1000 }}
                  selectedRows={selectedRows}
                  dataSource={dataSource}
                  columns={this.columns}
                  onSelectRow={this.handleSelectRows}
                  onChange={this.handleStandardTableChange}
                />
              </Skeleton>
            </div>
          </Card>
        </Collapse.Panel>
      </Collapse>
    );
  }
}

export default adminsManage;
