
const { func } = require('@hapi/joi');
const http = require('http')
const port = process.env.PORT || 3001
const app = require('./app/app')
const rest = http.createServer(app);



rest.listen(port,()=>{
    console.log("listening to port "+port)
})




