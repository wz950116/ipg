import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Form, Row, Col, Input, Button, message, Icon } from "antd";
import axios from "axios";
import "./TransferWarehouse.scss";

const { TextArea } = Input;

class TransferWarehouse extends Component {
  constructor(props) {
    super(props);
    this.state = {
      StorageRoomId: sessionStorage.getItem('StorageRoomId'),
      SerialNumber: this.props.location.query && this.props.location.query.sn,
      Memo: "",
      HouseCode: "",
      Model: "",
      State: "",
      UpdateDate: ""
    };
  }

  // 输入框改变
  inputHandle(e, key) {
    this.setState({
      [key]: e.target.value.trim()
    });
  };

  onSearch() {
    const { StorageRoomId, SerialNumber } = this.state
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
            HouseCode: res.Data.HouseCode,
            Model: res.Data.Model,
            State: res.Data.State,
            UpdateDate: res.Data.UpdateDate
          })
        } else {
          message.error(res.Msg);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  onConfirm = () => {
    const { StorageRoomId, SerialNumber, HouseCode, Memo } = this.state
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
            <Col span={14}>
              <Input
                addonAfter={SerialNumberAfter}
                defaultValue={state.SerialNumber}
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
            <Col span={14}>
              <Input
                addonAfter={HouseCodeAfter}
                defaultValue={state.HouseCode}
                type="text"
                placeholder="新库位"
                onChange={e => this.inputHandle(e, "HouseCode")}
              />
            </Col>
            <Col span={6}>
              <Button type="primary" onClick={this.onSearch.bind(this)}>
                查询
              </Button>
            </Col>
            <Col span={24} className='text_show'>{state.Model}</Col>
            <Col span={24} className='text_show'>{state.State}</Col>
            <Col span={24} className='text_show'>{state.UpdateDate}</Col>
            <Col span={24}>
              <TextArea
                defaultValue={state.Memo}
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
