import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { Row, Col, message, Input } from "antd";
import axios from "axios";
import "./Kanban.scss";
const { Search } = Input;

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
  requestData = (search = '') => {
    axios
      .get("/stock/GetStorageRoomDetail", {
        params: {
          search,
          storageRoomId: this.props.location.query && this.props.location.query.NewStorageRoomId ? this.props.location.query.NewStorageRoomId : sessionStorage.getItem('StorageRoomId')
        }
      })
      .then(res => {
        this.setState({ searchLoading: false });
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
        <Row style={{ marginBottom: '1rem' }}>
          <Col span={24}>
            <Search placeholder="请输入库位、序列号、型号" onSearch={this.requestData} enterButton />
          </Col>
        </Row>
        {listData.StorageRoomDetailDtos && listData.StorageRoomDetailDtos.map(item => {
          return (
            <div className='wrapper' key={item.Title} style={{ display: item.StorehouseDtos && item.StorehouseDtos.length > 0 ? 'block' : 'none' }}>
              {Object.keys(item.newData).map(i => {
                return (
                  <Row key={i} style={{ marginBottom: '1rem' }}>
                    <Col span={4} className='cs'>{i * 1}层</Col>
                    <Col span={20} className='table'>
                      {
                        item.newData[i].map(m => {
                          return (
                            <Col span={2} className='warehouse' key={m.StorehouseId} style={{ background: m.Quantity > 0 ? 'rgb(0, 204, 255)' : 'ffffff' }}>
                              <Link to={{ pathname: this.props.location.query ? '/transferWarehouse' : (m.Quantity > 0 ? '/stockSearch' : '/inStock'), query: { newId: m.HouseCode, ...this.props.location.query } }} style={{ display: 'inline-block', width: '100%', height: '100%' }}>
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
