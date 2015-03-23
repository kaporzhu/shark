Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound'
});

PostController = RouteController.extend({
    waitOn: function () {
        return this.subscribe('posts');
    }
});

var requireLogin = function () {
    if (!Meteor.user()) {
        if (Meteor.loggingIn()) {
            this.render(this.loadingTemplate);
        } else {
            this.render('accessDenied', {
                data: {
                    errorMsg: '请先登录'
                }
            });
        }
    } else {
        this.next();
    }
};

var requireSuperuser = function () {
    if (!Meteor.user()) {
        if (Meteor.loggingIn()) {
            this.render(this.loadingTemplate);
        } else {
            this.render('accessDenied', {
                data: {
                    errorMsg: '请先登录'
                }
            });
        }
    } else {
        if (!Meteor.user().profile.is_superuser) {
            this.render('accessDenied', {
                data: {
                    errorMsg: '只有系统管理员才能查看该页面'
                }
            });
        } else {
            this.next();
        }
    }
};

Router.route('/', {
    name: 'posts.list',
    controller: PostController
});

Router.route('/posts/create', {
    name: 'post.create'
});

Router.route('/posts/upload_photo', {
    name: 'post.uploadphoto',
    where: 'server'
}).post(function () {
    var fs = Meteor.npmRequire('fs');
    var response = this.response;
    var request = this.request;
    for (var i in this.request.files) {
        var file = this.request.files[i];
        var buffer = fs.readFileSync(file.path);
        var uploadResult = Async.runSync(function (done) {
            AliyunOSS.putObject({
                Bucket: 'shark-imgs',
                Key: file.name,
                Body: buffer,
                AccessControlAllowOrigin: '',
                ContentType: file.mimetype,
                CacheControl: 'no-cache',
                ContentDisposition: '',
                ContentEncoding: 'utf-8',
                ServerSideEncryption: 'AES256',
                Expires: new Date()
            }, function (err, msg) {
                if (err) {
                    console.log('error:', err);
                    return;
                }
                done(null, msg);
                response.end(JSON.stringify({file: file.name}));
            });
        });
    }
});

Router.onBeforeAction(requireSuperuser, {
    only: ['postCreate']
});
