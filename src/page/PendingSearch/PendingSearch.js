import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Form, Row, Col, Input, Select, Button, message, Icon } from "antd";
import axios from "axios";
import MemoEdit from '../StockSearch/MemoEdit';
import "./PendingSearch.scss";

import { SwipeAction, List, Modal } from 'antd-mobile';

const alert = Modal.alert;


const { Option } = Select;

class PendingSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchLoading: false,
      listData: [],
      storageRoomList: [],
      storageRoomId: sessionStorage.getItem('StorageRoomId'),
      state: undefined,
      serialNumber: "",
      model: "",
      memo: "",
      page: 1,
      dialogVisible: false,
      currentRow: null,
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
      const { storageRoomId, state, serialNumber, model, memo, page } = this.state
      this.setState({ searchLoading: true });
      axios
        .get("/Stock/GetWatiCheck", {
          params: {
            storageRoomId,
            state: state ? state : "",
            serialNumber,
            model,
            memo,
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
      const { storageRoomId, state, serialNumber, model, memo, page, listData } = this.state
      axios
        .get("/Stock/GetWatiCheck", {
          params: {
            storageRoomId,
            state: state ? state : "",
            serialNumber,
            model,
            memo,
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

  handleRoomChange = storageRoomId => {
    this.setState({ storageRoomId })
  };

  handleStatusChange = state => {
    this.setState({ state })
  };
  
  inputHandle(e, key) {
    this.setState({
      [key]: e.target.value.trim()
    });
  }

  // 修改备注
  onEdit = (item) => {
    this.setState({
      dialogVisible: true,
      currentRow: item
    })
  }

  // 转良品
  onGood = (item) => {
    alert('提示', <div>确定转良品？</div>, [
      { text: '取消', onPress: () => { } },
      {
        text: '确定', onPress: () => {
          axios
            .post("/Stock/UpdateProductState", {
              storageRoomId: item.storageRoomId,
              state: 1,
              ProductId: item.ProductId,
            })
            .then(res => {
              if (res.Code === 0) {
                message.success(res.Msg);
                this.requestData()
              } else {
                message.error(res.Msg);
              }
            })
            .catch(error => {
              console.log(error);
            });
        }
      }
    ])
  };

  // 转不良
  onBad = (item) => {
    alert('提示', <div>确定转不良？</div>, [
      { text: '取消', onPress: () => { } },
      {
        text: '确定', onPress: () => {
          axios
            .post("/Stock/UpdateProductState", {
              storageRoomId: item.storageRoomId,
              state: 3,
              ProductId: item.ProductId,
            })
            .then(res => {
              if (res.Code === 0) {
                message.success(res.Msg);
                this.requestData()
              } else {
                message.error(res.Msg);
              }
            })
            .catch(error => {
              console.log(error);
            });
        }
      }
    ])
  };

  onOutStock = (item) => {
    this.props.history.push({pathname: '/outStock', query: {sn: item.SerialNumber}})
  };

  onTransfer = (item) => {
    this.props.history.push({pathname: '/transferWarehouse', query: {sn: item.SerialNumber}})
  };

  showChoose = (item) => {
    alert('提示', <div>请选择操作</div>, [
      { text: '编辑备注', onPress: () => this.onEdit(item) },
      { text: '良品', onPress: () => this.onGood(item) },
      { text: '不良', onPress: () => this.onBad(item) },
      { text: '出库', onPress: () => this.onOutStock(item) },
      { text: '转库位（重新上架）', onPress: () => this.onTransfer(item) },
      { text: '取消', onPress: () => {} },
    ])
  };

  // 扫码
  onScan = key => {
    if (window.plus) {
      window.openBarcodeCustom(() => {
        this.setState({
          [key]: sessionStorage.getItem("scanData")
        });
      });
    } else {
      message.error("当前设备不支持扫码");
    }
  };

  changeVisible(refresh) {
    this.setState({ 
      dialogVisible: false
    }, () => {
      if (refresh) {
        this.requestData()
      }
    })
  };

  render() {
    const { state } = this;
    
    const SerialNumberAfter = (
      <Icon
        type="scan"
        onClick={this.onScan.bind(this, "serialNumber")}
      />
    )
    const ModelAfter = (
      <Icon
        type="scan"
        onClick={this.onScan.bind(this, "model")}
      />
    )
    return (
      <div className='pending_search'>
        {
          state.dialogVisible ? 
          <MemoEdit data={state.currentRow} changeVisible={this.changeVisible.bind(this)}></MemoEdit>
          :
          null
        }

        <Form className="form_common">
          <Row gutter={24}>
            <Col span={12}>
              <Select
                allowClear
                value={state.storageRoomId}
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
              <Select
                allowClear
                value={state.state}
                placeholder="检验状态"
                onChange={this.handleStatusChange}
              >
                <Option value="1">已检</Option>
                <Option value="2">待检</Option>
                <Option value="3">不良</Option>
              </Select>
            </Col>
            <Col span={12}>
              <Input
                addonAfter={SerialNumberAfter}
                value={state.serialNumber}
                type="text"
                placeholder="序列号"
                onChange={e => this.inputHandle(e, "serialNumber")}
              />
            </Col>
            <Col span={12}>
              <Input
                addonAfter={ModelAfter}
                value={state.model}
                type="text"
                placeholder="型号"
                onChange={e => this.inputHandle(e, "model")}
              />
            </Col>
            <Col span={24}>
              <Input
                value={state.memo}
                type="text"
                placeholder="备注"
                onChange={e => this.inputHandle(e, "memo")}
              />
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
            state.listData.map((item, index) => {
              return (
                <SwipeAction
                  key={index}
                  style={{ backgroundColor: 'gray' }}
                  autoClose
                  right={[
                    {
                      text: '编辑备注',
                      onPress: () => this.onEdit(item),
                      style: { backgroundColor: 'CornflowerBlue', color: 'white' },
                    },
                    {
                      text: '良品',
                      onPress: () => this.onGood(item),
                      style: { backgroundColor: '#108ee9', color: 'white' },
                    },
                    {
                      text: '不良',
                      onPress: () => this.onBad(item),
                      style: { backgroundColor: '#F4333C', color: 'white' },
                    },
                    {
                      text: '出库',
                      onPress: () => this.onOutStock(item),
                      style: { backgroundColor: 'gray', color: 'white' },
                    },
                    {
                      text: '转库位（重新上架）',
                      onPress: () => this.onTransfer(item),
                      style: { backgroundColor: '#666', color: 'white' },
                    }
                  ]}
                >
                  <List.Item
                    arrow="horizontal"
                    onClick={() => this.showChoose(item)}
                  >
                    <div className='content'>
                      <div className="title">{item.Title}</div>
                      <div className="code">SN：{item.SerialNumber}&nbsp;&nbsp;MODEL：{item.Model}</div>
                      <div className="time">{item.State === 1 ? '已检' : item.State === 2 ? '待检' : '不良'}&nbsp;&nbsp;操作时间：{item.OperateDate}</div>
                      <div className="remark">{item.Memo}</div>
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

export default withRouter(PendingSearch);
