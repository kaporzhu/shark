Notifications = new Meteor.Collection('notifications');

Notifications.allow({
    update: function(userId, doc, fields) {
        return ownsDocument(userId, doc) && _.without(fields, 'read').length==0;
    },
    insert: function() {
        return isSuperuser();
    }
});

createNotification = function(userId, content, url) {
    Notifications.insert({
        userId: userId,
        content: content,
        url: url,
        read: false,
        submitted: new Date()
    });
};
