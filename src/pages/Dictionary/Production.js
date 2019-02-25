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
  Tabs,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import { formatMessage } from 'umi/locale';

import styles from './Production.less';
import dictionariesMgr from '@/services/dictionariesMgr';

const Option = Select.Option;
const TabPane = Tabs.TabPane;

class Production extends PureComponent {
  state = {
    newData: {},
    newLevel1Item: {},
    level1Root: {},
    visibleLevel1AddModal: false,
    isLoading: false,
    dataSource: [],
    dataSourceLevel1: [],
    visibleAddModal: false,
    visibleEditModal: false,
    editNewLoading: false,
    isLevel1: false,
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
    const dictionary = await dictionariesMgr.getProductions();

    const filters = [];

    dictionary.forEach(element => {
      // eslint-disable-next-line no-param-reassign
      element.key = element.id;
      filters.push({ text: element.itemName, value: element.itemName });
    });

    dictionary.sort((a, b) => b.sortIndex - a.sortIndex);
    this.setState({ dataSourceLevel1: dictionary });

    let dictionaryLevel2 = [];
    dictionary.forEach(ele => {
      // eslint-disable-next-line no-param-reassign
      const children = dictionariesMgr.getChildren(ele.id, ele.itemName);
      children.sort((a, b) => b.sortIndex - a.sortIndex);
      dictionaryLevel2 = dictionaryLevel2.concat(children);
    });
    dictionaryLevel2 = dictionaryLevel2.map(ele => {
      const ps = ele.ps.split(',');
      return {
        ...ele,
        key: ele.id,
        unitPrice: ps[0],
        quantifier: ps[1],
        regularName: ps[2],
        editable: Boolean(ps[3]),
      };
    });

    const productions = dictionariesMgr.dictionaries.find(
      ele => ele.itemParentId === null && ele.rootIndex === -15
    );
    this.setState({ level1Root: productions });

    this.setState({ dataSource: dictionaryLevel2 });
    this.setIsLoad(false);
  };

  onAddBtnClick = () => {
    this.setState({ visibleAddModal: true });
  };

  setIsLoad = isLoad => {
    this.setState({ isLoading: isLoad });
  };

  onEditBtnClick = record => {
    this.setState({
      newData: JSON.parse(JSON.stringify(record)),
      isLevel1: false,
    });
    this.setState({ visibleEditModal: true });
  };

  onEditBtnClickLevel1 = record => {
    this.setState({
      newData: JSON.parse(JSON.stringify(record)),
      isLevel1: true,
    });
    this.setState({ visibleEditModal: true });
  };

  handleDelete = async record => {
    const { dataSource, dataSourceLevel1 } = this.state;
    const result = await dictionariesMgr.deleteDictionary([record]);
    if (result === 'error') {
      message.error('删除失败');
      return;
    }
    message.success('删除成功');
    let arr = dataSource.filter(ele => ele === record || ele.itemParentId === record.id);
    arr = arr.concat(dataSourceLevel1.filter(ele => ele.id === record.id));

    arr.forEach(ele => {
      let index = dataSource.indexOf(ele);
      if (index > -1) dataSource.splice(index, 1);
      index = -1;
      index = dataSourceLevel1.indexOf(ele);
      if (index > -1) dataSourceLevel1.splice(index, 1);
    });

    this.setState({
      dataSource: JSON.parse(JSON.stringify(dataSource)),
      dataSourceLevel1: JSON.parse(JSON.stringify(dataSourceLevel1)),
    });
  };

  handleSwitch = async (value, record, isLevel1) => {
    const { dataSource, dataSourceLevel1 } = this.state;
    const result = await dictionariesMgr.updateDictionaryItem({
      id: record.id,
      itemName: record.itemName,
      itemAvailiable: value,
      sortIndex: record.sortIndex,
      ps: record.ps,
    });
    if (result === 'error') {
      message.error('更新失败');
      this.setState({ dataSource });
      return;
    }
    if (isLevel1) dataSourceLevel1.find(item => item.id === record.id).itemAvailiable = value;
    else dataSource.find(item => item.id === record.id).itemAvailiable = value;
    message.success('更新成功');
    if (isLevel1) this.setState({ dataSourceLevel1 });
    if (isLevel1) this.setState({ dataSource });
  };

  // 气泡会话取消按钮
  handleCancel = () => {
    this.setState({ visibleAddModal: false, visibleEditModal: false, newData: {} });
  };

  // 气泡会话取消按钮
  handleOk = async () => {
    const { newData, dataSource, dataSourceLevel1, isLevel1 } = this.state;

    if (
      newData.itemName &&
      newData.itemParentName &&
      newData.unitPrice &&
      newData.sortIndex >= 0 &&
      newData.quantifier &&
      newData.regularName
    ) {
      //
    } else {
      message.error('信息不能为空');
      return;
    }
    newData.ps = `${newData.unitPrice},${newData.quantifier},${newData.regularName},true`;
    this.setState({ editNewLoading: true });

    const result = await dictionariesMgr.addDictionary({
      itemName: newData.itemName,
      itemParentId: newData.itemParentId,
      itemSecondName: newData.itemSecondName,
      sortIndex: newData.sortIndex,
      ps: isLevel1 ? '' : newData.ps,
    });
    if (result === 'error') {
      message.error('新增失败');
      this.setState({ visibleAddModal: false, editNewLoading: false });
      return;
    }
    result.key = result.id;
    result.itemParentName = newData.itemParentName;
    result.itemSecondName = newData.itemSecondName;
    result.unitPrice = newData.unitPrice;
    result.regularName = newData.regularName;
    result.quantifier = newData.quantifier;
    result.ps = newData.ps;
    result.editable = true;
    result.itemAvailiable = true;
    const tempData = (isLevel1 ? dataSourceLevel1 : dataSource).concat(result);

    message.success('新增成功');
    this.setState({
      visibleAddModal: false,
      editNewLoading: false,
      dataSource: tempData,
      newData: {},
    });
    if (isLevel1) {
      this.setState({
        visibleAddModal: false,
        editNewLoading: false,
        dataSourceLevel1: tempData,
        newData: {},
      });
    }
  };

  handleEditBtn = async isLevel1 => {
    const { newData, dataSource, dataSourceLevel1 } = this.state;
    if (newData.itemName.trim() === '') {
      message.error('信息不能为空');
      return;
    }
    newData.ps = `${newData.unitPrice},${newData.quantifier},${newData.regularName},true`;

    const result = await dictionariesMgr.updateDictionaryItem({
      id: newData.id,
      itemName: newData.itemName,
      itemSecondName: newData.itemSecondName,
      itemAvailiable: newData.itemAvailiable,
      sortIndex: newData.sortIndex,
      ps: isLevel1 ? '' : newData.ps,
    });
    if (result === 'error') {
      message.error('更新失败');
      if (isLevel1) this.setState(dataSourceLevel1);
      else this.setState({ dataSource });
      return;
    }
    if (isLevel1) {
      const data = dataSourceLevel1.find(item => item.id === newData.id);
      data.itemName = newData.itemName;
      data.itemSecondName = newData.itemSecondName;
      data.itemParentId = newData.itemParentId;
      data.sortIndex = newData.sortIndex;
      this.setState(dataSourceLevel1);
      const data2 = dataSource.filter(ele => ele.itemParentId === newData.id);
      data2.forEach(item => {
        // eslint-disable-next-line no-param-reassign
        item.itemParentName = newData.itemName;
      });
      this.setState({ dataSource });
    } else {
      const data = dataSource.find(item => item.id === newData.id);
      data.itemName = newData.itemName;
      data.itemSecondName = newData.itemSecondName;
      data.itemParentId = newData.itemParentId;
      data.sortIndex = newData.sortIndex;
      data.unitPrice = newData.unitPrice;
      data.regularName = newData.regularName;
      data.quantifier = newData.quantifier;
      data.ps = newData.ps;
      this.setState({ dataSource });
    }
    message.success('更新成功');
    this.setState({ visibleEditModal: false, newData: {} });
  };

  handleModalSelectChange = (value, option) => {
    const { newData } = this.state;
    newData.itemParentId = option.key;
    newData.itemParentName = value;

    this.setState({ newData: { ...newData } });
  };

  handleModalInputChange = value => {
    const { newData } = this.state;
    newData.itemName = value;
    this.setState({ newData: { ...newData } });
  };

  render() {
    const {
      dataSourceLevel1,
      dataSource,
      isLoading,
      visibleAddModal,
      visibleEditModal,
      editNewLoading,
      isLevel1,
      newData,
      newLevel1Item,
      visibleLevel1AddModal,
      level1Root,
    } = this.state;

    const filters = [];
    dataSourceLevel1.forEach(ele => {
      filters.push({ text: ele.itemName, value: ele.itemName });
    });

    // 表格字段们
    const columnsLevel1 = [
      {
        title: formatMessage({ id: 'dictionary.table.col1' }),
        dataIndex: 'sortIndex',
        width: 100,
        sorter: (a, b) => a.sortIndex - b.sortIndex,
      },
      {
        title: formatMessage({ id: 'dictionary.table.col2' }),
        dataIndex: 'itemName',
        width: 350,
        ...this.getColumnSearchProps('itemName'),
      },
      {
        title: formatMessage({ id: 'dictionary.table.col3' }),
        dataIndex: 'itemSecondName',
        width: 350,
        ...this.getColumnSearchProps('itemSecondName'),
      },
      {
        width: 100,
        title: formatMessage({ id: 'dictionary.table.col4' }),
        dataIndex: 'itemAvailiable',
        render: (dataIndex, record) => (
          <Switch
            defaultChecked={dataIndex}
            loading={false}
            onChange={value => this.handleSwitch(value, record, true)}
          />
        ),
      },
      {
        title: formatMessage({ id: 'dictionary.table.col5' }),
        dataIndex: 'createdAt',
        width: 350,
      },
      {
        title: formatMessage({ id: 'dictionary.table.col6' }),
        dataIndex: 'operation',
        fixed: 'right',
        width: 150,
        render: (dataIndex, record) => (
          <div style={{ display: 'flex' }}>
            <Button type="primary" onClick={() => this.onEditBtnClickLevel1(record)}>
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

    // 表格字段们
    const columns = [
      {
        title: formatMessage({ id: 'dictionary.table.col1' }),
        dataIndex: 'sortIndex',
        width: 100,
        sorter: (a, b) => a.sortIndex - b.sortIndex,
      },
      {
        title: formatMessage({ id: 'dictionary.table.col7' }),
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
        title: formatMessage({ id: 'dictionary.table.col8' }),
        dataIndex: 'itemParentName',
        width: 250,
        filters,
        onFilter: (value, record) => record.itemParentName === value,
      },
      {
        title: formatMessage({ id: 'dictionary.table.s1' }),
        dataIndex: 'unitPrice',
        width: 200,
      },
      {
        title: formatMessage({ id: 'dictionary.table.s2' }),
        dataIndex: 'editable',
        width: 120,
        render: dataIndex => (
          <div>
            <Switch defaultChecked={dataIndex} loading={false} />
          </div>
        ),
      },
      {
        title: formatMessage({ id: 'dictionary.table.s3' }),
        dataIndex: 'quantifier',
        width: 200,
      },
      {
        title: formatMessage({ id: 'dictionary.table.s4' }),
        dataIndex: 'regularName',
        width: 200,
      },
      {
        title: formatMessage({ id: 'dictionary.table.col4' }),
        dataIndex: 'itemAvailiable',
        width: 120,
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
        width: 600,
      },
      {
        title: formatMessage({ id: 'dictionary.table.col6' }),
        dataIndex: 'operation',
        fixed: 'right',
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
          width={800}
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
          <Form layout="inline">
            <Row>
              <Form.Item label="上级：">
                <Select
                  style={{ width: 120 }}
                  onChange={(value, option) => this.handleModalSelectChange(value, option)}
                >
                  {dataSourceLevel1.map(ele => (
                    <Option key={ele.id} value={ele.itemName}>
                      {ele.itemName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Row>
            <Row>
              <Form.Item label="字典名称：">
                <Input onChange={e => this.handleModalInputChange(e.target.value)} />
              </Form.Item>
              <Form.Item label="字典双语别名">
                <Input
                  value={newData.itemSecondName}
                  onChange={e => {
                    newData.itemSecondName = e.target.value;
                    this.setState({ newData: { ...newData } });
                  }}
                />
              </Form.Item>
              <Form.Item label="字典项排序：">
                <InputNumber
                  min={0}
                  style={{ width: 110 }}
                  parser={value => value.replace(/[^0-9]/, '')}
                  defaultValue={newData.sortIndex}
                  onChange={value => {
                    this.setState({ newData: { ...newData, sortIndex: value } });
                  }}
                />
              </Form.Item>
            </Row>
            {!isLevel1 && (
              <Row>
                <Form.Item label="单价：">
                  <InputNumber
                    style={{ width: 110 }}
                    parser={value => value.replace(/[^0-9]/, '')}
                    onChange={value => {
                      this.setState({ newData: { ...newData, unitPrice: value } });
                    }}
                  />
                </Form.Item>
                <Form.Item label="单位：">
                  <Input
                    style={{ width: 110 }}
                    onChange={e => {
                      this.setState({ newData: { ...newData, quantifier: e.target.value } });
                    }}
                  />
                </Form.Item>
                <Form.Item label="票据名称">
                  <Input
                    style={{ width: 110 }}
                    onChange={e =>
                      this.setState({ newData: { ...newData, regularName: e.target.value } })
                    }
                  />
                </Form.Item>
              </Row>
            )}
          </Form>
        </Modal>
        <Modal
          width={800}
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
              onClick={() => this.handleEditBtn(isLevel1)}
            >
              提交
            </Button>,
          ]}
        >
          <Form layout="inline">
            <Row>
              <Form.Item label="上级：">
                <Select
                  defaultValue={newData.itemParentName}
                  style={{ width: 120 }}
                  onChange={(value, option) => this.handleModalSelectChange(value, option)}
                >
                  {dataSourceLevel1.map(ele => (
                    <Option key={ele.id} value={ele.itemName}>
                      {ele.itemName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Row>
            <Row>
              <Form.Item label="字典名称：">
                <Input
                  defaultValue={newData.itemName}
                  onChange={e => this.handleModalInputChange(e.target.value)}
                />
              </Form.Item>
              <Form.Item label="字典双语别名">
                <Input
                  value={newData.itemSecondName}
                  onChange={e => {
                    newData.itemSecondName = e.target.value;
                    this.setState({ newLevel1Item: { ...newLevel1Item } });
                  }}
                />
              </Form.Item>
              <Form.Item label="字典项排序：">
                <InputNumber
                  min={0}
                  style={{ width: 110 }}
                  parser={value => value.replace(/[^0-9]/, '')}
                  defaultValue={newData.sortIndex}
                  onChange={value => {
                    this.setState({ newData: { ...newData, sortIndex: value } });
                  }}
                />
              </Form.Item>
            </Row>
            {!isLevel1 && (
              <Row>
                <Form.Item label="单价：">
                  <InputNumber
                    defaultValue={newData.unitPrice}
                    style={{ width: 110 }}
                    parser={value => value.replace(/[^0-9]/, '')}
                    onChange={value => {
                      this.setState({ newData: { ...newData, unitPrice: value } });
                    }}
                  />
                </Form.Item>
                <Form.Item label="单位：">
                  <Input
                    defaultValue={newData.quantifier}
                    style={{ width: 110 }}
                    onChange={e => {
                      this.setState({ newData: { ...newData, quantifier: e.target.value } });
                    }}
                  />
                </Form.Item>
                <Form.Item label="票据名称">
                  <Input
                    defaultValue={newData.regularName}
                    style={{ width: 110 }}
                    onChange={e =>
                      this.setState({ newData: { ...newData, regularName: e.target.value } })
                    }
                  />
                </Form.Item>
              </Row>
            )}
          </Form>
        </Modal>
        <Tabs>
          <TabPane tab={formatMessage({ id: 'dictionary.yiji' })} key="1">
            <div className={styles.tableList}>
              <Skeleton loading={isLoading}>
                <div style={{ display: 'flex' }}>
                  <h2>{formatMessage({ id: 'dictionary.erji' })}</h2>
                  <Button
                    type="primary"
                    style={{ marginLeft: '10px' }}
                    onClick={() => {
                      this.setState({
                        isLevel1: true,
                        visibleLevel1AddModal: true,
                        newLevel1Item: { sortIndex: 0, itemParentId: level1Root.id },
                      });
                    }}
                  >
                    <Icon type="plus" />
                    {formatMessage({ id: 'dictionary.table.add' })}
                  </Button>
                </div>
                <StandardTable
                  selectedRows={[]}
                  dataSource={dataSourceLevel1}
                  columns={columnsLevel1}
                  onSelectRow={this.handleSelectRows}
                  onChange={this.handleStandardTableChange}
                />
              </Skeleton>
            </div>
          </TabPane>
          <TabPane tab={formatMessage({ id: 'dictionary.erji' })} key="2">
            <div className={styles.tableList}>
              <div style={{ display: 'flex' }}>
                <h2>{formatMessage({ id: 'dictionary.erji' })}</h2>
                <Button
                  type="primary"
                  style={{ marginLeft: '10px' }}
                  onClick={() => {
                    this.setState({ visibleAddModal: true, isLevel1: false });
                  }}
                >
                  <Icon type="plus" />
                  {formatMessage({ id: 'dictionary.table.add' })}
                </Button>
              </div>
              <Skeleton loading={isLoading}>
                <StandardTable
                  selectedRows={[]}
                  dataSource={dataSource}
                  columns={columns}
                  onSelectRow={this.handleSelectRows}
                  onChange={this.handleStandardTableChange}
                />
              </Skeleton>
            </div>
          </TabPane>
        </Tabs>

        <Modal
          title="新增一级字典项"
          visible={visibleLevel1AddModal}
          destroyOnClose
          width={800}
          onCancel={() => {
            this.setState({
              visibleLevel1AddModal: false,
            });
          }}
          onOk={async () => {
            if (
              newLevel1Item.itemName &&
              newLevel1Item.sortIndex !== null &&
              newLevel1Item.itemSecondName
            ) {
              const resp = await dictionariesMgr.addDictionary(newLevel1Item);
              if (resp.error || resp.errors) {
                message.error('添加失败');
                return;
              }
              message.success('添加成功');
              resp.key = resp.id;
              dataSourceLevel1.push(resp);
              this.setState({ dataSourceLevel1, visibleLevel1AddModal: false, newLevel1Item: {} });
            } else {
              message.error('信息不能为空');
            }
          }}
        >
          <Form layout="inline">
            <Row>
              <Form.Item label="上级">{level1Root.itemName}</Form.Item>
            </Row>
            <Form.Item label="字典项名称">
              <Input
                value={newLevel1Item.itemName}
                onChange={e => {
                  newLevel1Item.itemName = e.target.value;
                  this.setState({ newLevel1Item: { ...newLevel1Item } });
                }}
              />
            </Form.Item>
            <Form.Item label="字典双语别名">
              <Input
                value={newLevel1Item.itemSecondName}
                onChange={e => {
                  newLevel1Item.itemSecondName = e.target.value;
                  this.setState({ newLevel1Item: { ...newLevel1Item } });
                }}
              />
            </Form.Item>
            <Form.Item label="字典项排序：">
              <InputNumber
                min={0}
                parser={value => value.replace(/[^0-9]/, '')}
                value={newLevel1Item.sortIndex}
                onChange={value => {
                  if (value) newLevel1Item.sortIndex = value;
                  else newLevel1Item.sortIndex = 0;
                  this.setState({ newLevel1Item: { ...newLevel1Item } });
                }}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    );
  }
}

export default Production;
