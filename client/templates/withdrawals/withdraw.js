Template.withdraw.helpers({
    canWithdraw: function() {
        return Meteor.user().balance > 0;
    },
    withdrawals: function() {
        return Withdrawals.find({userId: Meteor.userId()}, {sort: {submitted: -1}});
    }
});

Template.withdraw.events({
    'click button': function(evt, template) {
        Meteor.call('withdraw', template.$('input').val(), function (err, result) {
            if (err) return alert(err.reason);
        });
    }
});