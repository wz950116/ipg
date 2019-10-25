import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Form, Row, Col, Input, Select, Button, message, Icon } from "antd";
import axios from "axios";
import "./TransferWarehouse.scss";

const { Option } = Select;
const { TextArea } = Input;

class TransferWarehouse extends Component {
  constructor(props) {
    super(props);
    this.state = {
      storageRoomList: [],
      StorageRoomId: sessionStorage.getItem('StorageRoomId'),
      NewStorageRoomId: this.props.location.query && this.props.location.query.NewStorageRoomId ? this.props.location.query.NewStorageRoomId : sessionStorage.getItem('StorageRoomId'),
      SerialNumber: this.props.location.query && this.props.location.query.sn,
      Memo: "",
      HouseCode: this.props.location.query && this.props.location.query.newId,
      Model: "",
      State: "",
      UpdateDate: ""
    };
  }

  componentDidMount() {
    // 库房数据
    this.requestStorageRoomList();
    // 初始化有序列号则带出相关信息
    if (this.state.SerialNumber) {
      this.onSearch()
    }
  }

  // 请求对应库房数据
  requestStorageRoomList() {
    axios
      .get("/stock/GetStorageRooms")
      .then(res => {
        if (res.Code === 0) {
          this.setState({
            storageRoomList: res.Data
          });
        } else {
          message.error(res.Msg);
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  // 输入框改变
  inputHandle(e, key) {
    this.setState({
      [key]: e.target.value.trim()
    });
  };

  handleStorageRoomChange = NewStorageRoomId => {
    this.setState({ NewStorageRoomId });
  };

  onSearch() {
    const { StorageRoomId, SerialNumber } = this.state
    if (!SerialNumber) {
      message.error('请输入序列号');
      return;
    }
    axios
      .get("/stock/GetMoreByHS", {
        params: {
          StorageRoomId,
          SerialNumber
        }
      })
      .then(res => {
        if (res.Code === 0) {
          this.setState({
            Model: res.Data.Model,
            State: res.Data.State,
            UpdateDate: res.Data.UpdateDate
          })
        } else {
          this.setState({
            Model: "",
            State: "",
            UpdateDate: ""
          })
          message.error(res.Msg);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  onCheck() {
    const { NewStorageRoomId, SerialNumber } = this.state
    if (NewStorageRoomId) {
      const StorageRoomName = this.state.storageRoomList.filter(room => room.StorageRoomId === NewStorageRoomId)[0].Name
      this.props.history.push({pathname: '/kanban', query: {NewStorageRoomId, StorageRoomName, sn: SerialNumber}})
    }
  };

  onConfirm = () => {
    const { StorageRoomId, NewStorageRoomId, SerialNumber, HouseCode, Memo } = this.state
    if (!SerialNumber) {
      message.error('请输入序列号');
      return;
    } else if (!HouseCode) {
      message.error('请输入新库位');
      return;
    }
    axios
      .post("/stock/UpperShelf", {
        StorageRoomId,
        NewStorageRoomId,
        SerialNumber,
        HouseCode,
        Memo
      })
      .then(res => {
        if (res.Code === 0) {
          message.success(res.Msg);
        } else {
          message.error(res.Msg);
        }
      })
      .catch(error => {
        console.log(error);
      });
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

  render() {
    const { state } = this;
    const SerialNumberAfter = (
      <Icon
        type="scan"
        onClick={this.onScan.bind(this, "SerialNumber")}
      />
    )
    const HouseCodeAfter = (
      <Icon
        type="scan"
        onClick={this.onScan.bind(this, "HouseCode")}
      />
    )
    return (
      <div>
        <Form className="form_common">
          <Row gutter={24}>
            <Col span={18}>
              <Input
                addonAfter={SerialNumberAfter}
                value={state.SerialNumber}
                type="text"
                placeholder="序列号"
                onChange={e => this.inputHandle(e, "SerialNumber")}
              />
            </Col>
            <Col span={6}>
              <Button type="primary" onClick={this.onSearch.bind(this)}>
                查询
              </Button>
            </Col>
            <Col span={24} className='text_show' style={{display: state.Model ? 'block' : 'none'}}>{state.Model}</Col>
            <Col span={24} className='text_show' style={{display: state.State ? 'block' : 'none'}}>{state.State}</Col>
            <Col span={24} className='text_show' style={{display: state.UpdateDate ? 'block' : 'none'}}>{state.UpdateDate}</Col>
            <Col span={8}>
              <Select
                value={state.NewStorageRoomId}
                placeholder="新库房"
                onChange={this.handleStorageRoomChange}
                allowClear
              >
                {state.storageRoomList.map(option => {
                  return (
                    <Option
                      key={option.StorageRoomId}
                      value={option.StorageRoomId}
                    >
                      {option.Name}
                    </Option>
                  );
                })}
              </Select>
            </Col>
            <Col span={10}>
              <Input
                addonAfter={HouseCodeAfter}
                value={state.HouseCode}
                type="text"
                placeholder="新库位"
                onChange={e => this.inputHandle(e, "HouseCode")}
              />
            </Col>
            <Col span={6}>
              <Button type="primary" onClick={this.onCheck.bind(this)}>
                查找
              </Button>
            </Col>
            <Col span={24}>
              <TextArea
                value={state.Memo}
                placeholder="备注"
                style={{ resize: "none" }}
                onChange={e => this.inputHandle(e, "Memo")}
              />
            </Col>
            <Col span={24}>
              <Button
                type="primary"
                onClick={this.onConfirm}
                style={{ width: "100%" }}
              >
                转库位
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}

export default withRouter(TransferWarehouse);
