Router.onBeforeAction(Iron.Router.bodyParser.urlencoded({
    extended: true
}));

var path = Meteor.npmRequire('path');
var os = Meteor.npmRequire('os');
var fs = Meteor.npmRequire('fs');
var busboy = Meteor.npmRequire('connect-busboy');
Router.onBeforeAction(busboy({immediate: true}));
Router.onBeforeAction(function (req, res, next) {
    if (req.busboy) {
        var files = [];
        req.busboy.on('file', Meteor.bindEnvironment(function (fieldname, file, filename, encoding, mimetype) {
            var newFilename = Meteor.uuid() + '.' + _.last(filename.split('.'));
            var saveTo = path.join(os.tmpDir(), newFilename);
            file.pipe(fs.createWriteStream(saveTo));
            files.push({
                path: saveTo,
                oldName: filename,
                name: newFilename,
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
        //req.pipe(req.busboy);
    } else {
        next();
    }
});

Aliyun = Meteor.npmRequire('aliyun-sdk');
if (process.env.NODE_ENV === 'production') {
    var endpoint = 'http://oss-cn-beijing-internal.aliyuncs.com';
} else {
    var endpoint = 'http://oss-cn-beijing.aliyuncs.com';
}
AliyunOSS = new Aliyun.OSS({
    accessKeyId: ALIYUN_KEYID,
    secretAccessKey: ALIYUN_ACCESSKEY,
    endpoint: endpoint,
    apiVersion: '2013-10-15'
});
