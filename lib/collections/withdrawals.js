Withdrawals = new Meteor.Collection('withdrawals');

Meteor.methods({
    withdraw: function(alipay) {
        check(Meteor.userId(), String);
        check(alipay, String);
        var user = Meteor.user();
        if (user.balance <= 0)
            throw new Meteor.Error('invalid', 'No money can be withdraw.');

        Withdrawals.insert({
            userId: user._id,
            author: user.username,
            amount: user.balance,
            alipay: alipay,
            status: 'PROCESSING',
            statusMessage: '我们会在24小时内把钱打入您的账户，请耐心等待一下，感谢您的支持。',
            submitted: new Date()
        });
        Meteor.users.update({_id: user._id}, {$set: {balance: 0, 'profile.alipay': alipay}});
    }
});

Withdrawals.allow({
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
