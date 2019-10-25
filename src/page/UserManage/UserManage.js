import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Form, Row, Col, Input, Select, message, Button } from "antd";
import axios from "axios";
import PwdEdit from './PwdEdit';
import "./UserManage.scss";

import { SwipeAction, List, Modal } from 'antd-mobile';

const alert = Modal.alert;


const { Option } = Select;

class UserManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false,
      roleId: "",
      name: "",
      page: 1,
      roleList: [],
      listData: [],
      currentRole: null,
      showMore: false, // 是否显示加载更多
      isEmpty: false, // 是否显示加载完毕无更多数据
      loadingComplete: true // 上一次加载更多是否已经完成
    };
  }

  // 初始化
  componentDidMount() {
    // 角色请求
    this.requestRole()
    // 列表请求
    this.requestData()

    window.addEventListener('scroll', function () {
      const sH = document.documentElement.scrollHeight;
      const sT = document.documentElement.scrollTop || document.body.scrollTop;
      const oH = document.documentElement.offsetHeight || document.body.offsetHeight;
      if (sH === sT + oH && this.state.showMore) {
        this.loadingMore()
      }
    }.bind(this), false);
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

  // 发起数据请求
  requestData = () => {
    window.scrollTo(0, 0);
    this.setState({
      page: 1
    }, () => {
      const { name, roleId, page } = this.state
      axios
        .get("/user/GetUsers", {
          params: {
            name,
            roleId: roleId ? roleId : '',
            page
          }
        })
        .then(res => {
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
          console.log(error)
        })
    })
  }

  // 加载更多
  loadingMore = () => {
    if (!this.state.loadingComplete) return
    this.setState({
      page: this.state.page + 1,
      loadingComplete: false
    }, () => {
      const { name, roleId, page, listData } = this.state
      axios
        .get("/user/GetUsers", {
          params: {
            name,
            roleId: roleId ? roleId : '',
            page
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

  // 删除用户
  onDelete = (item) => {
    alert('提示', <div>确认删除？</div>, [
      {
        text: '取消', onPress: () => {}
      },
      {
        text: '确定', onPress: () => this.confirmDelete(item)
      }
    ])
  }

  // 确认删除
  confirmDelete = (item) => {
    axios
      .post("/user/DelUser", {
        username: item.UserName
      })
      .then(res => {
        if (res.Code === 0) {
          message.success(res.Msg)
          this.requestData()
        } else {
          message.error(res.Msg)
        }
      })
      .catch(error => {
        console.log(error)
      })
  }

  // 修改密码
  onChangePwd = (item) => {
    this.setState({
      dialogVisible: true,
      currentRole: item
    })
  }

  // 编辑
  onEdit = (item) => {
    this.props.history.push({pathname: '/addUser/update', query: {...item, type: 'update'}})
  };

  // 角色改变
  handleRoleChange = roleId => {
    this.setState({ roleId })
  };

  // 输入框改变
  inputHandle(e, key) {
    this.setState({
      [key]: e.target.value.trim()
    });
  };

  showChoose = (item) => {
    alert('提示', <div>请选择操作</div>, [
      {
        text: '编辑', onPress: () => this.onEdit(item)
      },
      {
        text: '修改密码', onPress: () => this.onChangePwd(item)
      },
      {
        text: '删除', onPress: () => this.onDelete(item)
      },
      {
        text: '关闭', onPress: () => {}
      }
    ])
  };

  changeVisible(dialogVisible) {
    this.setState({ dialogVisible })
  };

  render() {
    const { state } = this;
    return (
      <div className='user_manage'>
        <PwdEdit data={state.currentRole} isShow={state.dialogVisible} changeVisible={this.changeVisible.bind(this)}></PwdEdit>
        <Form className="form_common">
          <Row gutter={24}>
            <Col span={12}>
              <Select
                allowClear
                placeholder="角色"
                onChange={this.handleRoleChange}
              >
                {
                  state.roleList.map(option => {
                    return (
                      <Option key={option.Id} value={option.Id}>{option.Name}</Option>
                    )
                  })
                }
              </Select>
            </Col>
            <Col span={12}>
              <Input
                defaultValue={state.name}
                type="text"
                placeholder="姓名"
                onChange={e => this.inputHandle(e, "name")}
              />
            </Col>
            <Col span={24}>
              <Button
                type="primary"
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
                <SwipeAction
                  key={index}
                  style={{ backgroundColor: 'gray' }}
                  autoClose
                  right={[
                    {
                      text: '编辑',
                      onPress: () => this.onEdit(item),
                      style: { backgroundColor: '#108ee9', color: 'white' },
                    },
                    {
                      text: '修改密码',
                      onPress: () => this.onChangePwd(item),
                      style: { backgroundColor: 'gray', color: 'white' },
                    },
                    {
                      text: '删除',
                      onPress: () => this.onDelete(item),
                      style: { backgroundColor: '#F4333C', color: 'white' },
                    }
                  ]}
                >
                  <List.Item
                    arrow="horizontal"
                    onClick={e => this.showChoose(item)}
                  >
                    <div className='content'>
                      <div className="info">{item.Name}&nbsp;&nbsp;{item.Mobile}</div>
                      <div className="roles">{item.RoleNames.join()}</div>
                      <div className="username">用户名：{item.UserName}</div>
                    </div>
                  </List.Item>
                </SwipeAction>
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

export default withRouter(UserManage);
