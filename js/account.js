Hwv.AccountRoute = Ember.Route.extend({
    controllerName: 'account',
    beforeModel: function() {
        var isLogined = this.controllerFor("session").get("isLogined");
        if(!isLogined){
            this.transitionTo('login');
        }
    },
    model:function(){
        return this.controllerFor("session").get("user");
    },
    actions:{
        willTransition: function(transition) {
            //由于在其子路由中切换到父路由(比如点击导航顶部的设置按钮)时不会触发父路由对应view的didInsertElement函数，所以需要手动显示出对应的界面
            if(transition.targetName == "account.index"){
                $(".account-index.navigable-pane").addClass("active");
            }
        },
        goAccountinfo:function(){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('account.accountinfo');
        },
        goAccountpwd:function(){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('account.accountpwd');
        }
    }
});

Hwv.AccountView = Ember.View.extend({
    didInsertElement:function(buffer){
        //激活显示account模块对应的div，增加路由判断的目的是为了防止刷新浏览器时导航到深层路由后会显示该路由作为父路由的View
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "account.index"){
            $(".account-index.navigable-pane").addClass("active");
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    attributeBindings:"id",
    id:"account",
    classNames:['navigable-container']
});

Hwv.AccountController = Ember.ObjectController.extend({
    needs:["application"],
    actions:{
        logout:function(){
            this.get("controllers.application").send("logout");
        }
    }
});

