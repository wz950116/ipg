import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import axios from "axios";
import { Input, message, Button } from "antd";
import "./Login.scss";

class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      username: "",
      pwd: ""
    }

    this.inputHandle = this.inputHandle.bind(this)

    if (sessionStorage.getItem('Token')) {
      this.props.history.push('/index')
    }
  }
  inputHandle(e, key) {
    this.setState({
      [key]: e.target.value.trim()
    })
  }
  // 获取用户搜索结果
  login() {
    let { username, pwd } = this.state
    if (!username.trim()) {
      message.error("请输入用户名")
      return
    }
    if (!pwd.trim()) {
      message.error("请输入密码")
      return
    }
    this.requestData()
  }
  // 发起数据请求
  requestData() {
    let { username, pwd } = this.state;
    this.setState({ loading: true });
    axios
      .get("/user/login", {
        params: {
          username,
          pwd
        }
      })
      .then(res => {
        this.setState({ loading: false });
        if (res.Code === 0) {
          sessionStorage.setItem('Token', res.Data.Token)
          this.props.history.push('/index')
        } else {
          message.error(res.Msg)
        }
      })
      .catch(error => {
        this.setState({ loading: false });
        console.log(error)
      })
  }
  render() {
    let { username, pwd, loading } = this.state
    return (
      <div className="search_wrap">
        <div className="search_input">
          <Input
            className="input"
            placeholder="请输入用户名"
            defaultValue={username}
            onChange={e => this.inputHandle(e, "username")}
          />
          <Input.Password
            className="input"
            placeholder="请输入密码"
            defaultValue={pwd}
            onChange={e => this.inputHandle(e, "pwd")}
          />
          <Button type="primary" loading={loading} onClick={this.login.bind(this)}>
            登录
          </Button>
        </div>
      </div>
    )
  }
}

export default withRouter(Login);
