import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'mobx-react'
import {
  MuiThemeProvider,
  createMuiTheme,
  createGenerateClassName,
  jssPreset,
} from '@material-ui/core/styles'
import {
  SheetsRegistry,
  JssProvider,
} from 'react-jss'
import { create } from 'jss';
import { lightGreen, blue } from '@material-ui/core/colors'
import { AppContainer } from 'react-hot-loader' //eslint-disable-line
import App from './views/App'
import { AppState, TopicStore } from './store'


const theme = createMuiTheme({
  palette: {
    primary: blue,
    accent: lightGreen,
    secondary: {
      main: lightGreen[500],
      contrastText: '#fff',
    },
    type: 'light',
  },
})
// ReactDom.render(<App/>,document.getElementById("root"))
const initialState = window.__INITIAL__STATE__ || {} //eslint-disable-line

const createApp = () => {
  class Main extends React.Component {
    // Remove the server-side injected CSS.
    componentDidMount() {
      const jssStyles = document.getElementById('jss-server-side');
      if (jssStyles && jssStyles.parentNode) {
        jssStyles.parentNode.removeChild(jssStyles);
      }
    }

    render() {
      return <App />
    }
  }
  return Main
}
const root = document.getElementById('root');
const appState = new AppState(initialState.appState)
const topicStore = new TopicStore(initialState.topicStore)
appState.init(initialState.appState)
const sheetsRegistry = new SheetsRegistry();
const generateClassName = createGenerateClassName({
  dangerouslyUseGlobalCSS: true,
});
const jss = create(jssPreset());
const Render = (Component) => {
  const renderMethod = module.hot ? ReactDOM.render : ReactDOM.hydrate
  renderMethod(
    <AppContainer>
      <Provider
        appState={appState}
        topicStore={topicStore}
      >
        <BrowserRouter>
          <JssProvider jss={jss} registry={sheetsRegistry} generateClassName={generateClassName}>
            <MuiThemeProvider theme={theme} sheetsManager={new Map()}>
              <Component />
            </MuiThemeProvider>
          </JssProvider>
        </BrowserRouter>
      </Provider>
    </AppContainer>,
    root,
  )
}
Render(createApp(App))
if (module.hot) {
  module.hot.accept('./views/App.jsx', () => {
    const NextApp = require('./views/App.jsx').default; //eslint-disable-line
    Render(createApp(NextApp))
  });
  // ReactDom.render(<NextApp/>,document.getElementById("root"))
}
