const http = require('http')
const port = process.env.PORT || 3000

const app = require('./app/app')
const rest = http.createServer(app);



rest.listen(port,()=>{
    console.log("listening to port "+port)
})

