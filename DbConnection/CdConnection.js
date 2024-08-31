const {Sequelize, DataTypes} = require("sequelize")
const path = require("path");

let connetion={};

const getDbconnection = async(dbName)=>{
    try {
        if(!connetion[dbName]){
            const dbpath = path.join(__dirname,`../database/${dbName}.db`)
            connetion[dbName] = new Sequelize({
                dialect:'sqlite',
                storage:dbpath
            })
        }  
        
        return connetion[dbName]
    } catch (error) {
        console.log(error)
    }
}

module.exports = getDbconnection;