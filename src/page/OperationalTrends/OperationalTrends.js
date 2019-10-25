import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Form, Row, Col, Select, message } from "antd";
import axios from "axios";
import echarts from "echarts";
import "./OperationalTrends.scss";

const { Option } = Select;

class OperationalTrends extends Component {
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

    // echart初始化
    window.addEventListener('resize', () => {
      const myChart7 = echarts.init(document.getElementById('echart7'))
      myChart7.resize()
    })
  };

  requestData() {
    const { storageRoomId } = this.state
    axios
      .get("/Report/GetOperationTrend", {
        params: {
          storageRoomId,
        }
      })
      .then(res => {
        if (res.Code === 0) {
          this.setState({
            listData: res.Data
          })
          const myChart7 = echarts.init(document.getElementById('echart7'))
          myChart7.setOption(this.getOption())
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

  getOption = () => {
    const { listData } = this.state;
    
    let option = {
      tooltip: {
        trigger: 'axis',
      },
      title: {
        text: '',
        left: '100'
      },
      toolbox: {
        feature: {
          dataView: {
            show: false,
            readOnly: false
          },
          magicType: {
            show: true,
            type: ['line', 'bar']
          }
        }
      },
      legend: {
        data: ['入库', '出库', '检验']
      },
      xAxis: [{
        type: 'category',
        data: listData.xName,
        axisPointer: {
          type: 'shadow'
        }
      }],
      yAxis: [{
        type: 'value',
        name: ''
      }],
      series: [{
        name: '入库',
        type: 'bar',
        smooth: true,
        data: listData.inHouse
      }, {
        name: '出库',
        type: 'bar',
        smooth: true,
        data: listData.outHouse
      }, {
        name: '检验',
        type: 'bar',
        smooth: true,
        data: listData.check
      }]
    }

    return option
  };

  handleRoomIdChange = storageRoomId => {
    this.setState({ storageRoomId }, () => {
      this.requestData()
    })
  };

  render() {
    const { state } = this;
    return (
      <div className='storage_room_manage'>
        <Form className="form_common">
          <Row gutter={24}>
            <Col span={24}>
              <Select
                allowClear
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

        <div id="echart7" style={{height:'400px'}}></div>
      </div>
    );
  }
}

export default withRouter(OperationalTrends);
