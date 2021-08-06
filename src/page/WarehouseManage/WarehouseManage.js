import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Form, Row, Col, Input, Select, Button, message } from "antd";
import axios from "axios";
import "./WarehouseManage.scss";

import { SwipeAction, List, Modal } from 'antd-mobile';

const alert = Modal.alert;


const { Option } = Select;

class WarehouseManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      exportLoading: false,
      searchLoading: false,
      storageRoomId: sessionStorage.getItem('StorageRoomId'),
      houseCode: "",
      isNull: "-1",
      page: 1,
      listData: [],
      storageRoomList: [],
      showMore: false, // 是否显示加载更多
      isEmpty: false, // 是否显示加载完毕无更多数据
      loadingComplete: true // 上一次加载更多是否已经完成
    };
  }

  componentDidMount() {
    // 列表请求
    this.requestData()
    // 库房数据
    this.requestStorageRoomList()

    window.addEventListener('scroll', function () {
      const sH = document.documentElement.scrollHeight;
      const sT = document.documentElement.scrollTop || document.body.scrollTop;
      const oH = document.documentElement.offsetHeight || document.body.offsetHeight;
      if (sH === sT + oH && this.state.showMore) {
        this.loadingMore()
      }
    }.bind(this), false);
  };

  requestData = () => {
    window.scrollTo(0, 0);
    this.setState({
      page: 1
    }, () => {
      const { storageRoomId, houseCode, isNull, page } = this.state
      this.setState({ searchLoading: true });
      axios
        .get("/Stock/GetStorehouse", {
          params: {
            storageRoomId,
            houseCode,
            isNull,
            page
          }
        })
        .then(res => {
          this.setState({ searchLoading: false });
          if (res.Code === 0) {
            this.setState({
              listData: res.Data
            }, () => {
              const sH = document.documentElement.scrollHeight;
              const oH = document.documentElement.offsetHeight || document.body.offsetHeight;
              this.setState({
                isEmpty: false,
                showMore: sH > oH
              })
            })
          } else {
            message.error(res.Msg)
          }
        })
        .catch(error => {
          this.setState({ searchLoading: false });
          console.log(error)
        })
    })
  };

  // 请求对应库房数据
  requestStorageRoomList() {
    axios
      .get("/stock/GetStorageRooms")
      .then(res => {
        if (res.Code === 0) {
          this.setState({
            storageRoomList: res.Data
          })
        } else {
          message.error(res.Msg);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  // 加载更多
  loadingMore = () => {
    if (!this.state.loadingComplete) return
    this.setState({
      page: this.state.page + 1,
      loadingComplete: false
    }, () => {
      const { storageRoomId, houseCode, isNull, page, listData } = this.state
      axios
        .get("/Stock/GetStorehouse", {
          params: {
            storageRoomId,
            houseCode,
            isNull,
            page
          }
        })
        .then(res => {
          if (res.Code === 0) {
            if (res.Data && res.Data.length > 0) {
              this.setState({
                listData: listData.concat(res.Data),
                loadingComplete: true
              })
            } else {
              this.setState({
                showMore: false,
                isEmpty: true,
                loadingComplete: true
              })
            }
          } else {
            message.error(res.Msg)
          }
        })
        .catch(error => {
          console.log(error)
        })
    })
  };

  // 输入框改变
  inputHandle(e, key) {
    this.setState({
      [key]: e.target.value.trim()
    });
  };

  // 编辑
  onEdit = (item) => {
    this.props.history.push({pathname: '/addWareHouse/update', query: {...item, type: 'update'}})
  };

  // 删除
  onDelete = (item) => {
    alert('提示', <div>确认删除？</div>, [
      { text: '取消', onPress: () => console.log('关闭弹窗') },
      {
        text: '删除', onPress: () => {
          axios
            .post("/stock/DelStorehouse", {
              StorehouseId: item.StorehouseId
            })
            .then(res => {
              if (res.Code === 0) {
                message.success(res.Msg)
                this.requestData()
              } else {
                message.error(res.Msg)
              }
            })
            .catch(error => {
              console.log(error)
            })
        }
      }
    ])
  };

  // 导出excel
  handleExport = () => {
    const { storageRoomId, houseCode, isNull } = this.state
    this.setState({ exportLoading: true });
    axios
      .get("/stock/ExportStorehouse", {
        params: {
          storageRoomId,
          houseCode,
          isNull
        }
      })
      .then(res => {
        this.setState({ exportLoading: false });
        if (res.Code === 0) {
          message.success(res.Msg)
          window.open(`http://47.244.175.166:8088/file/excel/${res.Data}`)
        } else {
          message.error(res.Msg)
        }
      })
      .catch(error => {
        this.setState({ exportLoading: false });
        console.log(error)
      })
  };

  handleRoomChange = storageRoomId => {
    this.setState({ storageRoomId })
  };

  handleStatusChange = isNull => {
    this.setState({ isNull })
  };

  showChoose = (item) => {
    alert('提示', <div>请选择操作</div>, [
      { text: '编辑', onPress: () => this.onEdit(item) },
      { text: '删除', onPress: () => this.onDelete(item) },
      { text: '取消', onPress: () => console.log('关闭弹窗') }
    ])
  };

  render() {
    const { state } = this;
    return (
      <div className="warehouse_manage">
        <Form className="form_common">
          <Row gutter={24}>
            <Col span={12}>
              <Select
                allowClear
                defaultValue={state.storageRoomId}
                placeholder="库房"
                onChange={this.handleRoomChange}
              >
                {
                  state.storageRoomList.map(option => {
                    return (
                      <Option key={option.StorageRoomId} value={option.StorageRoomId}>{option.Name}</Option>
                    )
                  })
                }
              </Select>
            </Col>
            <Col span={12}>
              <Input
                type="text"
                defaultValue={state.houseCode}
                placeholder="库位"
                onChange={e => this.inputHandle(e, 'houseCode')}
              />
            </Col>
            <Col span={12}>
              <Select
                allowClear
                defaultValue={state.isNull}
                placeholder="是否为空库位"
                onChange={this.handleStatusChange}
              >
                <Option value="-1">全部</Option>
                <Option value="0">空库位</Option>
                <Option value="1">非空库位</Option>
              </Select>
            </Col>
            <Col span={12}>
              <Button
                type="primary"
                loading={state.exportLoading}
                onClick={this.handleExport}
                style={{ width: "100%" }}
              >
                生成Excel
              </Button>
            </Col>
            <Col span={24}>
              <Button
                type="primary"
                loading={state.searchLoading}
                onClick={this.requestData}
                style={{ width: "100%" }}
              >
                查询
              </Button>
            </Col>
          </Row>
        </Form>

        <List>
          {
            state.listData.map(item => {
              return (
                <SwipeAction
                  key={item.StorehouseId}
                  style={{ backgroundColor: 'gray' }}
                  autoClose
                  right={[
                    {
                      text: '编辑',
                      onPress: () => this.onEdit(item),
                      style: { backgroundColor: '#108ee9', color: 'white' },
                    },
                    {
                      text: '删除',
                      onPress: () => this.onDelete(item),
                      style: { backgroundColor: '#F4333C', color: 'white' },
                    }
                  ]}
                  onOpen={() => console.log('global open')}
                  onClose={() => console.log('global close')}
                >
                  <List.Item
                    arrow="horizontal"
                    onClick={e => this.showChoose(item)}
                  >
                    <div className='content'>
                      <div className="info">{item.Title}</div>
                      <div className="sn">{item.Quantity ? '放置产品数量：' + item.Quantity : '无产品'}</div>
                    </div>
                  </List.Item>
                </SwipeAction>
              )
            })
          }
        </List>
        
        {
          state.showMore 
          ? <div className='loading_more' onClick={this.loadingMore}>加载中</div>
          : state.isEmpty 
          ? <div className='loading_more'>已无更多数据</div> 
          : <div className="loading_stop"></div>
        }
      </div>
    );
  }
}

export default withRouter(WarehouseManage);
