import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { message, Row, Col, Button } from "antd";
import axios from "axios";
import "./Index.scss";
import imgUrl from '../../images/roomStorageBg.jpg';

import { Modal } from 'antd-mobile';

const alert = Modal.alert;

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listData: []
    };
  }
  // 初始化
  componentDidMount() {
    this.requestData()
    sessionStorage.removeItem('StorageRoomId')
    sessionStorage.removeItem('StorageRoomName')
  }
  // 发起数据请求
  requestData() {
    axios
      .get("/stock/GetStorageRooms")
      .then(res => {
        if (res.Code === 0) {
          this.setState({
            listData: res.Data
          })
        } else {
          message.error(res.Msg)
        }
      })
      .catch(error => {
        console.log(error)
      })
  }
  // 点击库房
  chooseStorageRoom(query) {
    sessionStorage.setItem('StorageRoomId', query.StorageRoomId)
    sessionStorage.setItem('StorageRoomName', query.Name)
    this.props.history.push('/kanban')
  }
  // 退出登录
  logout = () => {
    alert('提示', <div>确认登出？</div>, [
      { text: '取消', onPress: () => { } },
      {
        text: '确定', onPress: () => {
          sessionStorage.clear()
          this.props.history.push('/login')
        }
      }
    ])
  }

  render() {
    const { listData } = this.state
    const itemStyle = {
      height: '6rem',
      lineHeight: '6rem',
      textAlign: 'center',
      fontSize: '1.5rem',
      margin: '1rem auto',
      cursor: 'pointer',
      fontWeight: 900,
      background: `url(${imgUrl}) no-repeat center`
    }
    return (
      <Row type="flex" justify="center" align="middle">
        {
          listData.map(col => {
            return (
              <Col span={18} key={col.StorageRoomId}>
                <div style={itemStyle} onClick={this.chooseStorageRoom.bind(this, col)}>{col.Name}</div>
              </Col>
            )
          })
        }
        <Button
          type="primary"
          onClick={this.logout}
          style={{ width: "80%", position: 'fixed', bottom: '3rem' }}
        >
          退出
        </Button>
      </Row>
    );
  }
}

export default withRouter(Login);
