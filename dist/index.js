"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const fs_1 = __importDefault(require("fs"));
const PORT = 8881;
const app = express_1.default();
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
app.use(express_fileupload_1.default({
    safeFileNames: true,
    preserveExtension: 24,
    abortOnLimit: true,
    responseOnLimit: 'Please upload a smaller file!',
    useTempFiles: true,
    tempFileDir: __dirname + '/tmp/',
    createParentPath: true,
    limits: { fileSize: 1024 * 1024 * 5 },
}));
app.get('/', (request, response) => {
    response.sendFile(__dirname + '/index.html');
});
app.get('*', (request, response) => {
    fs_1.default.exists(__dirname + '/uploads' + request.path, exists => {
        if (exists) {
            response.sendFile(__dirname + '/uploads' + request.path, err => {
                if (err) {
                    console.log('error sending file');
                    console.log(err);
                }
                ;
                response.end();
            });
        }
        else {
            response.send('Requested image does not exist');
            response.end();
        }
    });
});
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
                }
                else {
                    if (request.headers['sendjson']) {
                        response.send({ url: 'http://i.overhash.net/' + fileName });
                        return response.end();
                    }
                    response.redirect('/' + fileName);
                }
            });
        }
    }
});
app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map