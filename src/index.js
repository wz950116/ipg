import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import axios from "axios";
import Qs from "qs";
import 'antd-mobile/dist/antd-mobile.css';
import "./reset.css";
import globalConst from "./config";
// 自定义文件
import App from "./page/App";
import Login from "./page/Login/Login";
import Index from "./page/Index/Index";
import Kanban from "./page/Kanban/Kanban";
import StockSearch from "./page/StockSearch/StockSearch";
import PendingSearch from "./page/PendingSearch/PendingSearch";
import HistoryRecord from "./page/HistoryRecord/HistoryRecord";
import InStock from "./page/InStock/InStock";
import OutStock from "./page/OutStock/OutStock";
import ProductTest from "./page/ProductTest/ProductTest";
import TransferWarehouse from "./page/TransferWarehouse/TransferWarehouse";
import UserManage from "./page/UserManage/UserManage";
import WarehouseManage from "./page/WarehouseManage/WarehouseManage";
import StorageRoomManage from "./page/StorageRoomManage/StorageRoomManage";
import AddUser from "./page/AddUser/AddUser";
import AddWareHouse from "./page/AddWareHouse/AddWareHouse";
import AddRoom from "./page/AddRoom/AddRoom";
import OperationalTrends from "./page/OperationalTrends/OperationalTrends";
import * as serviceWorker from "./serviceWorker";
import AuthRouter from "./AuthorizedRoute";
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import { LocaleProvider } from 'antd'

/** debug */
import VConsole from 'vconsole'
new VConsole()

// let equip = ''
// if (navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)) {
//   equip = '移动端'
// } else {
//   equip = 'PC端'
// }

// 设置基础路径
axios.defaults.baseURL = globalConst.baseURL;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';

axios.interceptors.request.use(
  config => {
    if (sessionStorage.getItem('Token')) {
      config.headers.Token = sessionStorage.getItem('Token')
      if (sessionStorage.getItem('StorageRoomId')) {
        config.headers.StorageRoomId = sessionStorage.getItem('StorageRoomId')
      }
    }
    return config
  },
  error => {
    Promise.reject(error)
  }
)

// post请求参数格式化
axios.defaults.transformRequest = [
  function(data) {
    if (data) {
      if (data instanceof FormData) {
        return data;
      }
      let params = "";
      for (let index in data) {
        if (typeof data[index] === "object") {
          data[index] = JSON.stringify(data[index]);
        }
        params += index + "=" + data[index] + "&";
      }
      params = params.substring(0, params.length - 1);
      return params;
    }
  }
];
// get请求参数格式化
axios.defaults.paramsSerializer = function(params) {
  if (params) {
    params = Qs.stringify(params, { encode: true });
    return params;
  }
};
// 让返回数据只返回data
axios.interceptors.response.use(
  res => {
    if (JSON.parse(res.data) && JSON.parse(res.data).Msg === '未登录') {
      const router = new HashRouter()
      sessionStorage.clear()
      router.history.push('/')
    }
    return JSON.parse(res.data);
  },
  err => {
    return Promise.resolve(err);
  }
);

ReactDOM.render(
  <LocaleProvider locale={zh_CN}>
    <HashRouter>
      <Switch>
        <Route exact path="/" render={() => 
          <Redirect to='/index'></Redirect>}>
        </Route>
        <Route path="/login">
          <App>
            <Route path="/login" component={Login} />
          </App>
        </Route>
        <AuthRouter path="/index" component={Index} />
        <AuthRouter path="/kanban" component={Kanban} />
        <AuthRouter path="/stockSearch" component={StockSearch} />
        <AuthRouter path="/pendingSearch" component={PendingSearch} />
        <AuthRouter path="/historyRecord" component={HistoryRecord} />
        <AuthRouter path="/inStock" component={InStock} />
        <AuthRouter path="/outStock" component={OutStock} />
        <AuthRouter path="/productTest" component={ProductTest} />
        <AuthRouter path="/transferWarehouse" component={TransferWarehouse} />
        <AuthRouter path="/userManage" component={UserManage} />
        <AuthRouter path="/warehouseManage" component={WarehouseManage} />
        <AuthRouter path="/storageRoomManage" component={StorageRoomManage} />
        <AuthRouter path="/addUser" component={AddUser} />
        <AuthRouter path="/addWareHouse/:type" component={AddWareHouse} />
        <AuthRouter path="/addRoom/:type" component={AddRoom} />
        <AuthRouter path="/operationalTrends" component={OperationalTrends} />
      </Switch>
    </HashRouter>
  </LocaleProvider>,
  document.getElementById("root")
);
serviceWorker.unregister();
