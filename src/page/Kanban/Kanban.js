import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { Row, Col, message } from "antd";
import axios from "axios";
import "./Kanban.scss";

class Kanban extends Component {
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
      .get("/stock/GetStorageRoomDetail", {
        params: {
          storageRoomId: sessionStorage.getItem('StorageRoomId')
        }
      })
      .then(res => {
        if (res.Code === 0) {
          const data = res.Data
          data.StorageRoomDetailDtos.forEach(item => {
            item.newData = {}
            item.StorehouseDtos.forEach(i => {
              if (item.newData[i.Heng]) {
                item.newData[i.Heng].push(i)
              } else {
                item.newData[i.Heng] = [i]
              }
            })
          })
          this.setState({
            listData: data
          })
        } else {
          message.error(res.Msg)
        }
      })
      .catch(error => {
        console.log(error)
      })
  };
  render() {
    const { listData } = this.state;
    return (
      <div>
        {listData.StorageRoomDetailDtos && listData.StorageRoomDetailDtos.map((item, index) => {
          return (
            <div className='wrapper' key={index} style={{display: item.StorehouseDtos && item.StorehouseDtos.length > 0 ? 'block' : 'none'}}>
              {Object.keys(item.newData).map((i, index) => {
                return (
                  <Row key={index} style={{marginBottom: '1rem'}}>
                    <Col span={4} className='cs'>{i * 1}层</Col>
                    <Col span={20} className='table'>
                      {
                        item.newData[i].map((m, index) => {
                          return (
                            <Col span={3} className='warehouse' key={index} style={{background: m.Quantity > 0 ? 'rgb(0, 204, 255)' : 'ffffff'}}>
                              <Link to={{pathname: '/stockSearch', query: {newId: m.HouseCode}}} style={{display: 'inline-block', width: '100%', height: '100%'}}>
                                {m.Quantity}
                              </Link>
                            </Col>
                          )
                        })
                      }
                    </Col>
                  </Row>
                );
              })}
              <Row className='table_buttom'>
                <Col span={20} offset={4}>
                  <div className='title'>
                    {item.Title}
                  </div>
                </Col>
              </Row>
            </div>
          )
        })}
      </div>
    );
  }
}

export default withRouter(Kanban);
