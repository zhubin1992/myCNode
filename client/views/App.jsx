import React from 'react'
// import { Link } from 'react-router-dom'
import Routes from '../config/router'
import ButtonAppBar from './layout/app-bar'

export default class App extends React.Component {
  componentDidMount() {

  }

  render() {
    return [
      <ButtonAppBar key="appbar" />,
      <Routes key="routes" />,
    ]
  }
}
