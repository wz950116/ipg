import React, { Component } from "react"
import { withRouter, Link } from "react-router-dom"
import { Menu, Dropdown, Row, Col } from "antd"
import "./ButtomBar.scss"

class ButtomBar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tabs: [{
        name: '查询',
        list: [{
          url: '/index',
          name: '首页'
        }, {
          url: '/stockSearch',
          name: '库存查询'
        }, {
          url: '/pendingSearch',
          name: '待检查询'
        }, {
          url: '/historyRecord',
          name: '历史记录'
        }],
      }, {
        name: '操作',
        list: [{
          url: '/inStock',
          name: '入库'
        }, {
          url: '/outStock',
          name: '出库'
        }, {
          url: '/productTest',
          name: '检验'
        }, {
          url: '/transferWarehouse',
          name: '转库位'
        }],
      }, {
        name: '报表',
        list: [{
          url: '/operationalTrends',
          name: '操作趋势'
        }],
      }, {
        name: '管理',
        list: [{
          url: '/userManage',
          name: '用户管理'
        }, {
          url: '/warehouseManage',
          name: '库位管理'
        }, {
          url: '/storageRoomManage',
          name: '货架管理'
        }]
      }]
    }
  }
  render() {
    const { tabs } = this.state
    const buttomBar = (
      <div>
        {
          tabs.map((val, index) => {
            const list = (
              <Menu>
                {
                  val.list.map((v, key) => {
                    return (
                      <Menu.Item key={key} style={{textAlign: 'center'}}>
                        <Link to={v.url} key={key}>{v.name}</Link>
                      </Menu.Item>
                    )
                  })
                }
              </Menu>
            )
            return (
              <Dropdown overlay={list} key={index} trigger={['click']} placement="topCenter">
                <Col span={6}>
                  <div className='buttom_bar-item'>{val.name}</div>
                </Col>
              </Dropdown>
            )
          })
        }
      </div>
    )
    return (
      <Row className='buttom_bar'>
        {buttomBar}
      </Row>
    )
  }
}

export default withRouter(ButtomBar)
