Hwv.StartSettingRoute = Ember.Route.extend({
    renderTemplate: function() {
        this.render({ outlet: 'setting' });
    },
    actions:{
        goBack:function(){
            
            var self = this;
            $(".start-setting.navigable-pane").navigablePop({
                targetTo:".start-index.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('start');
                }
            });
        },
        goRoles:function(){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('roles');
        },
        goOrganizations:function(){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('organizations');
        },
        goUsers:function(){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('users');
        },
        goCars:function(){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('cars');
        },
        goWorkshops:function(){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('workshops');
        },
        goTesttypes:function(){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('testtypes');
        },
        goConsoles:function(){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('consoles');
        },
        goFlows:function(){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('flows');
        },
        goExhibitions:function(){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('exhibitions');
        }
    }
});

Hwv.StartSettingView = Ember.View.extend({
    didInsertElement:function(buffer){
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "start.setting.index"){
            $(".start-index.navigable-pane").navigablePush({
                targetTo:".start-setting.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['start-setting','navigable-pane','collapse']
});
Hwv.StartSettingController = Ember.ObjectController.extend({
    needs:["application"]
});

