/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
import React, { PureComponent } from 'react';
import {
  Card,
  Form,
  Button,
  Popconfirm,
  Icon,
  Skeleton,
  Switch,
  Modal,
  Input,
  Select,
  message,
  InputNumber,
  Row,
} from 'antd';
import StandardTable from '@/components/StandardTable';

import { formatMessage } from 'umi/locale';

import styles from './ToHospitalCate.less';
import dictionariesMgr from '@/services/dictionariesMgr';

const Option = Select.Option;

class Consultation extends PureComponent {
  state = {
    isLoading: false,
    dataSource: [],
    dataSourceRoot: {},
    newItemId: '',
    newItemName: '',
    newItemSecondName: '',
    newItemParentId: '',
    newItemParentName: '',
    newItemSortIndex: 0,
    newItemPs: '',
    newItemAvailiable: false,
    visibleAddModal: false,
    visibleEditModal: false,
    editNewLoading: false,
  };

  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div
        style={{
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0, 0, 0, .15',
          padding: 8,
          borderRadius: 4,
        }}
      >
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
          Reset
        </Button>
      </div>
    ),
    filterIcon: filtered => (
      <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: text => {
      const { searchText } = this.state;
      return <div>{text}</div>;
    },
  });

  handleSearch = (selectedKeys, confirm) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: '' });
  };

  componentDidMount = async () => {
    this.setIsLoad(true);
    const dictionary = await dictionariesMgr.getTohospitalCates();
    const dataSourceRoot = dictionariesMgr.dictionaries.find(
      ele => ele.itemParentId === null && ele.rootIndex === -12
    );

    dictionary.sort((a, b) => b.sortIndex - a.sortIndex);
    this.setState({ dataSourceRoot });

    dictionary.forEach(ele => {
      ele.key = ele.id;
    });

    this.setState({ dataSource: dictionary });
    this.setIsLoad(false);
  };

  onAddBtnClick = () => {
    this.setState({
      newItemParentName: '',
      newItemName: '',
      newItemParentId: '',
      newItemSecondName: '',
    });
    this.setState({ visibleAddModal: true });
  };

  setIsLoad = isLoad => {
    this.setState({ isLoading: isLoad });
  };

  onEditBtnClick = record => {
    this.setState({
      newItemId: record.id,
      newItemParentName: record.itemParentName,
      newItemName: record.itemName,
      newItemSecondName: record.itemSecondName,
      newItemParentId: record.itemParentId,
      newItemAvailiable: record.itemAvailiable,
      newItemSortIndex: record.sortIndex,
      newItemPs: record.ps,
    });
    this.setState({ visibleEditModal: true });
  };

  handleDelete = async record => {
    const { dataSource } = this.state;
    const result = await dictionariesMgr.deleteDictionary([record]);
    if (result === 'error') {
      message.error('删除失败');
      return;
    }
    message.success('删除成功');
    dataSource.splice(dataSource.indexOf(record), 1);

    this.setState({ dataSource: JSON.parse(JSON.stringify(dataSource)) });
  };

  handleSwitch = async (value, record) => {
    const { dataSource } = this.state;
    const result = await dictionariesMgr.updateDictionaryItem({
      id: record.id,
      itemName: record.itemName,
      itemSecondName: record.itemSecondName,
      itemAvailiable: value,
      sortIndex: record.sortIndex,
      ps: record.ps,
    });
    if (result === 'error') {
      message.error('更新失败');
      this.setState({ dataSource });
      return;
    }
    dataSource.find(item => item.id === record.id).itemAvailiable = value;
    message.success('更新成功');
    this.setState({ dataSource });
  };

  // 气泡会话取消按钮
  handleCancel = () => {
    this.setState({ visibleAddModal: false, visibleEditModal: false });
  };

  // 气泡会话取消按钮
  handleOk = async () => {
    const {
      newItemName,
      newItemParentId,
      newItemParentName,
      newItemSecondName,
      dataSource,
      newItemSortIndex,
    } = this.state;
    if (newItemName.trim() === '' || newItemParentName.trim() === '') {
      message.error('信息不能为空');
      return;
    }
    this.setState({ editNewLoading: true });
    const result = await dictionariesMgr.addDictionary({
      itemName: newItemName,
      itemParentId: newItemParentId,
      itemSecondName: newItemSecondName,
      sortIndex: newItemSortIndex,
    });
    if (result === 'error') {
      message.error('新增失败');
      this.setState({ visibleAddModal: false, editNewLoading: false });
      return;
    }
    result.key = result.id;
    result.itemParentName = newItemParentName;
    const temp = dataSource.concat(result);

    message.success('新增成功');
    this.setState({
      visibleAddModal: false,
      editNewLoading: false,
      dataSource: temp,
    });
  };

  handleEditBtn = async () => {
    const {
      newItemId,
      newItemParentId,
      newItemName,
      newItemSecondName,
      dataSource,
      newItemAvailiable,
      newItemSortIndex,
      newItemPs,
    } = this.state;
    if (newItemName.trim() === '') {
      message.error('信息不能为空');
      return;
    }
    const result = await dictionariesMgr.updateDictionaryItem({
      id: newItemId,
      itemName: newItemName,
      itemSecondName: newItemSecondName,
      itemAvailiable: newItemAvailiable,
      sortIndex: newItemSortIndex,
      ps: newItemPs,
    });
    if (result === 'error') {
      message.error('更新失败');
      this.setState({ dataSource });
      return;
    }
    const data = dataSource.find(item => item.id === newItemId);
    data.itemName = newItemName;
    data.itemSecondName = newItemSecondName;
    data.itemParentId = newItemParentId;
    data.sortIndex = newItemSortIndex;
    this.setState({ dataSource });
    message.success('更新成功');
    this.setState({ visibleEditModal: false });
  };

  handleModalSelectChange = (value, option) => {
    this.setState({ newItemParentId: option.key, newItemParentName: value });
  };

  handleModalInputChange = value => {
    this.setState({ newItemName: value });
  };

  render() {
    const {
      dataSource,
      dataSourceRoot,
      isLoading,
      visibleAddModal,
      visibleEditModal,
      editNewLoading,
      newItemParentName,
      newItemSecondName,
      newItemName,
      newItemSortIndex,
    } = this.state;
    // 表格字段们
    const columns = [
      {
        title: formatMessage({ id: 'dictionary.table.col1' }),
        dataIndex: 'sortIndex',
        width: 100,
        sorter: (a, b) => a.sortIndex - b.sortIndex,
      },
      {
        title: formatMessage({ id: 'dictionary.table.col2' }),
        dataIndex: 'itemName',
        width: 200,
        ...this.getColumnSearchProps('itemName'),
      },
      {
        title: formatMessage({ id: 'dictionary.table.col3' }),
        dataIndex: 'itemSecondName',
        width: 200,
        ...this.getColumnSearchProps('itemSecondName'),
      },
      {
        title: formatMessage({ id: 'dictionary.table.col4' }),
        dataIndex: 'itemAvailiable',
        render: (dataIndex, record) => (
          <div>
            <Switch
              defaultChecked={dataIndex}
              loading={false}
              onChange={value => this.handleSwitch(value, record, false)}
            />
          </div>
        ),
      },
      {
        title: formatMessage({ id: 'dictionary.table.col5' }),
        dataIndex: 'createdAt',
        width: 500,
        sorter: (a, b) => Date.parse(a.craetedAt) < Date.parse(b.craetedAt),
      },
      {
        title: formatMessage({ id: 'dictionary.table.col6' }),
        dataIndex: 'operation',
        width: 150,
        render: (dataIndex, record) => (
          <div style={{ display: 'flex' }}>
            <Button type="primary" onClick={() => this.onEditBtnClick(record)}>
              {formatMessage({ id: 'dictionary.table.edit' })}
              <Icon type="edit" />
            </Button>
            <div style={{ marginLeft: 10 }} />
            <Popconfirm
              title={formatMessage({ id: 'dictionary.table.deleteconfirm' })}
              onConfirm={() => {
                this.handleDelete(record);
              }}
            >
              <Button type="primary">
                {formatMessage({ id: 'dictionary.table.delete' })}
                <Icon type="delete" />
              </Button>
            </Popconfirm>
          </div>
        ),
      },
    ];

    return (
      <Card>
        <Modal
          title="新增字典项"
          visible={visibleAddModal}
          cancelButtonDisabled
          destroyOnClose
          width={800}
          onCancel={this.handleCancel}
          maskClosable={!editNewLoading}
          footer={[
            <Button key="back" onClick={this.handleCancel} disabled={editNewLoading}>
              返回
            </Button>,
            <Button key="submit" type="primary" loading={editNewLoading} onClick={this.handleOk}>
              提交
            </Button>,
          ]}
        >
          <Form layout="inline">
            <Row>
              <Form.Item label="上级">
                <Select
                  style={{ width: 120 }}
                  onChange={(value, option) => this.handleModalSelectChange(value, option)}
                >
                  <Option key={dataSourceRoot.id}>{dataSourceRoot.itemName}</Option>
                </Select>
              </Form.Item>
            </Row>
            <Form.Item label="字典项名称">
              <Input onChange={e => this.handleModalInputChange(e.target.value)} />
            </Form.Item>
            <Form.Item label="字典双语别名">
              <Input
                value={newItemSecondName}
                onChange={e => this.setState({ newItemSecondName: e.target.value })}
              />
            </Form.Item>
            <Form.Item label="字典项排序：">
              <InputNumber
                min={0}
                parser={value => value.replace(/[^0-9]/, '')}
                defaultValue={newItemSortIndex}
                onChange={value => this.setState({ newItemSortIndex: value })}
              />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="编辑字典项"
          visible={visibleEditModal}
          cancelButtonDisabled
          destroyOnClose
          width={800}
          onCancel={this.handleCancel}
          maskClosable={!editNewLoading}
          footer={[
            <Button key="back" onClick={this.handleCancel} disabled={editNewLoading}>
              返回
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={editNewLoading}
              onClick={() => this.handleEditBtn()}
            >
              提交
            </Button>,
          ]}
        >
          <Form layout="inline">
            <Row>
              <Form.Item label="上级">{newItemParentName}</Form.Item>
            </Row>
            <Form.Item label="字典项名称">
              <Input
                value={newItemName}
                onChange={e => this.handleModalInputChange(e.target.value)}
              />
            </Form.Item>
            <Form.Item label="字典双语别名">
              <Input
                value={newItemSecondName}
                onChange={e => this.setState({ newItemSecondName: e.target.value })}
              />
            </Form.Item>
            <Form.Item label="字典项排序：">
              <InputNumber
                min={0}
                parser={value => value.replace(/[^0-9]/, '')}
                defaultValue={newItemSortIndex}
                onChange={value => this.setState({ newItemSortIndex: value })}
              />
            </Form.Item>
          </Form>
        </Modal>
        {/*
        <Modal
          title="新增字典项"
          visible={visibleAddModal}
          cancelButtonDisabled
          destroyOnClose
          onCancel={this.handleCancel}
          maskClosable={!editNewLoading}
          footer={[
            <Button key="back" onClick={this.handleCancel} disabled={editNewLoading}>
              返回
            </Button>,
            <Button key="submit" type="primary" loading={editNewLoading} onClick={this.handleOk}>
              提交
            </Button>,
          ]}
        >
          <h4>上级：</h4>
          <Select
            placeholder="请选择分类"
            style={{ width: 120 }}
            onChange={(value, option) => this.handleModalSelectChange(value, option)}
          >
            <Option key={dataSourceRoot.id}>{dataSourceRoot.itemName}</Option>
          </Select>
          <br />
          <h4>字典项名称：</h4>
          <Input
            placeholder="输入字典项的名称"
            onChange={e => this.handleModalInputChange(e.target.value)}
          />
          <br />
          <h4>字典项排序：</h4>
          <InputNumber
            min={0}
            parser={value => value.replace(/[^0-9]/, '')}
            defaultValue={newItemSortIndex}
            onChange={value => this.setState({ newItemSortIndex: value })}
          />
        </Modal>
        <Modal
          title="编辑字典项"
          visible={visibleEditModal}
          cancelButtonDisabled
          destroyOnClose
          onCancel={this.handleCancel}
          maskClosable={!editNewLoading}
          footer={[
            <Button key="back" onClick={this.handleCancel} disabled={editNewLoading}>
              返回
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={editNewLoading}
              onClick={() => this.handleEditBtn()}
            >
              提交
            </Button>,
          ]}
        >
          <h4>上级：</h4>
          <h4>{newItemParentName}</h4>
          <br />
          <h4>字典项名称：</h4>
          <Input
            placeholder={newItemName}
            onChange={e => this.handleModalInputChange(e.target.value)}
          />
          <br />
          <h4>字典项排序：</h4>
          <InputNumber
            min={0}
            parser={value => value.replace(/[^0-9]/, '')}
            defaultValue={newItemSortIndex}
            onChange={value => this.setState({ newItemSortIndex: value })}
          />
        </Modal> */}

        <div className={styles.tableList}>
          <Skeleton loading={isLoading}>
            <div style={{ display: 'flex' }}>
              <h2>{formatMessage({ id: 'dictionary.yiji' })}</h2>
              <Button type="primary" style={{ marginLeft: '10px' }} onClick={this.onAddBtnClick}>
                <Icon type="plus" />
                {formatMessage({ id: 'dictionary.table.add' })}
              </Button>
            </div>
            <StandardTable
              scroll={{ x: 200 }}
              selectedRows={[]}
              dataSource={dataSource}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </Skeleton>
        </div>
      </Card>
    );
  }
}

export default Consultation;
