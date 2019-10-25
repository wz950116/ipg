import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import axios from "axios";
import { Form, Input, Select, Button, message } from "antd";
import "./AddUser.scss";

const { Option } = Select;

class AddUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      mobile: "",
      username: "",
      roles: undefined,
      type: this.props.location.query ? this.props.location.query.type : "",
      roleList: []
    };
    this.inputHandle = this.inputHandle.bind(this);
  }

  // 初始化
  componentDidMount() {
    // 角色请求
    this.requestRole()
    
    // 编辑时请求数据
    if (this.state.type === "update") {
      axios
        .get("/user/GetUser", {
          params: {
            username: this.props.location.query.UserName
          }
        })
        .then(res => {
          if (res.Code === 0) {
            const data = res.Data;
            this.setState({
              name: data.Name,
              username: data.UserName,
              mobile: data.Mobile,
              roles: data.RoleList && data.RoleList.map(r => r.Id)
            });
          } else {
            message.error(res.Msg);
          }
        })
        .catch(error => {
          console.log(error);
        });
    }
  }

  // 角色请求
  requestRole() {
    axios
      .get("/user/GetRoles")
      .then(res => {
        if (res.Code === 0) {
          this.setState({
            roleList: res.Data
          })
        } else {
          message.error(res.Msg)
        }
      })
      .catch(error => {
        console.log(error)
      })
  };

  handleRoleChange = roles => {
    this.setState({ roles });
  };

  inputHandle(e, key) {
    this.setState({
      [key]: e.target.value.trim()
    });
  }

  check = () => {
    const { type } = this.state;
    this.props.form.validateFields((err, formData) => {
      if (!err) {
        const params = Object.assign({}, formData)
        params.roles = params.roles.join()
        if (type === "add") {
          axios
            .post("/user/CreateUser", params)
            .then(res => {
              if (res.Code === 0) {
                message.success(res.Msg);
                this.props.history.push("/userManage")
              } else {
                message.error(res.Msg);
              }
            })
            .catch(error => {
              console.log(error);
            });
        } else if (type === "update") {
          axios
            .post("/user/UpdateUser", params)
            .then(res => {
              if (res.Code === 0) {
                message.success(res.Msg);
                this.props.history.push("/userManage")
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
    const { state } = this;
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
          <Form.Item label="姓名" hasFeedback>
            {getFieldDecorator("name", {
              initialValue: state.name,
              rules: [{ required: true, message: "请输入姓名" }]
            })(
              <Input
                type="text"
                placeholder="姓名"
                onChange={e => this.inputHandle(e, "name")}
              />
            )}
          </Form.Item>
          <Form.Item label="手机" hasFeedback>
            {getFieldDecorator("mobile", {
              initialValue: state.mobile,
              rules: [{ required: true, message: "请输入手机号码" }]
            })(
              <Input
                type="text"
                placeholder="手机"
                onChange={e => this.inputHandle(e, "mobile")}
              />
            )}
          </Form.Item>
          <Form.Item label="登录名" hasFeedback>
            {getFieldDecorator("username", {
              initialValue: state.username,
              rules: [{ required: true, message: "请输入登录名" }]
            })(
              <Input
                type="text"
                placeholder="登录名"
                disabled={state.type === 'update'}
                onChange={e => this.inputHandle(e, "username")}
              />
            )}
          </Form.Item>
          <Form.Item label="角色" hasFeedback>
            {getFieldDecorator("roles", {
              initialValue: state.roles,
              rules: [{ required: true, message: "请选择角色" }]
            })(
              <Select placeholder="角色" onChange={this.handleRoleChange} mode="multiple">
                {
                  state.roleList.map(option => {
                    return (
                      <Option key={option.Id} value={option.Id}>{option.Name}</Option>
                    )
                  })
                }
              </Select>
            )}
          </Form.Item>
          <Form.Item {...formTailLayout}>
            <Button type="primary" onClick={this.check} style={{width: '100%'}}>
              {state.type === "add" ? "新建" : "编辑"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

export default Form.create()(withRouter(AddUser));
