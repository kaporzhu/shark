Template.notifications.helpers({
    notifications: function() {
        return Notifications.find({userId: Meteor.userId()}, {sort: {submitted: -1}});
    },
    notificationUnreadCount: function(){
        return Notifications.find({userId: Meteor.userId(), read: false}).count();
    },
    notificationCount: function(){
        return Notifications.find({userId: Meteor.userId()}).count();
    }
});

Template.notificationItem.events({
    'click a': function() {
        if (!this.read)
            Notifications.update(this._id, {$set: {read: true}});
    }
});

Template.notificationItem.helpers({
    unread: function() {
        return !this.read;
    }
});
