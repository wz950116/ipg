import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import logo from "../../images/logo.png";
import { Icon } from "antd";
import "./Header.scss";

class Header extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showAdd: ['/userManage', '/warehouseManage', '/storageRoomManage', '/paramMaintain'],
      goBackList: ['/stockSearch', '/inStock', '/outStock', '/productTest', '/transferWarehouse', '/addUser/add', '/addUser/update', '/addWareHouse/add', '/addWareHouse/update', '/addRoom/add', '/addRoom/update'],
      backList: [{
        path: "/kanban",
        title: ""
      }, {
        path: '/stockSearch',
        title: '库存查询'
      }, {
        path: '/pendingSearch',
        title: '待检区查询'
      }, {
        path: '/historyRecord',
        title: '历史记录'
      }, {
        path: '/inStock',
        title: '入库'
      }, {
        path: '/outStock',
        title: '出库'
      }, {
        path: '/productTest',
        title: '产品检测'
      }, {
        path: '/transferWarehouse',
        title: '转库位'
      }, {
        path: '/userManage',
        title: '用户管理'
      }, {
        path: '/warehouseManage',
        title: '库位管理'
      }, {
        path: '/storageRoomManage',
        title: '货架管理'
      }, {
        path: '/paramMaintain',
        title: '参数维护'
      }, {
        path: '/addUser/add',
        title: '新建用户'
      }, {
        path: '/addUser/update',
        title: '编辑用户'
      }, {
        path: '/addWareHouse/add',
        title: '新建库位'
      }, {
        path: '/addWareHouse/update',
        title: '编辑库位'
      }, {
        path: '/addRoom/add',
        title: '新建货架'
      }, {
        path: '/addRoom/update',
        title: '编辑货架'
      }, {
        path: '/operationalTrends',
        title: '操作趋势'
      }]
    }
    this.goBack = this.goBack.bind(this)
  };
  goBack() {
    const pathname = this.props.location.pathname;
    
    if (this.state.goBackList.includes(pathname)) {
      this.props.history.goBack()
    } else if (pathname === '/kanban') {
      this.props.history.push('/')
    } else {
      this.props.history.push('/kanban')
    }
  };
  render() {
    const pathname = this.props.location.pathname;

    const addUrl = pathname === '/userManage' ? '/addUser/add' : pathname === '/warehouseManage' ? '/addWareHouse/add' : '/addRoom/add'

    const { backList, showAdd } = this.state

    return (
      <div className="Header">
        {backList.map(v => v.path).includes(pathname) ? (
          <div className="Header_nav">
            <div className="back" onClick={this.goBack}>
              <Icon type="left" />
            </div>
            <span className="title">
              {backList.filter(v => v.path === pathname)[0].title ? backList.filter(v => v.path === pathname)[0].title : `IPGB ${this.props.roomName}电子看板`}
            </span>
            <Link to={{pathname: addUrl, query: {type: 'add'}}} style={{ display: showAdd.includes(pathname) ? "block" : "none" }} className="add">
              <Icon type="plus" />
            </Link>
          </div>
        ) : (
          <img src={logo} alt="" />
        )}
      </div>
    );
  }
}

export default withRouter(Header);
