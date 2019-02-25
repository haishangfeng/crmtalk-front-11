import React, { PureComponent } from 'react';
import {
  Card,
  Tooltip,
  Popconfirm,
  Button,
  Modal,
  Select,
  message,
  Switch,
  Input,
  Form,
  Row,
  InputNumber,
} from 'antd';
import StandardTable from '@/components/StandardTable';

import { formatMessage } from 'umi/locale';
import styles from './Agency.less';
import { getAgencies, updateAgency, deleteAgency } from '@/services/apollo/apolloTable';
import TextArea from 'antd/lib/input/TextArea';
import dictionariesMgr, { DictionaryItem } from '@/services/dictionariesMgr';
import formatTimeTommy from '@/util';

const { Option } = Select;

class AgencyList extends PureComponent {
  state = {
    newData: {},
    uiState: {
      modalVisiableEdit: false,
    },
    dataSource: [],
    dictionary: {
      agencyType: [],
      agencyLevel: [],
      coStatus: [],
      whereLevel1: [],
      whereLevel2: [],
    },
  };

  // 表格字段们

  columns = [
    {
      title: formatMessage({ id: 'Agency.table.col1' }),
      dataIndex: 'agencyName',
      width: 200,
    },
    {
      title: formatMessage({ id: 'Agency.table.col2' }),
      dataIndex: 'agencyLevel',
      width: 100,
    },
    {
      title: formatMessage({ id: 'Agency.table.col3' }),
      dataIndex: 'agencyType',
      width: 100,
    },
    {
      title: formatMessage({ id: 'Agency.table.col4' }),
      dataIndex: 'whereLevel1',
      width: 100,
    },
    {
      title: formatMessage({ id: 'Agency.table.col5' }),
      dataIndex: 'coStatus',
      width: 100,
    },
    {
      title: formatMessage({ id: 'Agency.table.col6' }),
      dataIndex: 'availiable',
      width: 100,
      render: (dataIndex, record) => (
        <Switch
          defaultChecked={dataIndex}
          loading={false}
          onChange={value => {
            this.handleSwitch(value, record);
          }}
        />
      ),
    },
    {
      width: 100,
      title: formatMessage({ id: 'Agency.table.col7' }),
      dataIndex: 'commission',
    },
    {
      title: formatMessage({ id: 'Agency.table.col8' }),
      dataIndex: 'agencyContact',
      width: 100,
    },
    {
      title: formatMessage({ id: 'Agency.table.col9' }),
      dataIndex: 'contactTel',
      width: 100,
    },
    {
      title: formatMessage({ id: 'Agency.table.col10' }),
      dataIndex: 'introducer',
      width: 100,
    },
    {
      title: formatMessage({ id: 'Agency.table.col11' }),
      dataIndex: 'createdAt',
      width: 100,
    },
    {
      title: formatMessage({ id: 'Agency.table.col12' }),
      dataIndex: 'marketor',
      width: 100,
    },
    {
      title: formatMessage({ id: 'Agency.table.col3' }),
      dataIndex: 'operation',
      width: 80,
      fixed: 'right',
      render: (dataIndex, record) => (
        <div>
          <Tooltip title={formatMessage({ id: 'Agency.operation.operation1' })} mouseLeaveDelay={0}>
            <Button
              shape="circle"
              icon="edit"
              onClick={() => {
                const { uiState } = this.state;
                this.setState({
                  uiState: { ...uiState, modalVisiableEdit: true },
                  newData: record,
                });
              }}
            />
          </Tooltip>
          <Popconfirm
            title={formatMessage({ id: 'Agency.tip.tip1' })}
            onConfirm={() => this.handleDelete(record)}
          >
            <Tooltip
              title={formatMessage({ id: 'Agency.operation.operation2' })}
              mouseLeaveDelay={0}
            >
              <Button shape="circle" icon="delete" />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  componentDidMount = async () => {
    const { dictionary } = this.state;
    const dic = {
      agencyType: [],
      agencyLevel: [],
      coStatus: [],
      whereLevel1: [],
    };
    dic.agencyType = await dictionariesMgr.getChildrenByRoot(DictionaryItem.AgencyType);
    dic.agencyLevel = await dictionariesMgr.getChildrenByRoot(DictionaryItem.AgencyLevel);
    dic.coStatus = await dictionariesMgr.getChildrenByRoot(DictionaryItem.AgencyCoStatus);
    dic.whereLevel1 = await dictionariesMgr.getWheres();
    this.setState({ dictionary: { ...dictionary, ...dic } });

    const tempData = await getAgencies();
    if (tempData.error || tempData.errors) {
      message.error(formatMessage({ id: 'Agency.tip.tip2' }));
      return;
    }
    let payload = tempData.data.agencies;

    payload = payload.map(item => ({
      key: item.id,
      ...item,
      createdAt: formatTimeTommy(item.createdAt),
    }));

    this.setState({ dataSource: payload });
  };

  handleSwitch = async (value, record) => {
    const { dataSource } = this.state;
    const payload = { ...record, availiable: value };

    const respone = await updateAgency(payload);
    if (respone.error || respone.errors) {
      message.error(formatMessage({ id: 'Agency.tip.ti3' }));
      this.setState({ dataSource: [] });
      this.setState({ dataSource });
      return;
    }
    const data = dataSource.find(ele => ele.id === record.id);
    data.availiable = value;
    message.success(formatMessage({ id: 'Agency.tip.tip4' }));
  };

  handleDelete = async record => {
    const { dataSource } = this.state;
    const respone = await deleteAgency(record);
    if (respone.error || respone.errors) {
      message.error(formatMessage({ id: 'Agency.tip.tip5' }));
      return;
    }
    dataSource.splice(dataSource.indexOf(record), 1);
    message.success(formatMessage({ id: 'Agency.tip.tip6' }));
    this.setState({ dataSource: JSON.parse(JSON.stringify(dataSource)) });
  };

  render() {
    const { dataSource, uiState, newData, dictionary } = this.state;
    return (
      <Card>
        <Modal
          title={formatMessage({ id: 'Agency.form.form1' })}
          width={800}
          onCancel={() => {
            this.setState({ uiState: { ...uiState, modalVisiableEdit: false } });
          }}
          visible={uiState.modalVisiableEdit}
          destroyOnClose
          onOk={async () => {
            console.log(newData);
            const result = await updateAgency(newData);
            if (result === 'error') {
              message.error(formatMessage({ id: 'Agency.tip.tip3' }));
              return;
            }
            message.success(formatMessage({ id: 'Agency.tip.tip4' }));
            this.componentDidMount();
            this.setState({ uiState: { ...uiState, modalVisiableEdit: false }, newData: {} });
          }}
        >
          <Form layout="inline" hideRequiredMark>
            <Row>
              <Form.Item label={formatMessage({ id: 'Agency.form.form2' })}>
                <Input
                  value={newData.agencyName}
                  onChange={e => {
                    newData.agencyName = e.target.value;
                    this.setState({ newData: { ...newData } });
                  }}
                />
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'Agency.form.form3' })}>
                <Select
                  value={newData.agencyType}
                  style={{ width: 150 }}
                  onChange={value => {
                    newData.agencyType = value;
                    this.setState({ newData: { ...newData } });
                  }}
                >
                  {dictionary.agencyType.map(ele => (
                    <Option key={ele.id} value={ele.itemName}>
                      {ele.itemName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label={formatMessage({ id: 'Agency.form.form4' })}>
                <Select
                  value={newData.agencyLevel}
                  style={{ width: 150 }}
                  onChange={value => {
                    newData.agencyLevel = value;
                    this.setState({ newData: { ...newData } });
                  }}
                >
                  {dictionary.agencyLevel.map(ele => (
                    <Option key={ele.id} value={ele.itemName}>
                      {ele.itemName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Row>
            <Row>
              <Form.Item label={formatMessage({ id: 'Agency.form.form5' })}>
                <Select
                  value={newData.coStatus}
                  style={{ width: 175 }}
                  onChange={value => {
                    newData.coStatus = value;
                    this.setState({ newData: { ...newData } });
                  }}
                >
                  {dictionary.coStatus.map(ele => (
                    <Option key={ele.id} value={ele.itemName}>
                      {ele.itemName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'Agency.form.form6' })}>
                <Input
                  value={newData.agencyHead}
                  style={{ width: 130 }}
                  onChange={e => {
                    newData.agencyHead = e.target.value;
                    this.setState({ newData: { ...newData } });
                  }}
                />
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'Agency.form.form7' })}>
                <Input
                  value={newData.headTel}
                  style={{ width: 150 }}
                  type="number"
                  onChange={e => {
                    newData.headTel = e.target.value;
                    this.setState({ newData: { ...newData } });
                  }}
                />
              </Form.Item>
            </Row>
            <Row>
              <Form.Item label={formatMessage({ id: 'Agency.form.form8' })}>
                <Input
                  value={newData.agencyContact}
                  style={{ width: 160 }}
                  onChange={e => {
                    newData.agencyContact = e.target.value;
                    this.setState({ newData: { ...newData } });
                  }}
                />
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'Agency.form.form9' })}>
                <Input
                  value={newData.contactTel}
                  style={{ width: 140 }}
                  type="number"
                  onChange={e => {
                    newData.contactTel = e.target.value;
                    this.setState({ newData: { ...newData } });
                  }}
                />
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'Agency.form.form10' })}>
                <Input
                  value={newData.introducer}
                  style={{ width: 150 }}
                  onChange={e => {
                    newData.introducer = e.target.value;
                    this.setState({ newData: { ...newData } });
                  }}
                />
              </Form.Item>
            </Row>
            <Row>
              <Form.Item label={formatMessage({ id: 'Agency.form.form11' })}>
                <Select
                  value={newData.whereLevel1}
                  style={{ width: 150 }}
                  onChange={(value, option) => {
                    newData.whereLevel1 = value;
                    newData.whereLevel2 = '';
                    dictionary.whereLevel2 = dictionariesMgr.getChildren(
                      option.key,
                      formatMessage({ id: 'Agency.form.form11' })
                    );
                    this.setState(dictionary);
                    this.setState({ newData: { ...newData } });
                  }}
                >
                  {dictionary.whereLevel1.map(ele => (
                    <Option key={ele.id} value={ele.itemName}>
                      {ele.itemName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'Agency.form.form12' })}>
                <Select
                  value={newData.whereLevel2}
                  style={{ width: 150 }}
                  onChange={value => {
                    newData.whereLevel2 = value;
                    this.setState({ newData: { ...newData } });
                  }}
                >
                  {dictionary.whereLevel2.map(ele => (
                    <Option key={ele.id} value={ele.itemName}>
                      {ele.itemName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Row>
            <Row>
              <Form.Item label={formatMessage({ id: 'Agency.form.form13' })}>
                <Input
                  value={newData.whereDetail}
                  onChange={e => {
                    newData.whereDetail = e.target.value;
                    this.setState({ newData: { ...newData } });
                  }}
                />
              </Form.Item>
              <Form.Item label={formatMessage({ id: 'Agency.form.form14' })}>
                <InputNumber
                  defaultValue={20}
                  min={0}
                  max={150}
                  value={newData.commission}
                  formatter={value => `${value}%`}
                  parser={value => value.replace('%', '')}
                  onChange={value => {
                    if (value) newData.commission = value;
                    else newData.commission = 0;
                    this.setState({ newData: { ...newData } });
                  }}
                />
              </Form.Item>
            </Row>
            <Row>
              <Form.Item label={formatMessage({ id: 'Agency.form.form15' })}>
                <TextArea
                  rows="1"
                  value={newData.detail}
                  style={{ width: 600 }}
                  onChange={e => {
                    newData.detail = e.target.value;
                    this.setState({ newData: { ...newData } });
                  }}
                />
              </Form.Item>
            </Row>
          </Form>
        </Modal>
        <div className={styles.tableList}>
          <StandardTable
            scroll={{ x: 1300 }}
            selectedRows={[]}
            dataSource={dataSource}
            columns={this.columns}
          />
        </div>
      </Card>
    );
  }
}

export default AgencyList;
