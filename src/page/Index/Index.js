import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { message, Row, Col } from "antd";
import axios from "axios";
import "./Index.scss";
import imgUrl from '../../images/roomStorageBg.jpg';

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
    this.props.history.push('/kanban')
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
      </Row>
    );
  }
}

export default withRouter(Login);
