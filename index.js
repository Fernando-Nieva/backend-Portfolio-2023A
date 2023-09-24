'use strict'
var mongoose =require('mongoose');
var app = require('./app');
var port = 3700;


mongoose.Promise = global.Promise;

mongoose.connect('mongodb://127.0.0.1:27017/portfolio')
                .then(()=>{
                   console.log("Conexion a la Base de Datos exitosa..."); 

                   //Creacion del servidor
                   app.listen(port,()=>{
                    console.log("servidor corriendo exitosamente en la url:3700");
                   });
                })
                .catch(err => console.log(err));