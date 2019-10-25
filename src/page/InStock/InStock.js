import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Form, Input, Select, Button, message, Icon } from "antd";
import axios from "axios";
import "./InStock.scss";

import { DatePicker, List } from "antd-mobile";

import common from '../../common/common.js';
const { DateFormatter } = common

const { Option } = Select;
const { TextArea } = Input;

class InStock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      storageRoomList: [],
      StorageRoomId: sessionStorage.getItem("StorageRoomId"),
      SerialNumber: this.props.location.query ? this.props.location.query.sn : '',
      HouseCode: this.props.location.query ? this.props.location.query.newId : '',
      Model: "",
      State: undefined,
      ArrivalDate: "",
      Memo: ""
    };
  }

  componentDidMount() {
    // 库房数据
    this.requestStorageRoomList();
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

  handleStorageRoomChange = StorageRoomId => {
    this.setState({ StorageRoomId });
  };

  onConfirm = () => {
    this.props.form.validateFields((err, formData) => {
      if (!err) {
        const {
          StorageRoomId,
          HouseCode,
          SerialNumber,
          Model,
          State,
          ArrivalDate,
          Memo
        } = formData;
        axios
          .post("/stock/EntryHouse", {
            StorageRoomId,
            HouseCode,
            SerialNumber,
            Model,
            State,
            ArrivalDate: DateFormatter(ArrivalDate),
            Memo
          })
          .then(res => {
            if (res.Code === 0) {
              // 成功后清空数据
              this.props.form.resetFields();
              this.setState({
                State: undefined,
                ArrivalDate: ""
              })
              message.success(res.Msg);
            } else {
              message.error(res.Msg);
            }
          })
          .catch(error => {
            console.log(error);
          });
      }
    })
  };

  handleStateChange = State => {
    this.setState({ State });
  };

  // 扫码
  onScan = key => {
    if (window.plus) {
      window.openBarcodeCustom(() => {
        this.props.form.setFieldsValue({
          [key]: sessionStorage.getItem("scanData")
        });
      });
    } else {
      message.error("当前设备不支持扫码");
    }
  };

  render() {
    const { state } = this;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 0 },
      wrapperCol: { span: 24 }
    };
    const formTailLayout = {
      labelCol: { span: 0 },
      wrapperCol: { span: 24 }
    };
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
    const ModelAfter = (
      <Icon
        type="scan"
        onClick={this.onScan.bind(this, "Model")}
      />
    )
    return (
      <div>
        <Form {...formItemLayout} className="form_common instock_form">
          <Form.Item>
            {getFieldDecorator("StorageRoomId", {
              initialValue: state.StorageRoomId,
              rules: [{ required: true, message: "请选择库房" }]
            })(
              <Select
                placeholder="库房"
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
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator("SerialNumber", {
              initialValue: state.SerialNumber,
              rules: [{ required: true, message: "请输入序列号" }],
            })(
              <Input
                addonAfter={SerialNumberAfter}
                type="text"
                placeholder="序列号"
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator("HouseCode", {
              initialValue: state.HouseCode,
              rules: [{ required: true, message: "请输入库位" }]
            })(
              <Input
                addonAfter={HouseCodeAfter}
                type="text"
                placeholder="库位"
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator("Model", {
              initialValue: state.Model,
              rules: [{ required: true, message: "请输入型号" }]
            })(
              <Input
                addonAfter={ModelAfter}
                type="text"
                placeholder="型号"
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator("State", {
              initialValue: state.State,
              rules: [{ required: true, message: "请选择检验状态" }]
            })(
              <Select allowClear placeholder="检验状态" onChange={this.handleStateChange}>
                <Option value="1">已检</Option>
                <Option value="2">待检</Option>
                <Option value="3">不良</Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator("ArrivalDate", {
              initialValue: state.ArrivalDate
            })(
              <DatePicker
                mode="date"
                title="到货日期"
                extra="到货日期"
                onChange={ArrivalDate => this.setState({ ArrivalDate })}
              >
                <List.Item arrow="horizontal" />
              </DatePicker>
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator("Memo", {
              initialValue: state.Memo
            })(
              <TextArea
                placeholder="备注"
                style={{ resize: "none" }}
              />
            )}
          </Form.Item>
          <Form.Item {...formTailLayout}>
            <Button
              type="primary"
              onClick={this.onConfirm}
              style={{ width: "100%" }}
            >
              入库
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

export default Form.create()(withRouter(InStock));
