// var mysql      = require('mysql');
import * as mysql from 'mysql'
async function searchSql(query:String) {
  return await new Promise((resolve, reject)=> {
    var connection = mysql.createConnection({
      host: 'localhost',
      user: 'darren',
      password : 'root',
      database : 'CHATROOM'
    });
    connection.connect();
    connection.query(query, function (error, results, fields) {
      if (error) {
        reject(error)
        return
      }
      console.log('The solution is: ', results[0]);
      resolve(results)
    });
    connection.end();
  })
}

export {searchSql}