import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Card,
  Form,
  Button,
  Popconfirm,
  Row,
  Input,
  Icon,
  Skeleton,
  Switch,
  Modal,
  Tooltip,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './adMgr.less';

const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

/* eslint react/no-multi-comp:0 */
@connect(({ rule, loading }) => ({
  rule,
  loading: loading.models.rule,
}))
// table list
@Form.create()
class adMgr extends PureComponent {
  state = {
    isLoading: false,
    drawerTitle: '',
    drawerVisiable: false,
    selectedRows: [],
    formValues: {},
    dataSource: [
      {
        key: 0,
        id: '',
        typeName: '',
        plan: '',
        available: false,
        time: '',
        editor: '',
      },
    ],
  };

  // 表格字段们
  columns = [
    {
      title: '广告类别',
      dataIndex: 'typeName',
      sorter: true,
    },
    {
      title: '广告计划',
      dataIndex: 'plan',
      sorter: true,
    },
    {
      title: '可用',
      dataIndex: 'availiable',
      render: (dataIndex, record) => (
        <div>
          <Switch
            defaultChecked={dataIndex}
            onChange={e => this.handleUpdateRow(e, record)}
            loading={false}
          />
        </div>
      ),
    },
    {
      title: '添加时间',
      dataIndex: 'time',
      sorter: true,
    },
    {
      title: '添加者',
      dataIndex: 'editor',
      sorter: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      fixed: 'right',
      width: 100,
      render: () => (
        <div>
          <Tooltip title="编辑" mouseLeaveDelay={0}>
            <Button
              shape="circle"
              icon="edit"
              onClick={() => {
                this.setDrawerTitle('编辑广告类别-计划');
                this.showDrawer();
              }}
            />
          </Tooltip>
          <Popconfirm title="确认删除？">
            <Tooltip title="删除" mouseLeaveDelay={0}>
              <Button shape="circle" icon="delete" />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  setDrawerTitle = title => {
    this.setState({ drawerTitle: title });
  };

  showDrawer = () => {
    this.setState({ drawerVisiable: true });
  };

  onCancle = () => {
    this.setState({ drawerVisiable: false });
  };

  setIsLoad = isLoad => {
    this.setState({ isLoading: isLoad });
  };

  getIsCheck = () => this.dataSource.status;

  componentDidMount = async () => {
    const { dispatch } = this.props;
    this.setIsLoad(true);
    let tempData = await dispatch({ type: 'rule/getAd' });

    let index = -1;
    // eslint-disable-next-line arrow-body-style
    tempData = tempData.map(item => {
      index += 1;
      return {
        key: index,
        id: item.id,
        typeName: item.typeName,
        plan: item.plan,
        availiable: item.availiable,
        // time: item.time,
        // editor: item.editor,
      };
    });
    this.setState({ dataSource: tempData });
    this.setIsLoad(false);
  };

  handleUpdateRow = async (e, record) => {
    console.log(e);
    console.log(record);
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'rule/fetch',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'rule/fetch',
      payload: {},
    });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  render() {
    const { selectedRows, dataSource, isLoading } = this.state;
    return (
      <PageHeaderWrapper>
        <Card>
          <div>
            <Button
              type="primary"
              size="small"
              onClick={() => {
                this.setDrawerTitle('新增广告类别-计划');
                this.showDrawer();
              }}
              style={{ marginBottom: '10px' }}
            >
              <Icon type="plus" />
              新增
            </Button>
            <Modal // eslint-disable-next-line react/destructuring-assignment
              title={this.state.drawerTitle}
              width={320}
              footer={null}
              onCancel={this.onCancle} // eslint-disable-next-line react/destructuring-assignment
              visible={this.state.drawerVisiable}
            >
              <div>
                <Form layout="inline" hideRequiredMark>
                  <Row>
                    <Form.Item label="广告类别">
                      <Input placeholder="广告类别" />
                    </Form.Item>
                  </Row>
                  <Row>
                    <Form.Item label="广告计划">
                      <Input placeholder="广告计划" />
                    </Form.Item>
                  </Row>
                  <Row>
                    <Form.Item label="添加时间">
                      <Input type="date" />
                    </Form.Item>
                  </Row>
                  <Row>
                    <Form.Item label="添加者">
                      <Input placeholder="添加者" />
                    </Form.Item>
                  </Row>

                  <Button type="primary" style={{ marginLeft: '20px' }}>
                    提交
                  </Button>
                  <Button type="danger" style={{ marginLeft: '80px' }}>
                    清除
                  </Button>
                </Form>
              </div>
            </Modal>
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
      </PageHeaderWrapper>
    );
  }
}

export default adMgr;
