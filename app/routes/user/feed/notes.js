const koaRouter = require('koa-router');
const feedNotesRouter = new koaRouter()

feedNotesRouter.post('/user/feed/notes', async ctx => {
	console.log('notes router', ctx.request.body);
	const response = {
		success: true,
		error: null,
		data: {
			notes: [
				{
		      id: `123-546-fd5`,
		      favorite: false,
		      pinned: false,
		      text: `Lorem, ipsum dolor sit amet.`,
		      tags: null,
		      geolocation: `154445, 154455`,
		      attachment: {
		        img: [
		          {
		            id: `1555-554-fdf`, 
		            name: `img file`, 
		            src: `/image-1.png`
		          },
		          {
		            id: `155ds5-554-fdf`, 
		            name: `img2 file`, 
		            src: `/image-2.jpg`
		          }
		        ],
		        video: [
		          {
		            id: `55445-1-dssd`,
		            name: `test video`,
		            src: `/video-1.mp4`
		          }
		        ],
		        audio: [],
		        other: []
		      },
		      created: new Date(),
		      edited: null,
		    },
			]
		},
		tokens: {
			upgraded: false,
			access: null,
			refresh: null,
		}
	}

	const responseJSON = JSON.stringify(response)

	ctx.response.body = responseJSON;
})

module.exports = feedNotesRouter;