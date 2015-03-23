Router.onBeforeAction(Iron.Router.bodyParser.urlencoded({
    extended: true
}));

var path = Meteor.npmRequire('path');
var os = Meteor.npmRequire('os');
var fs = Meteor.npmRequire('fs');
var busboy = Meteor.npmRequire('connect-busboy');
Router.onBeforeAction(busboy({immediate: true}));
Router.onBeforeAction(function (req, res, next) {
    var files = [];
    if (req.busboy) {
        req.busboy.on('file', Meteor.bindEnvironment(function (fieldname, file, filename, encoding, mimetype) {
            var saveTo = path.join(os.tmpDir(), filename);
            file.pipe(fs.createWriteStream(saveTo));
            files.push({
                path: saveTo,
                name: filename,
                mimetype: mimetype
            });
        }));
        req.busboy.on("field", function(fieldname, value) {
            req.body[fieldname] = value;
        });
        req.busboy.on("finish", function () {
            req.files = files;
            next();
        });
        req.pipe(req.busboy);
    } else {
        next();
    }
});

Aliyun = Meteor.npmRequire('aliyun-sdk');
AliyunOSS = new Aliyun.OSS({
    accessKeyId: ALIYUN_KEYID,
    secretAccessKey: ALIYUN_ACCESSKEY,
    endpoint: 'http://oss-cn-beijing.aliyuncs.com',
    apiVersion: '2013-10-15'
});
