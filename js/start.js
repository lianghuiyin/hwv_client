Hwv.StartRoute = Ember.Route.extend({
    beforeModel: function() {
        var isLogined = this.controllerFor("session").get("isLogined");
        if(!isLogined){
            this.transitionTo('login');
        }
    },
    actions:{
        willTransition: function(transition) {
            //由于在其子路由中切换到父路由(比如点击导航顶部的主页按钮)时不会触发父路由对应view的didInsertElement函数，所以需要手动显示出对应的界面
            if(transition.targetName == "start.index"){
                $(".start-index.navigable-pane").addClass("active");
            }
        },
        goInstances:function(){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('start.instances.inbox');
        },
        goSetting:function(){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('start.setting');
        },
        goExhibitionshow:function(){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('start.exhibitionshow');
        },
        goConsoleWindow:function(){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('start.consolewindow');
        }
    }
});

Hwv.StartView = Ember.View.extend({
    didInsertElement:function(buffer){
        //激活显示start模块对应的div，增加路由判断的目的是为了防止刷新浏览器时导航到深层路由后会显示该路由作为父路由的View
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "start.index"){
            $(".start-index.navigable-pane").addClass("active");
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    attributeBindings:"id",
    id:"home",
    classNames:['navigable-container']
});

Hwv.StartController = Ember.Controller.extend({
    needs:["application"],
    consoles:function(){
        //这里不可以用store.all().filterBy函数，因为那个函数不会自动更新
        return this.store.filter('console', function (console) {
            return Hwv.currentUser.get("organization.id") == console.get("organization.id");
        });
    }.property(),
});


