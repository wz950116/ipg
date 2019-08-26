import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import axios from "axios";
import { Form, Input, Select, Button, message, Icon } from "antd";
import "./AddWareHouse.scss";

const { Option } = Select;

class AddWareHouse extends Component {
  constructor(props) {
    super(props);
    this.state = {
      StorageRoomId: sessionStorage.getItem('StorageRoomId'),
      ShelveId: this.props.location.query ? this.props.location.query.StorehouseId : "",
      Code: this.props.location.query ? this.props.location.query.House : "",
      type: this.props.location.query ? this.props.location.query.type : "",
      storageRoomList: [],
      shelveList: []
    };
  }

  componentDidMount() {
    // 库房数据
    this.requestStorageRoomList()
    // 货架数据
    this.requestShelveList()
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

  // 请求对应货架数据
  requestShelveList() {
    if (this.props.form.getFieldValue("StorageRoomId")) {
      axios
        .get("/stock/GetShelves", {
          params: {
            storageRoomId: this.props.form.getFieldValue("StorageRoomId")
          }
        })
        .then(res => {
          if (res.Code === 0) {
            this.setState({
              shelveList: res.Data
            })
          } else {
            message.error(res.Msg);
          }
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  handleHouseChange = StorageRoomId => {
    this.setState({ StorageRoomId })
    this.props.form.setFieldsValue({
      ShelveId: undefined,
    }, () => {
      this.requestShelveList()
    });
  };

  handleShelveChange = ShelveId => {
    this.setState({ ShelveId });
  };

  inputHandle(e, key) {
    this.setState({
      [key]: e.target.value.trim()
    });
  }

  check = () => {
    const { type } = this.state
    this.props.form.validateFields((err, formData) => {
      if (!err) {
        const { ShelveId, Code } = formData
        if (type === "add") {
          axios
            .post("/stock/AddStorehouse", {
              ShelveId,
              Code
            })
            .then(res => {
              if (res.Code === 0) {
                message.success(res.Msg);
                this.props.history.push('/warehouseManage')
              } else {
                message.error(res.Msg);
              }
            })
            .catch(error => {
              console.log(error);
            });
        } else if (type === "update") {
          axios
            .post("/stock/UpdateStorehouse", {
              ShelveId,
              Code
            })
            .then(res => {
              if (res.Code === 0) {
                this.props.history.push('/warehouseManage')
                message.success(res.Msg);
              } else {
                message.error(res.Msg);
              }
            })
            .catch(error => {
              console.log(error);
            });
        }
      }
    });
  };

  // 扫码
  onScan = key => {
    if (window.plus) {
      window.openBarcodeCustom(() => {
        this.setState({
          [key]: sessionStorage.getItem("scanData")
        });
        this.props.form.setFieldsValue({
          [key]: sessionStorage.getItem("scanData"),
        });
      });
    } else {
      message.error("当前设备不支持扫码");
    }
  };

  render() {
    const { type, storageRoomList, shelveList, StorageRoomId, ShelveId, Code } = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 0 },
      wrapperCol: { span: 24 }
    };
    const formTailLayout = {
      labelCol: { span: 0 },
      wrapperCol: { span: 24 }
    };
    const selectAfter = (
      <Icon
        type="scan"
        onClick={this.onScan.bind(this, "Code")}
      />
    )
    return (
      <div>
        <Form {...formItemLayout} className="form_common">
          <Form.Item>
            {getFieldDecorator("StorageRoomId", {
              initialValue: StorageRoomId,
              rules: [{ required: true, message: "请选择库房" }]
            })(
              <Select
                placeholder="库房"
                onChange={this.handleHouseChange}
                allowClear
              >
                {storageRoomList.map(option => {
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
            {getFieldDecorator("ShelveId", {
              initialValue: ShelveId,
              rules: [{ required: true, message: "请选择货架" }]
            })(
              <Select
                placeholder="货架（请先选择库房）"
                onChange={this.handleShelveChange}
                allowClear
              >
                {shelveList.map(option => {
                  return (
                    <Option key={option.ShelveId} value={option.ShelveId}>
                      {option.Name}
                    </Option>
                  );
                })}
              </Select>
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator("Code", {
              initialValue: Code,
              rules: [{ required: true, message: "请输入库位" }]
            })(
              <Input
                addonAfter={selectAfter}
                type="text"
                placeholder="库位"
                onChange={e => this.inputHandle(e, "Code")}
              />
            )}
          </Form.Item>
          <Form.Item {...formTailLayout}>
            <Button
              type="primary"
              onClick={this.check}
              style={{ width: "100%" }}
            >
              {type === "add" ? "新建" : "编辑"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

export default Form.create()(withRouter(AddWareHouse));
