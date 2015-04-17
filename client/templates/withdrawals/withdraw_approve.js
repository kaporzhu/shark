Template.withdrawApprove.helpers({
    withdrawals: function() {
        return Withdrawals.find();
    },
    message: function() {
        if (this.status == 'PROCESSING') {
            return '等待转账';
        } else if(this.status == 'DONE') {
            return '已完成';
        } else if (this.status == 'FAILED') {
            return '转账失败';
        }
        return this.status;
    },
    needTransfer: function() {
        return this.status == 'PROCESSING';
    }
});

Template.withdrawApprove.events({
    'click .transfered-btn': function(evt, template) {
        Withdrawals.update({_id: this._id}, {$set: {
            status: 'DONE',
            statusMessage: '提现成功',
            transferedAt: new Date()
        }});
        var notificationContent = '提现{amount}元已经到账'.replace('{amount}', this.amount);
        createNotification(this.userId, notificationContent, Router.path('withdraw'));
    },
    'click .transfer-failed-btn': function(evt, template) {
        Withdrawals.update({_id: this._id}, {$set: {
            status: 'FAILED',
            statusMessage: '提现失败，钱已经退回您的账户。请检查您的支付宝账号，再次提现。'
        }});
        Meteor.users.update({_id: this.userId}, {$inc: {balance: this.amount}});
        var notificationContent = '提现{amount}元失败，请检查您的支付宝账号'.replace('{amount}', this.amount);
        createNotification(this.userId, notificationContent, Router.path('withdraw'));
    }
});