Meteor.publish('posts', function (query, options) {
    check(query, Object);
    check(options, {
        sort: Object,
        limit: Number
    });
    return Posts.find(query, options);
});

Meteor.publish('post', function (postId) {
    check(postId, String);
    return Posts.find({_id: postId});
});

Meteor.publish('comments', function (postId) {
    check(postId, String);
    return Comments.find({postId: postId});
});

Meteor.publish('userData', function () {
    return Meteor.users.find({_id: this.userId},
        {fields: {is_superuser: 1, balance: 1}});
});

Meteor.publish('rewards', function () {
    if (this.userId)
        return Rewards.find({userId: this.userId});
    else
        this.ready();
});

Meteor.publish('userWithdrawals', function () {
    if (this.userId)
        return Withdrawals.find({userId: this.userId});
    else
        this.ready();
});

Meteor.publish('withdrawals', function (options) {
    check(options, {
        sort: Object
    });
    if (this.userId && Meteor.users.findOne({_id: this.userId}).is_superuser) {
        return Withdrawals.find({}, options);
    } else {
        this.ready();
    }
});

Meteor.publish('notifications', function () {
    if (this.userId)
        return Notifications.find({userId: this.userId});
    else
        this.ready();
});

Meteor.publish('favorites', function () {
    if (this.userId)
        return Favorites.find({userId: this.userId}, {$limit: 10});
    else
        this.ready();
});
