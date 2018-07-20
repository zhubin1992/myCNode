import React from 'react'
import PropTypes from 'prop-types'
import marked from 'marked'
import Helmet from 'react-helmet'
import {
  inject,
  observer,
} from 'mobx-react'

import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import IconReply from '@material-ui/icons/Reply'
import CircularProgress from '@material-ui/core/CircularProgress'

import SimpleMDE from 'react-simplemde-editor'

import Container from '../layout/container'

import { topicDetailStyle } from './styles'

import Reply from './reply'
import formatDate from '../../util/date-format'

@inject(stores => (
  {
    topicStore: stores.topicStore,
    appState: stores.appState,
  }
)) @observer
class TopicDetail extends React.Component {
  static contextTypes = {
    router: PropTypes.object,
  }

  constructor() {
    super()
    this.state = {
      newReply: '',
      // showEditor: false,
    }
    this.handleNewReplyChange = this.handleNewReplyChange.bind(this)
    this.goToLogin = this.goToLogin.bind(this)
    this.handleReply = this.handleReply.bind(this)
  }

  componentDidMount() {
    const { match, topicStore } = this.props
    const { id } = match.params
    // console.log('component did mount id:', match) // eslint-disable-line
    topicStore.getTopicDetail(id).catch((err) => {
      console.log('detail did mount error:', err) // eslint-disable-line
    })
    // setTimeout(() => {
    //   this.setState({
    //     showEditor: true,
    //   })
    // }, 1000)
  }

  getTopic() {
    const { match, topicStore } = this.props
    const { id } = match.params
    return topicStore.detailMap[id]
  }

  bootstrap() {
    console.log('topic detail invoked') // eslint-disable-line
    const { match, topicStore } = this.props
    const { id } = match.params
    return topicStore.getTopicDetail(id).then(() => {
      return true
    }).catch((err) => {
      throw err
    })
  }

  handleNewReplyChange(value) {
    this.setState({
      newReply: value,
    })
  }

  goToLogin() {
    this.context.router.history.push('/user/login')
  }

  handleReply() {
    // do reply here
    this.getTopic().doReply(this.state.newReply)
      .then(() => {
        this.setState({
          newReply: '',
        })
        // this.props.appState.notify({ message: '评论成功' })
      })
      .catch(() => {
        // this.props.appState.notify({ message: '评论失败' })
      })
    // axios.post('/api/')
  }

  render() {
    const topic = this.getTopic()
    const { classes } = this.props
    if (!topic) {
      return (
        <Container>
          <section className={classes.loadingContainer}>
            <CircularProgress color="primary" />
          </section>
        </Container>
      )
    }
    const { createdReplies } = topic
    const { user } = this.props.appState
    // console.log(createdReplies) // eslint-disable-line
    return (
      <div>
        <Container>
          <Helmet>
            <title>{topic.title}</title>
          </Helmet>
          <header className={classes.header}>
            <h3>{topic.title}</h3>
          </header>
          <section className={classes.body}>
            <div dangerouslySetInnerHTML={{ __html: marked(topic.content) }} />
          </section>
        </Container>

        {
          createdReplies && createdReplies.length > 0
            ? (
              <Paper elevation={4} className={classes.replies}>
                <header className={classes.replyHeader}>
                  <span>{' '}</span>
                  <span>我的最新回复</span>
                </header>
                {
                  createdReplies.map((reply) => {
                    return (
                      <Reply
                        reply={Object.assign({}, reply, {
                          author: {
                            avatar_url: user.info.avatar_url,
                            loginname: user.info.loginname,
                          },
                        })}
                        key={reply.id}
                      />
                    )
                  })
                }
              </Paper>
            )
            : null
        }

        <Paper elevation={4} className={classes.replies}>
          <header className={classes.replyHeader}>
            <span>{`${topic.reply_count} 回复`}</span>
            <span>{`最新回复 ${formatDate(topic.last_reply_at, 'yy年mm月dd日')}`}</span>
          </header>
          {
              user.isLogin
                ? (
                  <section className={classes.replyEditor}>
                    <SimpleMDE
                      onChange={this.handleNewReplyChange}
                      value={this.state.newReply}
                      options={{
                        toolbar: [
                          'bold', 'italic', 'heading', '|', 'unordered-list', 'ordered-list', '|',
                          {
                            name: 'image',
                            action: function drawImage(editor) {
                              // Add your own code
                              console.log(editor)
                            },
                            className: 'fa fa-picture-o',
                            title: 'Insert Image',
                          },
                          {
                            name: 'link',
                            action: function drawLink(editor) {
                              // Add your own code
                              console.log(editor)
                            },
                            className: 'fa fa-link',
                            title: 'Create Link',
                          },
                          '|', 'preview',
                        ],
                        autofocus: false,
                        spellChecker: false,
                        placeholder: '添加您的精彩回复',
                        autoDownloadFontAwesome: false,
                      }}
                    />
                    <Button
                      variant="fab"
                      color="secondary"
                      onClick={this.handleReply}
                      className={classes.replyButton}
                    >
                      <IconReply />
                    </Button>
                  </section>)
                : (
                  <section className={classes.notLoginButton}>
                    <Button variant="raised" color="secondary" onClick={this.goToLogin}>
                      登录进行回复
                    </Button>
                  </section>)
            }

          <section>
            {
              topic.replies.map(reply => <Reply reply={reply} key={reply.id} />)
            }
          </section>
        </Paper>
      </div>
    )
  }
}

TopicDetail.wrappedComponent.propTypes = {
  appState: PropTypes.object.isRequired,
  topicStore: PropTypes.object.isRequired,
}

TopicDetail.propTypes = {
  match: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
}

export default withStyles(topicDetailStyle)(TopicDetail)
