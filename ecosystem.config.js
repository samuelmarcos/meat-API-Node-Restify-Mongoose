module.exports = {
  apps : [{
    name   : "meat-api",
    script : "./dist/main.js",
    instances: 0,
    exec_mode: "cluster",
    watch:true,
    env:{
      SERVER_PORT:5000,
      DB_URL: 'mongodb://localhost/meat-api'
    },
    env_production:{
      SERVER_PORT:5001,
      NODE_ENV:"production"
    }
  }]
}

// instances = 0, cria o número de instancias de acordo com o número de cpu's
//modo cluster executa o processo primário, sendo que este balaceia a carga para os outros
