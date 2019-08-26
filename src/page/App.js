import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import Header from "../component/Header/Header";
import ButtomBar from "../component/ButtomBar/ButtomBar";
import Footer from "../component/Footer/Footer";
import "./App.scss";

class App extends Component {
  render() {
    const pathname = this.props.location.pathname;
    const showBar = ["/login", "/index"].includes(pathname)

    return (
      <div className="App">
        <Header />
        {this.props.children}
        {showBar ? <Footer /> : <ButtomBar />}
      </div>
    );
  }
}

export default withRouter(App);
