import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Form, Row, Col, Select, message } from "antd";
import axios from "axios";
import "./StorageRoomManage.scss";

import { SwipeAction, List, Modal } from 'antd-mobile';

const alert = Modal.alert;


const { Option } = Select;

class StorageRoomManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      storageRoomId: sessionStorage.getItem('StorageRoomId'),
      listData: [],
      storageRoomList: []
    };
  }

  componentDidMount() {
    // 列表请求
    this.requestData()
    // 库房数据
    this.requestStorageRoomList()
  };

  requestData() {
    const { storageRoomId } = this.state
    axios
      .get("/Stock/GetShelves", {
        params: {
          storageRoomId,
        }
      })
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

  // 编辑
  onEdit = (item) => {
    this.props.history.push({pathname: '/addRoom/update', query: {...item, type: 'update'}})
  };

  // 删除
  onDelete = (item) => {
    alert('提示', <div>确认删除？</div>, [
      { text: '取消', onPress: () => {} },
      {
        text: '删除', onPress: () => {
          axios
            .post("/stock/DelShelves", {
              ShelveId: item.ShelveId
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
      }
    ])
  }

  handleRoomIdChange = storageRoomId => {
    this.setState({ storageRoomId }, () => {
      this.requestData()
    })
  };

  showChoose = (item) => {
    alert('提示', <div>请选择操作</div>, [
      { text: '编辑', onPress: () => this.onEdit(item) },
      { text: '删除', onPress: () => this.onDelete(item) },
      { text: '取消', onPress: () => {} }
    ])
  };

  render() {
    const { state } = this;
    return (
      <div className='storage_room_manage'>
        <Form className="form_common">
          <Row gutter={24}>
            <Col span={24}>
              <Select
                defaultValue={state.storageRoomId}
                placeholder="库房"
                onChange={this.handleRoomIdChange}
              >
                {
                  state.storageRoomList.map(option => {
                    return (
                      <Option key={option.StorageRoomId} value={option.StorageRoomId}>{option.Name}</Option>
                    )
                  })
                }
              </Select>
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
                      text: '删除',
                      onPress: () => this.onDelete(item),
                      style: { backgroundColor: '#F4333C', color: 'white' },
                    }
                  ]}
                >
                  <List.Item
                    extra="More"
                    arrow="horizontal"
                    onClick={e => this.showChoose(item)}
                  >
                    <div className='content'>
                      <div className="name">{item.Name}</div>
                      <div className="pos">{item.Position}</div>
                    </div>
                  </List.Item>
                </SwipeAction>
              )
            })
          }
        </List>
      </div>
    );
  }
}

export default withRouter(StorageRoomManage);
