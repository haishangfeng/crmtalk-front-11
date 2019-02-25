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
  Tabs,
  Row,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import { formatMessage } from 'umi/locale';

import styles from './Tag.less';
import dictionariesMgr from '@/services/dictionariesMgr';

const Option = Select.Option;

const TabPane = Tabs.TabPane;

class Consultation extends PureComponent {
  state = {
    isLoading: false,
    dataSourceConsultationWays: [],
    dataSourceConsultationResults: [],
    ConsultationWayRoot: {},
    ConsultationResultRoot: {},
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
    const c = await dictionariesMgr.getConsultations();
    c.sort((a, b) => a.sortIndex - b.sortIndex);
    c.forEach(ele => {
      ele.key = ele.id;
    });

    c.sort((a, b) => b.sortIndex - a.sortIndex);
    const cr = await dictionariesMgr.getConsultationsResult();
    cr.sort((a, b) => a.sortIndex - b.sortIndex);
    cr.forEach(ele => {
      ele.key = ele.id;
    });
    cr.sort((a, b) => b.sortIndex - a.sortIndex);
    const ConsultationWayRoot = dictionariesMgr.dictionaries.find(
      ele => ele.itemParentId === null && ele.rootIndex === -9
    );
    const ConsultationResultRoot = dictionariesMgr.dictionaries.find(
      ele => ele.itemParentId === null && ele.rootIndex === -10
    );
    this.setState({ ConsultationWayRoot, ConsultationResultRoot });

    this.setState({
      dataSourceConsultationWays: c,
      dataSourceConsultationResults: cr,
    });
    this.setIsLoad(false);
  };

  onAddBtnClick = () => {
    this.setState({
      newItemParentName: '',
      newItemName: '',
      newItemParentId: '',
      newItemSecondName: '',
      newItemSortIndex: 0,
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
      newItemParentId: record.itemParentId,
      newItemAvailiable: record.itemAvailiable,
      newItemSortIndex: record.sortIndex,
      newItemPs: record.ps,
      newItemSecondName: record.itemSecondName,
    });
    this.setState({ visibleEditModal: true });
  };

  handleDelete = async record => {
    const { dataSourceConsultationWays } = this.state;
    const result = await dictionariesMgr.deleteDictionary([record]);
    if (result === 'error') {
      message.error('删除失败');
      return;
    }
    message.success('删除成功');
    dataSourceConsultationWays.splice(dataSourceConsultationWays.indexOf(record), 1);

    this.setState({
      dataSourceConsultationWays: JSON.parse(JSON.stringify(dataSourceConsultationWays)),
    });
  };

  handleSwitch = async (value, record) => {
    const { dataSourceConsultationWays } = this.state;
    const result = await dictionariesMgr.updateDictionaryItem({
      id: record.id,
      itemName: record.itemName,
      itemAvailiable: value,
      itemSecondName: record.itemSecondName,
      sortIndex: record.sortIndex,
      ps: record.ps,
    });
    if (result === 'error') {
      message.error('更新失败');
      this.setState({ dataSourceConsultationWays });
      return;
    }
    dataSourceConsultationWays.find(item => item.id === record.id).itemAvailiable = value;
    message.success('更新成功');
    this.setState({ dataSourceConsultationWays });
  };

  // 取消编辑
  handleCancel = () => {
    this.setState({ visibleAddModal: false, visibleEditModal: false });
  };

  // 确定新增
  handleOk = async () => {
    const {
      newItemName,
      newItemParentId,
      newItemParentName,
      newItemSecondName,
      dataSourceConsultationWays,
      dataSourceConsultationResults,
      newItemSortIndex,
    } = this.state;
    if (newItemName.trim() === '' || newItemParentName.trim() === '') {
      message.error('信息不能为空');
      return;
    }
    this.setState({ editNewLoading: true });
    const result = await dictionariesMgr.addDictionary({
      itemName: newItemName,
      itemSecondName: newItemSecondName,
      itemParentId: newItemParentId,
      sortIndex: newItemSortIndex,
    });
    if (result === 'error') {
      message.error('新增失败');
      this.setState({ visibleAddModal: false, editNewLoading: false });
      return;
    }
    result.key = result.id;
    result.itemParentName = newItemParentName;
    message.success('新增成功');
    this.setState({
      visibleAddModal: false,
      editNewLoading: false,
    });
    switch (newItemParentName) {
      case formatMessage({ id: 'dictionary.table.s5' }):
        this.setState({ dataSourceConsultationWays: dataSourceConsultationWays.concat(result) });
        break;
      case formatMessage({ id: 'dictionary.table.s6' }):
        this.setState({
          dataSourceConsultationResults: dataSourceConsultationResults.concat(result),
        });
        break;
      default:
        break;
    }
  };

  handleEditBtn = async () => {
    const {
      newItemId,
      newItemParentId,
      newItemName,
      dataSourceConsultationWays,
      dataSourceConsultationResults,
      newItemParentName,
      newItemAvailiable,
      newItemSortIndex,
      newItemPs,
      newItemSecondName,
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
      this.setState({ dataSourceConsultationWays });
      return;
    }
    let data;
    switch (newItemParentName) {
      case formatMessage({ id: 'dictionary.table.s5' }):
        data = dataSourceConsultationWays.find(item => item.id === newItemId);
        break;
      case formatMessage({ id: 'dictionary.table.s6' }):
        data = dataSourceConsultationResults.find(item => item.id === newItemId);
        break;
      default:
        break;
    }
    data.itemName = newItemName;
    data.itemParentId = newItemParentId;
    data.sortIndex = newItemSortIndex;
    data.itemSecondName = newItemSecondName;
    switch (newItemParentName) {
      case formatMessage({ id: 'dictionary.table.s5' }):
        this.setState({ dataSourceConsultationWays });
        break;
      case formatMessage({ id: 'dictionary.table.s6' }):
        this.setState({ dataSourceConsultationResults });
        break;
      default:
        break;
    }
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
      dataSourceConsultationWays,
      ConsultationWayRoot,
      ConsultationResultRoot,
      isLoading,
      visibleAddModal,
      visibleEditModal,
      editNewLoading,
      newItemParentName,
      newItemSecondName,
      newItemName,
      newItemSortIndex,
      dataSourceConsultationResults,
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
        width: 100,
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
        width: 300,
        sorter: (a, b) => a.craetedAt > b.craetedAt,
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
          title="新增字典"
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
                  <Option key={ConsultationWayRoot.id} value={ConsultationWayRoot.itemName}>
                    {ConsultationWayRoot.itemName}
                  </Option>
                  <Option key={ConsultationResultRoot.id} value={ConsultationResultRoot.itemName}>
                    {ConsultationResultRoot.itemName}
                  </Option>
                </Select>
              </Form.Item>
            </Row>
            <Row>
              <Form.Item label="字典名称">
                <Input onChange={e => this.handleModalInputChange(e.target.value)} />
              </Form.Item>
              <Form.Item label="字典双语别名">
                <Input
                  onChange={e => {
                    this.setState({ newItemSecondName: e.target.value });
                  }}
                />
              </Form.Item>
              <Form.Item label="字典排序：">
                <InputNumber
                  min={0}
                  parser={value => value.replace(/[^0-9]/, '')}
                  defaultValue={newItemSortIndex}
                  onChange={value => this.setState({ newItemSortIndex: value })}
                />
              </Form.Item>
            </Row>
          </Form>
        </Modal>
        <Modal
          title="编辑字典"
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
          <Form layout="inline">
            <Row>
              <Form.Item label="上级">{newItemParentName}</Form.Item>
              <Form.Item label="字典名称">
                <Input
                  value={newItemName}
                  onChange={e => this.handleModalInputChange(e.target.value)}
                />
              </Form.Item>
            </Row>
            <Row>
              <Form.Item label="字典双语别名">
                <Input
                  value={newItemSecondName}
                  onChange={e => this.setState({ newItemSecondName: e.target.value })}
                />
              </Form.Item>
              <Form.Item label="字典排序：">
                <InputNumber
                  min={0}
                  parser={value => value.replace(/[^0-9]/, '')}
                  defaultValue={newItemSortIndex}
                  onChange={value => this.setState({ newItemSortIndex: value })}
                />
              </Form.Item>
            </Row>
          </Form>
        </Modal>

        <Button type="primary" style={{ marginBottom: 10 }} onClick={this.onAddBtnClick}>
          <Icon type="plus" />
          {formatMessage({ id: 'dictionary.table.add' })}
        </Button>

        <Tabs>
          <TabPane tab={formatMessage({ id: 'dictionary.table.s5' })} key="1">
            <div className={styles.tableList}>
              <Skeleton loading={isLoading}>
                <StandardTable
                  selectedRows={[]}
                  dataSource={dataSourceConsultationWays}
                  columns={columns}
                  onSelectRow={this.handleSelectRows}
                  onChange={this.handleStandardTableChange}
                />
              </Skeleton>
            </div>
          </TabPane>
          <TabPane tab={formatMessage({ id: 'dictionary.table.s6' })} key="2">
            <div className={styles.tableList}>
              <Skeleton loading={isLoading}>
                <StandardTable
                  selectedRows={[]}
                  dataSource={dataSourceConsultationResults}
                  columns={columns}
                  onSelectRow={this.handleSelectRows}
                  onChange={this.handleStandardTableChange}
                />
              </Skeleton>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    );
  }
}

export default Consultation;
