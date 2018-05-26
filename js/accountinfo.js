Hwv.AccountAccountinfoRoute = Ember.Route.extend({
    controllerName: 'account.accountinfo',
    beforeModel: function() {
    },
    model:function(params){
        return this.modelFor("account");
    },
    actions:{
        goBack:function(){
            
            var model = this.controller.get("model");
            model && model.rollback();
            var self = this;
            $(".account-accountinfo.navigable-pane").navigablePop({
                targetTo:".account-index.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('account');
                }
            });
        }
    }
});
Hwv.AccountAccountinfoIndexRoute = Ember.Route.extend({
    controllerName: 'account.accountinfo',
    renderTemplate: function(controller) {
        controller.set("isEditing",false);
        controller.set("pannelTitle",Hwv.get("detailModelTag").fmt(controller.get("modelName")));
        this.render('account/accountinfo',{ outlet: 'accountinfo',controller: controller });
    },
    actions:{
        goEdit:function(){
            this.transitionTo('account.accountinfo.edit');
        }
    }
});
Hwv.AccountAccountinfoEditRoute = Ember.Route.extend({
    controllerName: 'account.accountinfo',
    renderTemplate: function(controller) {
        controller.set("isEditing",true);
        controller.set("pannelTitle",Hwv.get("editModelTag").fmt(controller.get("modelName")));
        this.render('account/accountinfo', {outlet: 'accountinfo',controller: controller});
    },
    actions:{
        goIndex:function(){
            this.transitionTo('account.accountinfo.index');
        }
    }
});

Hwv.AccountAccountinfoView = Ember.View.extend({
    didInsertElement:function(buffer){
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "account.accountinfo.index" || currentRouteName == "account.accountinfo.edit.index"){
            $(".account-index.navigable-pane").navigablePush({
                targetTo:".account-accountinfo.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['account-accountinfo','navigable-pane','collapse']
});
Hwv.AccountAccountinfoController = Ember.ObjectController.extend({
    needs:["application"],
    isEditing:false,
    modelName:"账户",
    pannelTitle:"账户详情",
    helpInfo:"帮助信息",
    actions:{
        edit: function () {
            this.send("goEdit");
        },
        setIsDeveloper:function(value){
            this.get('model').set("is_developer",value);
        },
        save:function(){
            this.get('model').save().then(function(model){
            }, function(){
            });
            this.send("goIndex");
        },
        cancel:function(){
            this.get("model").rollback();
            this.send("goIndex");
        }
    }
});




