// เชื่อมต่อฐานข้อมูล
const mysql = require("mysql2/promise")
const dbConnection = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "carrent"
})


module.exports = dbConnection