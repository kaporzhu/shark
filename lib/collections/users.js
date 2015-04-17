Meteor.users.allow({
    update: function (userId, post, fields, modifier) {
        if (_.without(fields, 'balance').length == 0) {
            return isSuperuser();
        }
        return false;
    }
});