/**
 * Created by HZRUXI_ZY on 2018/7/5.
 */
import AppState from './app-state'
import TopicStore from './topic'

export { AppState, TopicStore }

export default {
  AppState,
  TopicStore,
}

export const createStoreMap = () => ({
  appState: new AppState(),
  topicStore: new TopicStore(),
})
