const express = require('express')
const serverRender = require('./utli/server-render')
const favicon= require('serve-favicon')
const fs=require('fs')
const path=require('path')
const bodyParser= require('body-parser')
const session= require('express-session')
const isDev=process.env.NODE_ENV==='development'

const app=express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(session({
  maxAge:10*60*1000,
  name:'tid',
  resave:false,
  saveUninitialized:false,
  secret:'secret'
}))

app.use(favicon(path.join(__dirname,'../huashuo_favicon.ico')))

app.use('/api/user', require('./utli/handle_login'))
app.use('/api', require('./utli/proxy'))

if(!isDev){
    const serverEntry=require('../dist/server-entry')
    const template=fs.readFileSync(path.join(__dirname,'../dist/server.ejs'),'utf-8')
    app.use('/public',express.static(path.join(__dirname,'../dist')))
    app.get('*',function(req,res,next){
        serverRender(serverEntry, template, req, res).catch(next)
    })
}else{
    const devStatic=require('./utli/dev-static')
    devStatic(app)
}

app.use(function(error, req, res, next){
  console.log(error)
  res.status(500).send(error)
})

const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 3333
app.listen(port, host, function(){
    console.log('server is open')
})
