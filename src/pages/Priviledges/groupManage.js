import React, { PureComponent } from 'react';
import {
  Card,
  Form,
  Button,
  Popconfirm,
  Icon,
  Skeleton,
  Modal,
  Tooltip,
  Collapse,
  message,
  Input,
  Select,
  Row,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import { formatMessage } from 'umi/locale';

import CheckboxGroup from 'antd/lib/checkbox/Group';
import styles from './groupManage.less';
import {
  getDepartments,
  deleteDepartments,
  updateDepartments,
  addDepartments,
} from '@/services/apollo/apolloAdmin';
import { numberOfPrivledge } from '@/locales/zh-CN/Priviledge/groupManage';
import formatTimeTommy from '@/util';

const { Option } = Select;

class GroupManage extends PureComponent {
  state = {
    isLoading: false,
    modalVisiableAdd: false,
    modalVisiableEdit: false,
    selectedRows: [],
    newData: {
      key: 0,
      id: '',
      name: '',
      routePages: [],
      parentId: '',
    },
    dataSource: [],
    optionsPriviledge: [],
  };

  // 表格字段们
  columns = [
    {
      title: formatMessage({ id: 'priviledge.groupManage.table.col1' }),
      dataIndex: 'id',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'priviledge.groupManage.table.col2' }),
      dataIndex: 'name',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'priviledge.groupManage.table.col3' }),
      dataIndex: 'parentName',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'priviledge.groupManage.table.col4' }),
      dataIndex: 'createdAt',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'priviledge.groupManage.table.col5' }),
      dataIndex: 'operation',
      fixed: 'right',
      width: 100,
      render: (dataIndex, record) => (
        <div>
          <Tooltip
            title={formatMessage({ id: 'priviledge.groupManage.table.edit.btn1' })}
            mouseLeaveDelay={0}
          >
            <Button shape="circle" icon="edit" onClick={() => this.onEditBtnClick(record)} />
          </Tooltip>
          <Popconfirm
            title={formatMessage({ id: 'priviledge.groupManage.table.delete.home' })}
            onConfirm={() => this.handleDelete(record)}
          >
            <Tooltip title={formatMessage({ id: 'priviledge.groupManage.table.delete.btn2' })}>
              <Button shape="circle" icon="delete" />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  onEditBtnClick = record => {
    this.setState({
      modalVisiableEdit: true,
      newData: { ...record },
    });
  };

  onAddBtnClick = () => {
    this.setState({ modalVisiableAdd: true, newData: {} });
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
    let tempData = (await getDepartments()).data.departments;
    tempData = tempData.map(ele => {
      return {
        ...ele,
        parentName: ele.parentId ? tempData.find(item => item.id === ele.parentId).name : '',
        key: ele.id,
        createdAt: formatTimeTommy(ele.createdAt),
      };
    });

    this.setState({ dataSource: tempData });

    const options = [];
    for (let i = 0; i < numberOfPrivledge; i += 1) {
      options.push({
        label: `${formatMessage({ id: `priviledge.groupManage.quanxian${i}` })}`,
        value: i,
      });
    }
    this.setState({ optionsPriviledge: options });
    this.setIsLoad(false);
  };

  handleDelete = async record => {
    const { dataSource } = this.state;
    const res = await deleteDepartments(record);

    if (res.error || res.errors) {
      message.error('删除失败');
      return;
    }
    message.success('删除成功');
    dataSource.splice(dataSource.indexOf(record), 1);

    this.setState({ dataSource: JSON.parse(JSON.stringify(dataSource)) });
  };

  handleAdd = async () => {
    const { newData, dataSource } = this.state;
    if (newData.name === '' || newData.parentId === '') {
      message.error('信息不能为空');
      return;
    }

    let res = await addDepartments(newData);

    if (res.error || res.errors) {
      message.error('新增失败');
      return;
    }
    res = res.data.addDepartment;

    res.parentName = dataSource.find(item => item.id === res.parentId).name;
    res.key = res.id;
    const tempDataSourceLevel1 = dataSource.concat(res);

    message.success('新增成功');
    this.setState({
      modalVisiableAdd: false,
      dataSource: tempDataSourceLevel1,
      newData: {
        key: 0,
        id: '',
        name: '',
        routePages: [],
      },
    });
  };

  handleOkEdit = async () => {
    const { newData, dataSource } = this.state;

    if (newData.name === '' || newData.parentId === '') {
      message.error('信息不能为空');
      return;
    }
    console.log(newData);
    const res = await updateDepartments(newData);

    if (res.error || res.errors) {
      message.error('更新失败');
      return;
    }
    const data = dataSource.find(ele => ele.id === newData.id);
    data.name = newData.name;
    data.routePages = newData.routePages;
    message.success('更新成功');
    this.setState({
      dataSource,
      modalVisiableEdit: false,
      newData: {
        key: 0,
        id: '',
        name: '',
        routePages: [],
      },
    });
  };

  render() {
    const {
      selectedRows,
      dataSource,
      isLoading,
      modalVisiableAdd,
      modalVisiableEdit,
      newData,
      optionsPriviledge,
    } = this.state;
    return (
      <Collapse defaultActiveKey={['open']}>
        <Collapse.Panel header={formatMessage({ id: 'priviledge.groupManage.home' })} key="open">
          <Modal
            title={formatMessage({ id: 'priviledge.groupManage.table.add.home' })}
            width={1000}
            onCancel={this.onCancel}
            visible={modalVisiableAdd}
            destroyOnClose
            onOk={this.handleAdd}
          >
            <Form layout="inline">
              <Row>
                <Form.Item label={formatMessage({ id: 'priviledge.groupManage.table.col2' })}>
                  <Input
                    placeholder={newData.name}
                    onChange={e => {
                      newData.name = e.target.value;
                    }}
                  />
                </Form.Item>
                <Form.Item label={formatMessage({ id: 'priviledge.groupManage.table.col3' })}>
                  <Select
                    style={{ width: 180 }}
                    placeholder={newData.plan}
                    onChange={(value, option) => {
                      newData.parentId = option.key;
                    }}
                  >
                    {dataSource.map(ele => (
                      <Option key={ele.id} value={ele.name}>
                        {ele.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Row>
              <Form.Item label={formatMessage({ id: 'priviledge.groupManage.table.add.shouquan' })}>
                <CheckboxGroup
                  options={optionsPriviledge}
                  defaultValue={newData.routePages}
                  onChange={checkedValue => {
                    newData.routePages = checkedValue;
                  }}
                />
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title={formatMessage({ id: 'priviledge.groupManage.table.edit.home' })}
            width={1000}
            onCancel={this.onCancel}
            visible={modalVisiableEdit}
            onOk={this.handleOkEdit}
            destroyOnClose
          >
            <Form layout="inline">
              <Row>
                <Form.Item label={formatMessage({ id: 'priviledge.groupManage.table.col2' })}>
                  <Input
                    value={newData.name}
                    onChange={e => {
                      newData.name = e.target.value;
                      this.setState({ newData: { ...newData } });
                    }}
                  />
                </Form.Item>
              </Row>
              <Form.Item label={formatMessage({ id: 'priviledge.groupManage.table.add.shouquan' })}>
                <CheckboxGroup
                  options={optionsPriviledge}
                  defaultValue={newData.routePages}
                  onChange={checkedValue => {
                    newData.routePages = checkedValue;
                  }}
                />
              </Form.Item>
            </Form>
          </Modal>

          <Card>
            <div>
              <Button type="primary" onClick={this.onAddBtnClick} style={{ marginBottom: '10px' }}>
                <Icon type="plus" />
                {formatMessage({ id: 'priviledge.groupManage.table.add' })}
              </Button>
            </div>
            <div className={styles.tableList}>
              <Skeleton loading={isLoading}>
                <StandardTable
                  scroll={{ x: 800 }}
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

export default GroupManage;
