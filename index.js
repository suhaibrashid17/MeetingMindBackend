const express = require('express')
app = express()
PORT_NUM = 8080||process.env.PORT_NUM
app.listen(PORT_NUM, ()=>{
    console.log("App up and running on port " + PORT_NUM)
})