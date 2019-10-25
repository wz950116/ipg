import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Modal, Form, Icon, Input, message } from 'antd';
import axios from "axios";

class PwdEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      oldpassword: '',
      newpassword: '',
      newpassword2: '',
      confirmDirty: false,
    };
  }

  // 初始化
  componentDidMount() {

  }

  setModalVisible(modalVisible) {
    this.props.changeVisible(modalVisible)
  }

  handleSubmit() {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const params = Object.assign({}, values)
        delete params.newpassword2
        axios
          .post("/user/ChangePassword", params)
          .then(res => {
            if (res.Code === 0) {
              message.success(res.Msg)
              this.setModalVisible(false)
            } else {
              message.error(res.Msg)
            }
          })
          .catch(error => {
            console.log(error)
          })
      }
    });
  };

  handleConfirmBlur = e => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  compareToFirstPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('newpassword')) {
      callback('两次密码不一致');
    } else {
      callback();
    }
  };

  validateToNextPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && this.state.confirmDirty) {
      form.validateFields(['newpassword2'], { force: true });
    }
    callback();
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const userName = this.props.data ? this.props.data.UserName : '';
    return (
      <div>
        <Modal
          title="修改密码"
          centered
          visible={this.props.isShow}
          onOk={() => this.handleSubmit()}
          onCancel={() => this.setModalVisible(false)}
        >
          <Form className="login-form">
            <Form.Item hasFeedback>
              {getFieldDecorator('username', {
                initialValue: userName,
                rules: [{ required: true, message: '请输入用户名' }],
              })(
                <Input
                  prefix={<Icon type="user" style={{ color: 'rgba(0, 0, 0, .25)' }} />}
                  placeholder="登录名"
                />,
              )}
            </Form.Item>
            <Form.Item hasFeedback>
              {getFieldDecorator('oldpassword', {
                rules: [{ required: false, message: '' }],
              })(
                <Input
                  prefix={<Icon type="lock" style={{ color: 'rgba(0, 0, 0, .25)' }} />}
                  type="password"
                  placeholder="旧密码"
                />,
              )}
            </Form.Item>
            <Form.Item hasFeedback>
              {getFieldDecorator('newpassword', {
                rules: [{ 
                  required: true, message: '请输入新密码' 
                }, {
                  validator: this.validateToNextPassword,
                }],
              })(
                <Input
                  prefix={<Icon type="lock" style={{ color: 'rgba(0, 0, 0, .25)' }} />}
                  type="password"
                  placeholder="新密码"
                />,
              )}
            </Form.Item>
            <Form.Item hasFeedback>
              {getFieldDecorator('newpassword2', {
                rules: [{ 
                  required: true, message: '请再输入一次新密码'
                }, {
                  validator: this.compareToFirstPassword,
                }],
              })(
                <Input
                  prefix={<Icon type="lock" style={{ color: 'rgba(0, 0, 0, .25)' }} />}
                  type="password"
                  placeholder="确认新密码"
                  onBlur={this.handleConfirmBlur}
                />,
              )}
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default Form.create()(withRouter(PwdEdit));
