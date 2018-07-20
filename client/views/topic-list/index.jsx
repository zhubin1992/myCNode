import React from 'react'
import {
  observer,
  inject,
} from 'mobx-react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import queryString from 'query-string'
// import Button from '@material-ui/core/Button'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import List from '@material-ui/core/List'
import CircularProgress from '@material-ui/core/CircularProgress'

import Container from '../layout/container'
import TopicListItem from './list-item'
import { tabs } from '../../util/define-topic'

@inject(store => (
  {
    topicStore: store.topicStore,
    appState: store.appState,
  }
)) @observer
export default class TopicList extends React.Component {
  static contextTypes = {
    router: PropTypes.object,
  }

  constructor() {
    super()

    this.changeTab = this.changeTab.bind(this)
    this.listItemClick = this.listItemClick.bind(this)
  }

  componentDidMount() {
    const { topicStore } = this.props
    const tab = this.getTab()
    topicStore.fetchTopic(tab)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.search !== this.props.location) {
      this.props.topicStore.fetchTopic(this.getTab(nextProps.location.search))
    }
  }

  getTab(search) {
    const newSearch = search || this.props.location.search
    const query = queryString.parse(newSearch)
    return query.tab || 'all'
  }

  changeTab(e, value) {
    this.context.router.history.push({
      pathname: '/index',
      search: `?tab=${value}`,
    })
    // console.log(this.props.history)
    // this.props.history.push({
    //   pathname: '/list',
    //   search: `?tab=${value}`,
    // })
    // const { topicStore } = this.props
    // topicStore.fetchTopic(value)
  }

  bootstrap() {
    const { tab } = queryString.parse(this.props.location.search)
    return this.props.topicStore.fetchTopic(tab || 'all').then(() => {
      return true
    }).catch(() => {
      return false
    })
  }

  listItemClick(topic) {
    this.context.router.history.push(`/detail/${topic.id}`)
  }

  render() {
    const {
      topicStore,
    } = this.props
    const topicList = topicStore.topics
    const syncingTopic = topicStore.syncing
    const tab = this.getTab()
    // const topic = {
    //   title: 'this is title',
    //   username: 'jack',
    //   reply_count: 30,
    //   visit_count: 40,
    //   create_at: 'sdfafasdf',
    //   tab: 'share',
    //   image: 'https://b-ssl.duitang.com/uploads/item/201404/15/20140415192752_JGUFz.jpeg',
    // }

    return (
      <Container>
        <Helmet>
          <title>this is list</title>
          <meta name="description" content="this is description" />
        </Helmet>
        <Tabs value={tab} onChange={this.changeTab} indicatorColor="primary">
          {
            Object.keys(tabs).map(t => (
              <Tab key={t} label={tabs[t]} value={t} />
            ))
          }
        </Tabs>
        <List>
          {
            topicList.map(topic => (
              <TopicListItem
                onClick={() => this.listItemClick(topic)}
                topic={topic}
                key={topic.id}
              />
            ))
          }
          {
            syncingTopic
              ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    padding: '40px 0',
                  }}
                >
                  <CircularProgress color="primary" />
                </div>
              )
              : null
          }
        </List>
      </Container>
    )
  }
}
TopicList.wrappedComponent.propTypes = {
  topicStore: PropTypes.object.isRequired,
}

TopicList.propTypes = {
  location: PropTypes.object.isRequired,
  // history: PropTypes.object.isRequired,
}
