Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound',
    waitOn: function() {
        return [
            Meteor.subscribe('userData'),
            Meteor.subscribe('notifications'),
            Meteor.subscribe('favorites')
        ];
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
        if (!Meteor.user().is_superuser) {
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

PostsListController = RouteController.extend({
    increment: 10,
    postLimit: function() {
        return parseInt(this.params.limit) || this.increment;
    },
    findOptions: function() {
        return {sort: {submitted: -1}, limit: this.postLimit()};
    },
    subscriptions: function() {
        this.postsSub = Meteor.subscribe('posts', {}, this.findOptions());
    },
    posts: function() {
        return Posts.find({}, this.findOptions());
    },
    data: function() {
        var hasMore = this.posts().count() === this.postLimit();
        var nextPath = this.route.path({limit: this.postLimit() + this.increment});
        return {
            posts: this.posts(),
            ready: this.postsSub.ready,
            nextPath: hasMore ? nextPath : null
        };
    }
});

Router.route('/', {
    name: 'home',
    waitOn: function() {
        return [
            Meteor.subscribe('posts', {pickedImages: null}, {sort: {submitted: -1}, limit: 4}),
            Meteor.subscribe('posts', {}, {sort: {commentCount: -1}, limit: 4})
        ]
    },
    data: function() {
        return {
            savage_posts: Posts.find({pickedImages: null}, {sort: {submitted: -1}, limit: 4}),
            hotest_posts: Posts.find({}, {sort: {commentCount: -1}, limit: 4})
        }
    }
});

Router.route('/withdraw', {
    name: 'withdraw',
    waitOn: function() {
        return Meteor.subscribe('userWithdrawals');
    }
});

Router.route('/withdraw/approve', {
    name: 'withdraw.approve',
    waitOn: function() {
        return Meteor.subscribe('withdrawals', {sort: {submitted: -1}});
    }
});

Router.route('posts/list/:limit?', {
    name: 'posts.list',
    controller: PostsListController
});

Router.route('/posts/create', {
    name: 'post.create'
});

Router.route('/posts/:_id', {
    name: 'post.item',
    subscriptions: function() {
        this.subscribe('post', this.params['_id']).wait();
        this.subscribe('comments', this.params['_id']);
    },
    data: function() {
        return Posts.findOne({_id: this.params['_id']});
    }
});

Router.route('/posts/upload_photo', {
    name: 'post.uploadphoto',
    where: 'server'
}).post(function () {
    var fs = Meteor.npmRequire('fs');
    var response = this.response;
    var request = this.request;
    for (var i in request.files) {
        var file = request.files[i];
        var fileExt = _.last(file.oldName.split('.')).toLowerCase();
        if (_.indexOf(['jpg', 'png', 'jpeg'], fileExt) == -1) {
            response.writeHead(402);
            response.end(JSON.stringify({
                reason: 'Unsupported image file formation'
            }));
            return;
        }
        fs.readFile(file.path, function(err, data){
            if (err) {
                console.error(err);
                response.writeHead(500);
                response.end(JSON.stringify({
                    reason: err
                }));
                return;
            }

            AliyunOSS.putObject({
                Bucket: request.body.bucket,
                Key: file.name,
                Body: data,
                AccessControlAllowOrigin: '',
                ContentType: file.mimetype,
                CacheControl: 'no-cache',
                ContentDisposition: '',
                ContentEncoding: 'utf-8',
                ServerSideEncryption: 'AES256',
                Expires: new Date()
            }, function (err, msg) {
                if (err) {
                    console.error(err);
                    response.writeHead(500);
                    response.end(JSON.stringify({
                        reason: err
                    }));
                    return;
                }

                var url = 'http://{bucket}.izoushi.com/{name}'.replace('{bucket}', request.body.bucket).replace('{name}', file.name);
                response.end(JSON.stringify({
                    oldFilename: file.oldName,
                    url: url
                }));
            });
        });
    }
});

Router.onBeforeAction(requireLogin, {
    only: ['withdraw']
});

Router.onBeforeAction(requireSuperuser, {
    only: ['post.create', 'withdraw.approve']
});
