import { Template } from 'meteor/templating';

import './body.html';
 Clients = new Mongo.Collection("clients");

Template.body.helpers({
  list : function(){
  	return Clients.find();
  }
});