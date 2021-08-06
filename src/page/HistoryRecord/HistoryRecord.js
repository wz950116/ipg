import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { message, Form, Row, Col, Input, Select, Button, Icon } from "antd";
import axios from "axios";
import "./HistoryRecord.scss";

import { List, DatePicker } from 'antd-mobile';

import common from '../../common/common.js';
const { DateFormatter } = common

const { Option } = Select;

class HistoryRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      exportLoading: false,
      searchLoading: false,
      storageRoomId: sessionStorage.getItem('StorageRoomId'),
      houseCode: "",
      serialNumber: "",
      model: "",
      type: undefined,
      beginTime: "",
      endTime: "",
      page: 1,
      storageRoomList: [],
      listData: [],
      showMore: false, // 是否显示加载更多
      isEmpty: false, // 是否显示加载完毕无更多数据
      loadingComplete: true // 上一次加载更多是否已经完成
    };
  }

  // 初始化
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
  }

  // 发起数据请求
  requestData = () => {
    window.scrollTo(0, 0);
    this.setState({
      page: 1
    }, () => {
      const { storageRoomId, houseCode, model, serialNumber, type, beginTime, endTime, page } = this.state
      this.setState({ searchLoading: true });
      axios
        .get("/stock/GetRecords", {
          params: {
            storageRoomId,
            houseCode,
            model,
            serialNumber,
            type: type ? type : "",
            beginTime: DateFormatter(beginTime),
            endTime: DateFormatter(endTime),
            page,
            state: ""
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
      const { storageRoomId, houseCode, model, serialNumber, type, beginTime, endTime, page, listData } = this.state
      axios
        .get("/stock/GetRecords", {
          params: {
            storageRoomId,
            houseCode,
            model,
            serialNumber,
            type: type ? type : "",
            beginTime: DateFormatter(beginTime),
            endTime: DateFormatter(endTime),
            page,
            state: ""
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

  handleRoomChange = storageRoomId => {
    this.setState({ storageRoomId })
  };

  handleInOutTypeChange = type => {
    this.setState({ type })
  };

  beginTimeChange = beginTime => {
    this.setState({ beginTime })
  };

  endTimeChange = endTime => {
    this.setState({ endTime })
  };

  // 导出excel
  handleExport = () => {
    const { storageRoomId, houseCode, model, serialNumber, type, beginTime, endTime } = this.state
    this.setState({ exportLoading: true });
    axios
      .get("/stock/ExportRecords", {
        params: {
          storageRoomId,
          houseCode,
          model,
          serialNumber,
          type: type ? type : "",
          beginTime: DateFormatter(beginTime),
          endTime: DateFormatter(endTime)
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
      this.setState({
        [key]: sessionStorage.getItem("scanData") || '9999'
      });
    }
  };

  render() {
    const { state } = this;
    
    const SerialNumberAfter = (
      <Icon
        type="scan"
        onClick={this.onScan.bind(this, "serialNumber")}
      />
    )
    const HouseCodeAfter = (
      <Icon
        type="scan"
        onClick={this.onScan.bind(this, "houseCode")}
      />
    )
    const ModelAfter = (
      <Icon
        type="scan"
        onClick={this.onScan.bind(this, "Model")}
      />
    )
    return (
      <div className='history_record'>
        <Form className="form_common history-record_form">
          <Row gutter={24}>
            <Col span={12}>
              <Input
                addonAfter={ModelAfter}
                value={state.model}
                type="text"
                placeholder="型号"
                onChange={e => this.inputHandle(e, "model")}
              />
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
              <DatePicker
                mode="date"
                title="检索开始时间"
                extra="检索开始时间"
                value={this.state.beginTime}
                onChange={this.beginTimeChange}
              >
                <List.Item arrow="horizontal"></List.Item>
              </DatePicker>
            </Col>
            <Col span={12}>
              <DatePicker
                mode="date"
                title="检索结束时间"
                extra="检索结束时间"
                value={this.state.endTime}
                onChange={this.endTimeChange}
              >
                <List.Item arrow="horizontal"></List.Item>
              </DatePicker>
            </Col>
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
              <Input
                addonAfter={HouseCodeAfter}
                value={state.houseCode}
                type="text"
                placeholder="库位"
                onChange={e => this.inputHandle(e, "houseCode")}
              />
            </Col>
            <Col span={12}>
              <Select
                value={state.type}
                allowClear
                placeholder="出入类型"
                onChange={this.handleInOutTypeChange}
              >
                <Option value="1">入库</Option>
                <Option value="2">出库</Option>
                <Option value="3">转移</Option>
                <Option value="4">检查</Option>
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
            state.listData.map((item, index) => {
              return (
                <List.Item
                  key={index}
                  style={{ backgroundColor: item.Type === 1 ? 'LightGreen' : item.Type === 2 ? 'Khaki' : item.Type === 3 ? 'MediumOrchid' : 'LightSkyBlue' }}
                >
                  <div className='content'>
                    <div className="address">{item.Title}</div>
                    <div className="code">SN：{item.SerialNumber}&nbsp;&nbsp;MODEL：{item.Model}</div>
                    <div className="time">操作时间：{item.OperateDate}</div>
                    <div className="remark">备注：{item.Memo}</div>
                  </div>
                </List.Item>
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

export default withRouter(HistoryRecord);
