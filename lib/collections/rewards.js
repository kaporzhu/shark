Rewards = new Meteor.Collection('rewards');

Rewards.allow({
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
