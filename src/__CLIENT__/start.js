const bodyParser = require('body-parser')
const START_ROUTINES = require('./start_routines.js');
var __DBCLIENT__ = require('./../__ENTITIES__/DBClient.js');
var __DBREQUEST__ = require('./../__ENTITIES__/DBRequest.js');
const Cl_Socket = require('./cl_socket.js');
const MySQLConnector = require('./../MYSQL_CONNECTION.js');
const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

'use strict';
let configs = {
	SOCKET_PORT : '4000',
	DIR_REQUEST_FILE : "",
	SERVER_HOST : 'localhost',
	SERVER_PORT : '3000',
	TOKEN : 'DEVELOPER_TOKEN',
	ID : 'DEVELOPER_ID',
	APP_TYPE : 'SMS'
}

let return_values = {
	SUCCESS : '200',
	INVALID_REQUEST : '400',
	NOT_AUTHORIZED : '400',
	FAILED : '400'
}

var mysql_connection;
var cl_socket = new Cl_Socket;

const path_mysql_env = "__COMMON_FILES__/mysql.env";

(async ()=>{
	try{
		mysql_connection = await MySQLConnector.getConnection( path_mysql_env );
		mysql_connection.connect();
		console.log("=> MYSQL CONNECTION ESTABLISHED");
	}
	catch(error) {
		console.log(error);
		return;
	}
})();


(async ()=>{

	let writeToDatabase = ( message )=>{ // message = [Object]
		let messages = (()=>{
			let v_data = []
			for( let i in message ) {
				let msg = message[i].message
				let number = message[i].number
				v_data.push([msg, number]);
			}
			return v_data;
		})();


		let insertQuery = "INSERT INTO __DEKU__.__REQUEST__ (__MESSAGE__, __PHONENUMBER__) VALUES ?";
		mysql_connection.query( insertQuery, [ messages ], ( error, result ) => {
			if( error ) {
				console.error( error );
				return;
			}

			console.log("=> REQUEST STORED IN DATABASE");
		});
	}

	let startSocketConnection = async ()=>{
		try {
			let clientSocket = await cl_socket.connect( configs.SERVER_HOST, configs.SERVER_PORT);
			console.log("=> SERVER CONNECTION ESTABLISHED");
			clientSocket.on('message', function( message ){
				console.log("=> NEW MESSAGE");
				// console.log( message );

				if( !Array.isArray( message ) ) {
					console.error("=> INVALID REQUEST");
					// console.log( message )

					let response = {
						type : 'ack',
						message : 'invalid request'
					}
					clientSocket.sendMessage( response, ()=> { console.log("=> ACKNOWLEDGED SERVER") });
				}

				// Convert Objects to [Array]
				writeToDatabase( message );
				let response = {
					type : 'ack',
					message : 'processed'
				}
				clientSocket.sendMessage( response, ()=> { console.log("=> ACKNOWLEDGED SERVER") });
			});
		}
		catch (error) {
			console.error("=> CONNECTION ERROR:", error);
			console.error("=> FAILED CONNECTION TO SERVER");

			let reconnectionTimeout = 5000;
			console.log("=> PENDING RECONNECTION - T MINUS 5 SECONDS")

			await snooze( reconnectionTimeout );
			await startSocketConnection();
			return false;
		}
	} 
	startSocketConnection();
})();

