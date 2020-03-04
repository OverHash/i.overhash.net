import express from "express";
import fileUpload from "express-fileupload";
import fs from "fs";

const PORT = 8881

const app = express();

function generateRandomString(length: number) {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;

	let result = '';
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}

	return result;
}

app.use(fileUpload({
	safeFileNames: true,
	preserveExtension: 24,
	abortOnLimit: true,
	responseOnLimit: 'Please upload a smaller file!',
	useTempFiles: true,
	tempFileDir: __dirname + '/tmp/',
	createParentPath: true,
	limits: { fileSize: 1024 * 1024 * 5 },
}))

app.get('/', (request, response) => {
	response.sendFile(__dirname + '/index.html');
});

app.get('*', (request, response) => {
	fs.exists(__dirname + '/uploads' + request.path, exists => {
		if (exists) {
			response.sendFile(__dirname + '/uploads' + request.path, err => {
				if (err) {
					console.log('error sending file');
					console.log(err);
				};

				response.end();
			})
		} else {
			response.send('Requested image does not exist');
			response.end();
		}
	})
})

app.post('/', (request, response) => {
	if (request.files) {
		const imageToUpload = request.files.imageToUpload;

		if (imageToUpload && !Array.isArray(imageToUpload) && !imageToUpload.truncated) {
			// single object!
			const fileName = generateRandomString(6) + '.' + (imageToUpload.name.split('.').pop());

			imageToUpload.mv(__dirname + '/uploads/' + fileName, err => {
				if (err) {
					console.log('error upload image');
					console.log(err);
				} else {
					if (request.headers['sendjson']) {
						response.send({ url: 'http://i.overhash.net/' + fileName });
						return response.end();
					}

					response.redirect('/' + fileName);
				}
			});
		}
	}
})


app.listen(PORT, () => {
	console.log(`server started at http://localhost:${PORT}`);
});