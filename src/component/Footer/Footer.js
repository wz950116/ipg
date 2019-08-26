import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import "./Footer.scss";
class Footer extends Component {
  render() {
    return (
      <div className="Footer">
        <div>阿帕奇(北京)光纤激光技术有限公司</div>
      </div>
    );
  }
}

export default withRouter(Footer);
