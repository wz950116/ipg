import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import axios from "axios";
import { Form, Input, Select, Button, message } from "antd";
import "./AddRoom.scss";

const { Option } = Select;

class AddRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: this.props.location.query ? this.props.location.query.type : "",
      StorageRoomId: sessionStorage.getItem('StorageRoomId'),
      ShelveId: this.props.location.query ? this.props.location.query.ShelveId : "",
      Name: this.props.location.query ? this.props.location.query.Name : "",
      Position: this.props.location.query ? this.props.location.query.Position : "",
      storageRoomList: [],
      shelveList: []
    };
  }

  componentDidMount() {
    this.requestStorageRoomList()
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

  inputHandle(e, key) {
    this.setState({
      [key]: e.target.value.trim()
    });
  }

  check = () => {
    const { type, ShelveId } = this.state
    this.props.form.validateFields((err, formData) => {
      if (!err) {
        const { StorageRoomId, Name, Position } = formData
        if (type === "add") {
          axios
            .post("/stock/AddShelves", {
              StorageRoomId,
              Name,
              Position
            })
            .then(res => {
              if (res.Code === 0) {
                message.success(res.Msg);
                this.props.history.push('/storageRoomManage')
              } else {
                message.error(res.Msg);
              }
            })
            .catch(error => {
              console.log(error);
            });
        } else if (type === "update") {
          axios
            .post("/stock/UpdateShelves", {
              ShelveId,
              Name,
              Position
            })
            .then(res => {
              if (res.Code === 0) {
                this.props.history.push('/storageRoomManage')
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

  render() {
    const { type, storageRoomList, StorageRoomId, Name, Position } = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 }
    };
    const formTailLayout = {
      labelCol: { span: 0 },
      wrapperCol: { span: 24 }
    };
    return (
      <div>
        <Form {...formItemLayout} className="form_common">
          <Form.Item label='库房' hasFeedback>
            {getFieldDecorator("StorageRoomId", {
              initialValue: StorageRoomId,
              rules: [{ required: true, message: "请选择库房" }]
            })(
              <Select placeholder="库房" allowClear disabled={type === 'update'}>
                {
                  storageRoomList.map(option => {
                    return (
                      <Option key={option.StorageRoomId} value={option.StorageRoomId}>{option.Name}</Option>
                    )
                  })
                }
              </Select>
            )}
          </Form.Item>
          <Form.Item label='货架名称' hasFeedback>
            {getFieldDecorator("Name", {
              initialValue: Name,
              rules: [{ required: true, message: "请输入货架名称" }]
            })(
              <Input
                type="text"
                placeholder=""
                onChange={e => this.inputHandle(e, "Name")}
              />
            )}
          </Form.Item>
          <Form.Item label='货架位置' hasFeedback>
            {getFieldDecorator("Position", {
              initialValue: Position,
              rules: [{ required: true, message: "请输入货架位置" }]
            })(
              <Input
                type="text"
                placeholder=""
                onChange={e => this.inputHandle(e, "Position")}
              />
            )}
          </Form.Item>
          <Form.Item {...formTailLayout}>
            <Button type="primary" onClick={this.check} style={{width: '100%'}}>
              {type === "add" ? "新建" : "编辑"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

export default Form.create()(withRouter(AddRoom));
