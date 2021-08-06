import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Modal, Form, Input, message, Button } from 'antd';
import axios from "axios";

const { TextArea } = Input;

class MemoEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      ProductId: this.props.data.ProductId,
      Memo: this.props.data.Memo
    };
  }

  // 初始化
  componentDidMount() {

  }

  inputHandle(e, key) {
    this.setState({
      [key]: e.target.value.trim()
    });
  };

  setModalVisible(modalVisible) {
    this.props.changeVisible(modalVisible)
  }

  handleSubmit() {
    const { ProductId, Memo } = this.state
    this.setState({ loading: true })
    axios
      .post("/stock/UpdateProductMemo", {
        ProductId,
        Memo
      })
      .then(res => {
        if (res.Code === 0) {
          message.success(res.Msg)
          this.setState({ loading: false })
          this.setModalVisible(true)
        } else {
          message.error(res.Msg)
        }
      })
      .catch(error => {
        console.log(error)
      })
  };

  render() {
    const item = this.props.data ? this.props.data : {}
    const { state } = this
    return (
      <div>
        <Modal
          title="修改备注"
          centered
          visible={true}
          footer={[
            <Button key="back" onClick={() => this.setModalVisible()}>
              取消
            </Button>,
            <Button key="submit" type="primary" loading={state.loading} onClick={() => this.handleSubmit()}>
              确定
            </Button>
          ]}
        >
          <div className='content'>
            <div className="title">{item.Title}</div>
            <div className="code">SN：{item.SerialNumber}&nbsp;&nbsp;MODEL：{item.Model}</div>
            <div className="time">{item.State === 1 ? '已检' : item.State === 2 ? '待检' : '不良'}&nbsp;&nbsp;上次操作时间：{item.OperateDate}</div>
            <div className="remark" style={{ marginTop: '1rem' }}>
              <TextArea
                value={state.Memo}
                placeholder="备注"
                style={{ resize: "none" }}
                onChange={e => this.inputHandle(e, "Memo")}
              />
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default Form.create()(withRouter(MemoEdit));
