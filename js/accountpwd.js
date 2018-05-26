Hwv.AccountAccountpwdRoute = Ember.Route.extend({
    controllerName: 'account.accountpwd',
    renderTemplate: function(controller) {
        this.render('account/accountpwd',{ outlet: 'accountpwd',controller: controller });
    },
    beforeModel: function() {
    },
    model:function(params){
        return this.store.createRecord("accountpwd");
    },
    actions:{
        goBack:function(){
            
            var model = this.controller.get("model");
            model && model.rollback();
            var self = this;
            $(".account-accountpwd.navigable-pane").navigablePop({
                targetTo:".account-index.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('account');
                }
            });
        }
    }
});

Hwv.Accountpwd = DS.Model.extend({
    old_pwd: DS.attr('string'),
    new_pwd: DS.attr('string'),
    confirm_pwd: DS.attr('string')
});

Hwv.AccountAccountpwdView = Ember.View.extend({
    didInsertElement:function(buffer){
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "account.accountpwd.index"){
            $(".account-index.navigable-pane").navigablePush({
                targetTo:".account-accountpwd.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['account-accountpwd','navigable-pane','collapse']
});
Hwv.AccountAccountpwdController = Ember.ObjectController.extend({
    needs:["application"],
    pannelTitle:"修改密码",
    actions:{
        save:function(){
            this.get('model').save().then(function(model){
            }, function(){
            });
            this.send("goBack");
        }
    }
});




