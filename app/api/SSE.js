const uuid = require('uuid');
const { streamEvents } = require('http-event-stream');

const clients = {}

const addClientToList = (user, clientObj, idOldClient) => {	
	const targetClientsList = clients[user]
		? clients[user]
		: []
	
	if(idOldClient)	{
		const oldClient = targetClientsList.find(client => client.id === idOldClient)
		if(oldClient) {
			oldClient.client.close();
			const indexOldClient = targetClientsList.indexOf(oldClient);

			if(indexOldClient > -1) {
				targetClientsList.splice(indexOldClient, 1)
			}
		}
	}
	
	targetClientsList.push(clientObj)
	clients[user] = targetClientsList;	
}
	
const connectNewClient = async (ctx) => {  
	const fetchEventsSince = async (lastEventId) => {
		return []
	}
	
	const id = uuid.v4()   
	const idNewClient = uuid.v4()   
	const { user, id: idOldClient } = ctx.request.body;

	return streamEvents(ctx.req, ctx.res, { 
		async fetch(lastEventId) {
			return fetchEventsSince(lastEventId);
		},
	
		stream(client) {
			const clientObj = {
				id: idNewClient,
				client
			}
			client.sendEvent({
				event: `connect`,
				data: JSON.stringify({
					id: idNewClient,
				}),
				id,
			})
			addClientToList(user, clientObj, idOldClient);
			return () => removeClientFromList(user, clientObj)
		}
	})
}
	
const removeClientFromList = (user, clientObj) => {
	const targetClientsList = clients[user];
	if(!targetClientsList) {
		return;
	}

	const indexTargetClient = targetClientsList.indexOf(clientObj);
	if(indexTargetClient < 0) {
		return;
	}

	targetClientsList.splice(indexTargetClient, 1);
}

const sendEventToClients = (data) => {
	const { user, event, body, exclude = null } = data;
	const targetClientsList = clients[user];

	if(!targetClientsList) {
		return;
	}

	const JSONbody = JSON.stringify(body)
	const id = uuid.v4() 

	targetClientsList.forEach(clientObj => {
		if(exclude === clientObj.id) return;

		clientObj.client.sendEvent({
			event: event,
    	data: JSONbody,
 	  	id,
  	})
	})
}

module.exports = {
	connectNewClient,
	sendEventToClients
}