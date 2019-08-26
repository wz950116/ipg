import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Form, Row, Col, Input, Button, message, Icon } from "antd";
import axios from "axios";
import "./ProductTest.scss";

const { TextArea } = Input;

class ProductTest extends Component {
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
    const { StorageRoomId, SerialNumber, Memo } = this.state
    if (!SerialNumber) {
      message.error('请输入序列号');
      return;
    }
    axios
      .post("/stock/TransferToWC", {
        StorageRoomId,
        SerialNumber,
        Memo
      })
      .then(res => {
        if (res.Code === 0) {
          message.success(res.Msg);
          this.props.history.push('/pendingSearch')
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
    return (
      <div>
        <Form className="form_common">
          <Row gutter={24}>
            <Col span={18}>
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
            <Col span={24} className="text_show">{state.HouseCode}</Col>
            <Col span={24} className="text_show">{state.Model}</Col>
            <Col span={24} className="text_show">{state.State}</Col>
            <Col span={24} className="text_show">{state.UpdateDate}</Col>
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
                送入待检区
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}

export default withRouter(ProductTest);
