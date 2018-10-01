import { Meteor } from 'meteor/meteor';

var SOCKET_PORT = 9090
var RELAY_SOCKET_PORT = 8090
var net = require('net')
var isReal = false
var sockets = {}
var PORT_START = 9100
var SERVER_IP = ""
var index = 0
Clients = new Mongo.Collection("clients");

const bound = Meteor.bindEnvironment((callback) => {callback();});

function printInfo(message) {
	if(isReal){
		return;
	}

	console.log(message)
}

printInfo("==== socket server ready ====")
var server = net.createServer(function (s){
	printInfo("==== connect socket ====")
	s.write('welcome\n');

	console.log('   remote = %s:%s', s.remoteAddress, s.remotePort);


	s.on('data', function(data){
		var str = data.toString()
		printInfo(str)

		try {
        	clientInformation = JSON.parse(str)
        	clientInformation.adbConnectCommand = s.localAddress + ":" +(PORT_START + (index++))
        	s.clientInformation = clientInformation
        	bound(() => {
				Clients.insert(clientInformation);
        	})
        	s.write('S_READY_AND_WAIT\n');
        	s.write('S_READY_AND_WAIT\n');
    	} catch (err) {
        	console.log("error:" + err);
    	} 
	})

	s.on('end', function(){
		printInfo(s.clientInformation)
		bound(() => {
				Clients.remove({code:s.clientInformation.code});
        	})
		printInfo("==== disconnect socket ====")
	})

	s.on('error', function(){
		bound(() => {
				Clients.remove({code:s.clientInformation.code});
        	})

		s.close()
		printInfo("==== error socket ====")
	})
})

var rserver = net.createServer(function (s){
	printInfo("==== connect relay socket ====")

	console.log('   remote = %s:%s', s.remoteAddress, s.remotePort);
	sockets[s.remoteAddress] = s

	s.on('data', function(data){

	})

	s.on('end', function(){

		printInfo("==== disconnect socket ====")
	})

	s.on('error', function(){

		printInfo("==== error socket ====")
	})
})



Meteor.startup(() => {
	server.listen(SOCKET_PORT)
	rserver.listen(RELAY_SOCKET_PORT)
});
