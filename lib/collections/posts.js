Posts = new Meteor.Collection('posts');

Meteor.methods({
    postInsert: function(postAttributes) {
        check(Meteor.userId(), String);
        check(postAttributes, {
            title: String,
            url: String
        });
        var user = Meteor.user();
        var post = _.extend(postAttributes, {
            userId: user._id,
            author: user.username,
            submitted: new Date()
        });
        var postId = Posts.insert(post);
        return {
            _id: postId
        };
    }
});

Posts.allow({
    update: function (userId, post, fields, modifier) {
        return true;
    },
    remove: function (userId, post) {
        return isSuperuser();
    },
    insert: function (userId, doc) {
        return isSuperuser();
    }
});
