Comments = new Meteor.Collection('comments');

Comments.allow({
    remove: function (userId, comment) {
        if (isSuperuser()) {
            // decrease comment count in post
            Posts.update({_id: comment.postId}, {$inc: {commentCount: -1}});
            return true;
        }
        return false;
    }
});

Meteor.methods({
    commentInsert: function(commentAttributes) {
        check(Meteor.userId(), String);
        check(commentAttributes, {
            postId: String,
            imgs: [{
                url: String
            }],
            content: String
        });

        var user = Meteor.user();
        if (Comments.findOne({postId: commentAttributes.postId, userId: user._id})) {
            throw new Meteor.Error('invalid', 'You have already submitted a comment');
        }
        var comment = _.extend(commentAttributes, {
            userId: user._id,
            author: user.username,
            like: 0,
            likers: [],
            dislike: 0,
            dislikers: [],
            submitted: new Date()
        });
        comment.imgs = _.map(comment.imgs, function(img){
            return _.extend(img, {
                picked: false
            });
        });

        // update commentCount in Post
        Posts.update({_id: commentAttributes.postId}, {$inc: {commentCount: 1}});

        var commentId = Comments.insert(comment);
        return {
            _id: commentId
        };
    },
    commentEdit: function(commentAttributes) {
        var userId = Meteor.userId();
        check(userId, String);
        check(Meteor.userId(), String);
        check(commentAttributes, {
            imgs: [{
                url: String
            }],
            content: String,
            commentId: String
        });

        var comment = Comments.findOne({
            _id: commentAttributes.commentId,
            userId: userId
        });
        _.each(commentAttributes.imgs, function(img) {
            img.picked = false;
        });
        commentAttributes.imgs = _.map(commentAttributes.imgs, function (img) {
            for (var i in comment.imgs) {
                if (comment.imgs[i] && comment.imgs[i].url == img.url) {
                    img.picked = comment.imgs[i].picked;
                    break;
                }
            }
            return img;
        });
        var affected = Comments.update({
            _id: commentAttributes.commentId,
            userId: userId
        }, {
            $set: {
                content: commentAttributes.content,
                imgs: commentAttributes.imgs,
                reject: null
            }
        });
        if (! affected)
            throw new Meteor.Error('invalid', 'Edit comment failed');
    },
    commentVote: function(commentId, like) {
        var userId = Meteor.userId();
        check(userId, String);
        check(commentId, String);
        var query = {
            _id: commentId,
            likers: {$ne: userId},
            dislikers: {$ne: userId}
        };
        if (like) {
            var update = {
                $addToSet: {likers: userId},
                $inc: {like: 1}
            };
        } else {
            var update = {
                $addToSet: {dislikers: userId},
                $inc: {dislike: 1}
            };
        }
        var affected = Comments.update(query, update);
        if (! affected)
            throw new Meteor.Error('invalid', "You weren't able to vote this comment");
    },
    commentReward: function(commentId, amount) {
        var userId = Meteor.userId();
        check(userId, String);
        check(commentId, String);
        var user = Meteor.user();
        if (! user.is_superuser)
            throw new Meteor.Error('forbidden', 'You are not allowed to reward comment');

        var affected = Comments.update({
            _id: commentId,
            reward: {$exists : false}
        }, {
            $set: {
                reward: {
                    amount: amount,
                    userId: userId,
                    submitted: new Date()
                }}
        });
        if (! affected)
            throw new Meteor.Error('invalid', "You can't reward this comment");

        var comment = Comments.findOne({_id: commentId});
        var post = Posts.findOne({_id: comment.postId});
        Rewards.insert({
            userId: comment.userId,
            authorId: userId,
            author: user.username,
            amount: amount,
            postId: comment.postId,
            postTitle: post.title,
            commentId: commentId,
            submitted: new Date()
        });

        Meteor.users.update({_id: comment.userId}, {$inc: {balance: amount}});
        var notificationContent = '您在"{title}..."中的回复获得了{amount}元的奖励！'.replace('{title}', post.title.slice(0, 10)).replace('{amount}', amount);
        createNotification(comment.userId, notificationContent, Router.path('post.item', {_id: post._id}));
    },
    commentReject: function(commentId, reason) {
        var userId = Meteor.userId();
        check(userId, String);
        check(reason, String);
        var user = Meteor.user();
        if (! user.is_superuser)
            throw new Meteor.Error('forbidden', 'You are not allowed to reward comment');

        var affected = Comments.update({
            _id: commentId,
            reject: null
        }, {
            $set: {
                reject: {
                    reason: reason,
                    userId: userId,
                    submitted: new Date()
                }}
        });
        if (! affected)
            throw new Meteor.Error('invalid', "You can't reject this comment");

        var comment = Comments.findOne({_id: commentId});
        var post = Posts.findOne({_id: comment.postId});
        var notificationContent = '您在"{title}..."中的邮费奖励申请被管理员拒绝了！'.replace('{title}', post.title.slice(0, 10));
        createNotification(comment.userId, notificationContent, Router.path('post.item', {_id: post._id}));
    },
    pickImage: function(url, commentId) {
        var userId = Meteor.userId();
        check(userId, String);
        check(url, String);
        check(commentId, String);
        var user = Meteor.user();
        if (! user.is_superuser)
            throw new Meteor.Error('forbidden', 'You are not allowed to reward comment');

        var affected = Comments.update({_id: commentId, imgs: {url: url, picked: false}}, {$set: {'imgs.$.picked': true}});
        var comment = Comments.findOne({_id: commentId});
        if (affected) {
            Posts.update({_id: comment.postId}, {$push: {
                pickedImages: {
                    url: url,
                    userId: comment.userId,
                    author: comment.author,
                    commentId: commentId,
                    submitted: new Date()
                }
            }});
        } else {
            // try to remove the picked image
            var affected = Comments.update({_id: commentId, imgs: {url: url, picked: true}}, {$set: {'imgs.$.picked': false}});
            if (affected) {
                Posts.update({_id: comment.postId}, {$pull: {
                    pickedImages: {url: url}
                }});
            }
        }
    }
});
