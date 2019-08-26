import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import App from "./page/App";

class AuthorizedRoute extends React.Component {
  render() {
    const { component: Component, ...rest } = this.props
    const isLogged = !!sessionStorage.getItem("Token")

    return (
      <App>
        <Route {...rest} render={props => {
          return isLogged ? <Component {...props} /> : <Redirect to="/login" />
        }} />
      </App>
    )
  }
}

export default AuthorizedRoute