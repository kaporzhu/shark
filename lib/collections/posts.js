Posts = new Meteor.Collection('posts');

Meteor.methods({
    postInsert: function(postAttributes) {
        check(Meteor.userId(), String);
        check(postAttributes, {
            title: String,
            description: String,
            overview: String,
            clothings: [{
                type: String,
                name: String,
                price: Number,
                img: String,
                url: String,
                alimamaUrl: String
            }]
        });

        if (Meteor.isServer) {
            if (! isSuperuser()) {
                throw new Meteor.Error('invalid', 'Only superuser can create post!');
            }
        }

        var user = Meteor.user();
        var post = _.extend(postAttributes, {
            userId: user._id,
            author: user.username,
            like: 0,
            likers: [],
            submitted: new Date()
        });

        var postId = Posts.insert(post);
        return {
            _id: postId
        };
    },
    postLike: function(postId) {
        var userId = Meteor.userId();
        check(userId, String);
        check(postId, String);
        if (Posts.findOne({_id: postId, likers: userId})) {
            var affected = Posts.update({
                _id: postId
            }, {
                $pull: {likers: userId},
                $inc: {like: -1}
            });
            removeFavorite(postId);
        } else {
            var affected = Posts.update({
                _id: postId,
                likers: {$ne: userId}
            }, {
                $addToSet: {likers: userId},
                $inc: {like: 1}
            });
            createFavorite(Posts.findOne({_id: postId}));
        }
        if (! affected)
            throw new Meteor.Error('invalid', "You weren't able to like/dislike this post");
    }
});

Posts.allow({
    update: function (userId, post, fields, modifier) {
        return isSuperuser();
    },
    remove: function (userId, post) {
        return isSuperuser();
    },
    insert: function (userId, doc) {
        return isSuperuser();
    }
});
