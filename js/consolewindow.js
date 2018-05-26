Hwv.StartConsolewindowRoute = Ember.Route.extend({
    renderTemplate: function() {
        this.render({ outlet: 'consolewindow' });
    },
    beforeModel: function() {
        
    },
    model: function () {
        
        return this.store.all('console').get("lastObject");
    },
    afterModel: function(model, transition) {
    },
    actions:{
        goBack:function(){
            var self = this;
            $(".start-consolewindow.navigable-pane").navigablePop({
                targetTo:".start-index.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('start');
                }
            });
        }
    }
});

Hwv.StartConsolewindowView = Ember.View.extend({
    didInsertElement:function(buffer){
        
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "start.consolewindow.index"){
            $(".start-index.navigable-pane").navigablePush({
                targetTo:".start-consolewindow.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['start-consolewindow','navigable-pane','collapse']
});
Hwv.StartConsolewindowController = Ember.ObjectController.extend({
    needs:["application"],
    testtypes:function(){
        return this.store.filter("testtype",function(testtype){
            return true;
        });
    }.property(),
});

Hwv.ConsolewindowTesttypeItemController = Ember.ObjectController.extend({
    needs:["application"],
    approvesSortingDesc: ['start_date:desc'],
    sortedApprovesDesc: Ember.computed.sort('unfinishedApproves', 'approvesSortingDesc'),
    unfinishedApproves:function(){
        var currentTesttypeId = this.get("id");
        return this.store.filter("approve",function(approve){
            return !approve.get("is_finished") && approve.get("instance.testtype.id") == currentTesttypeId;
        });
    }.property(),
    offApproves:function(){
        return this.get("sortedApprovesDesc").filterBy("state","off");
    }.property("sortedApprovesDesc.@each.is_finished"),
    onApproves:function(){
        return this.get("sortedApprovesDesc").filterBy("state","on");
    }.property("sortedApprovesDesc.@each.is_finished")
});

