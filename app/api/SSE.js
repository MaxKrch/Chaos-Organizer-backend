const uuid = require('uuid');
const { streamEvents } = require('http-event-stream');

const clients = {}

const addClientToList = (user, client) => {
	const targetClientsList = clients[user]
		? clients[user]
		: []

	targetClientsList.push(client)
	clients[user] = targetClientsList;
}
	
const connectNewClient = async (ctx) => {  
	const fetchEventsSince = async (lastEventId) => {
		return []
	}
	const user = ctx.request.body.user;

	return streamEvents(ctx.req, ctx.res, {      
		async fetch(lastEventId) {
			return fetchEventsSince(lastEventId);
		},
	
		stream(client) {
			addClientToList(user, client);
			return () => removeClientFromList(user, client)
		}
	})
}
	
const removeClientFromList = (user, client) => {
	const targetClientsList = clients[user];
	if(!targetClientsList) {
		console.log(`User not found`);
		return;
	}

	const indexTargetClient = targetClientsList.indexOf(client);
	if(indexTargetClient < 0) {
		console.log(`Client not found`);
	}
	
	targetClientsList.splice(indexTargetClient, 1);
}

const sendEventToClients = (data) => {
	const { user, event, body } = data;
	const targetClientsList = clients[user];
	
	if(!targetClientsList) {
		console.log(`User not found`);
		return;
	}

	const formatedBody = body.replace(/\s/g, '')
	targetClientsList.forEach(client => client.sendEvent({
		event: event,
    data: JSON.stringify(formatedBody),
    id: uuid.v4() 
  }))
}

module.exports = {
	connectNewClient,
	sendEventToClients
}