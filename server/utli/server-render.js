const ReactDomServer=require('react-dom/server')
const serialize= require('serialize-javascript')
const ejs =require('ejs')
const create = require('jss').create
const bootstrap = require('react-async-bootstrapper')
const Helmet = require('react-helmet').default
const SheetsRegistry = require('react-jss').SheetsRegistry
const createMuiTheme = require('@material-ui/core/styles').createMuiTheme
const createGenerateClassName = require('@material-ui/core/styles').createGenerateClassName
const jssPreset  = require('@material-ui/core/styles').jssPreset
const colors = require('@material-ui/core/colors')

const getStoreState = (stores) => {
  return Object.keys(stores).reduce((result, storeName) => {
    result[storeName] = stores[storeName].toJson()
    return result
  },{})
}

module.exports = (bundle, template, req, res) => {
  return new Promise((resolve, reject) => {
    const createStoreMap = bundle.createStoreMap
    const createApp = bundle.default
    const routerContext= {}
    const store=createStoreMap()
    const user = req.session.user
    if (user) {
      store.appState.user.isLogin = true
      store.appState.user.info = user
    }
    const sheetsRegistry = new SheetsRegistry();
    const generateClassName = createGenerateClassName({
      dangerouslyUseGlobalCSS: true,
    });
    const jss = create(jssPreset());
    const theme = createMuiTheme({
      palette: {
        primary: colors.blue,
        accent: colors.lightGreen,
        secondary: {
          main: colors.lightGreen[500],
          contrastText: '#fff',
        },
        type: 'light',
      },
    })
    const app = createApp(store, routerContext, sheetsRegistry, jss, generateClassName, theme, req.url)
    bootstrap(app).then(() => {
      const content=ReactDomServer.renderToString(app)
      if(routerContext.url) {
        res.status(302).setHeader('Location', routerContext.url)
        res.end()
        return
      }
      const helmet = Helmet.rewind()
      const state = getStoreState(store)
      // res.send(template.replace('<!--app-->',content))
      const html = ejs.render(template, {
        appString: content,
        initialState: serialize(state),
        meta: helmet.meta.toString(),
        title: helmet.title.toString(),
        style: helmet.style.toString(),
        link: helmet.link.toString(),
        materialCss: sheetsRegistry.toString(),
      })
      res.send(html)
      resolve()
    }).catch(reject)
  })
}
