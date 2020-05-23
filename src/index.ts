import express from "express";
import fileUpload from "express-fileupload";
import fs from "fs";

const PORT = 8881

const app = express();

app.use(fileUpload({
	safeFileNames: true,
	preserveExtension: 24,
	abortOnLimit: true,
	useTempFiles: true,
	tempFileDir: __dirname + '/tmp/',
	createParentPath: true,
	limits: { fileSize: 1024 * 1024 * 5 },
}))

function generateRandomString(length: number) {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;

	let result = '';
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}

	return result;
}

app.get('/', (request, response) => {
	return response.status(200).sendFile(__dirname + '/index.html');
});

app.get('*', (request, response) => {
	console.log('Request to download image');

	response.sendFile(__dirname + '/uploads' + request.path, err => {
		if (err) {
			if (err.message.includes("ENOENT: no such file or directory")) {
				return response.status(404).send('Requested image does not exist');
			}

			console.log('error sending file:');
			console.log(err);
			return response.status(500).send('Error sending file. Please check the console for more information');
		};

		response.status(200);
		return response.end();
	})
})

app.post('/', (request, response) => {
	if (request.files) {
		const imageToUpload = request.files.imageToUpload;

		if (imageToUpload && !Array.isArray(imageToUpload) && !imageToUpload.truncated && imageToUpload.size > 0) {
			// single object!
			const fileName = generateRandomString(6) + '.' + (imageToUpload.name.split('.').pop());

			imageToUpload.mv(__dirname + '/uploads/' + fileName, err => {
				if (err) {
					console.log('error uploading image');
					console.log(err);
					return response.status(500).send('Error moving file to destination. Please check the console for more information.');
				} else {
					return response.status(200).json({
						url: 'http://i.overhash.net/' + fileName
					});
				}
			});
		} else {
			return response.status(400).send('You did not upload a file to host.');
		}
	} else {
		return response.status(400).send('You did not upload a file to host.');
	}

})


app.listen(PORT, () => {
	console.log(`server started at http://localhost:${PORT}`);
});