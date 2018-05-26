Hwv.WorkshopsRoute = Ember.Route.extend({
    renderTemplate: function() {
        this.render({ outlet: 'workshops' });
    },
    beforeModel: function() {
        
    },
    model: function () {
        return this.store.all('workshop');
    },
    afterModel: function(model, transition) {
    },
    actions:{
        goBack:function(){
            
            var self = this;
            $(".start-setting-workshops.navigable-pane").navigablePop({
                targetTo:".start-setting.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('start.setting');
                }
            });
        },
        goWorkshop:function(workshop){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('workshop',workshop);
        },
        goNew:function(){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('workshops.new');
        }
    }
});
Hwv.WorkshopsNewRoute = Ember.Route.extend({
    controllerName: 'workshop',
    renderTemplate: function(controller) {
        controller.set("isEditing",true);
        controller.set("isNew",true);
        controller.set("pannelTitle",Hwv.get("newModelTag").fmt(controller.get("modelName")));
        this.render('workshop', {outlet: 'workshop',controller: controller});
    },
    beforeModel: function() {
    },
    model:function(){
        return this.controllerFor("workshops").createRecord();
    },
    actions:{
        goBack:function(){
            var controller = this.controller;
            controller.get("model").rollback();
            var self = this;
            $(".start-setting-workshops-workshop.navigable-pane").navigablePop({
                targetTo:".start-setting-workshops.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('workshops');
                }
            });
        }
    }
});
Hwv.WorkshopRoute = Ember.Route.extend({
    controllerName: 'workshop',
    beforeModel: function() {
    },
    model:function(params){
        var curId = params.workshop_id;
        var workshop = this.store.getById('workshop', curId);
        if(!workshop && curId.indexOf("fixture") == 0){
            //如果没有找到记录，并且是fixture开头的新记录则创建一个新记录来匹配
            return this.controllerFor("workshops").createRecord();
        }
        else{
            //注意，这里如果没有找到记录，并且不是fixture开头的新记录，将返回null
            return workshop;
        }
    },
    actions:{
        goBack:function(){
            var model = this.controller.get("model");
            model && model.rollback();
            var self = this;
            $(".start-setting-workshops-workshop.navigable-pane").navigablePop({
                targetTo:".start-setting-workshops.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('workshops');
                }
            });
        }
    }
});
Hwv.WorkshopIndexRoute = Ember.Route.extend({
    controllerName: 'workshop',
    renderTemplate: function(controller) {
        controller.set("isEditing",false);
        controller.set("isNew",false);
        controller.set("pannelTitle",Hwv.get("detailModelTag").fmt(controller.get("modelName")));
        this.render('workshop',{ outlet: 'workshop',controller: controller });
    },
    actions:{
        goEdit:function(){
            this.transitionTo('workshop.edit');
        }
    }
});
Hwv.WorkshopEditRoute = Ember.Route.extend({
    controllerName: 'workshop',
    renderTemplate: function(controller) {
        controller.set("isEditing",true);
        controller.set("isNew",false);
        controller.set("pannelTitle",Hwv.get("editModelTag").fmt(controller.get("modelName")));
        this.render('workshop', {outlet: 'workshop',controller: controller});
    },
    actions:{
        goIndex:function(){
            this.transitionTo('workshop.index');
        },
    }
});

Hwv.Workshop = DS.Model.extend({
    number: DS.attr('string'),
    organization: DS.belongsTo('organization'),
    description: DS.attr('string'),
    creater: DS.attr('string'),
    created_date: DS.attr('string'),
    modifier: DS.attr('string'),
    modified_date: DS.attr('string')
});

Hwv.WorkshopsView = Ember.View.extend({
    didInsertElement:function(buffer){
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "workshops.index"){
            $(".start-setting.navigable-pane").navigablePush({
                targetTo:".start-setting-workshops.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['start-setting-workshops','navigable-pane','collapse']
});
Hwv.WorkshopView = Ember.View.extend({
    didInsertElement:function(buffer){
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "workshop.index" || currentRouteName == "workshop.edit.index" || currentRouteName == "workshops.new.index"){
            $(".start-setting-workshops.navigable-pane").navigablePush({
                targetTo:".start-setting-workshops-workshop.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['start-setting-workshops-workshop','navigable-pane','collapse']
});

Hwv.WorkshopsController = Ember.ArrayController.extend({
    needs:["application"],
    createRecord:function(){
        var workshop = this.store.createRecord('workshop', {
            number: 'New Group'
        });
        return workshop;
    },
    actions:{
        newRecord:function(){
            this.send("goNew");
        }
    }
});

Hwv.WorkshopController = Ember.ObjectController.extend({
    needs:["application"],
    isEditing:false,
    isNew:false,
    modelName:"车间组",
    pannelTitle:"车间组详情",
    helpInfo:"在工作单中指定该车间组后将自动关联到该车间组的关联组织，并且将自动发送到工作单到该车间组关联组织的工作台。",
    organizations:function(){
        return this.store.all("organization");
    }.property(),
    selectedOrganization:function(k,v){
        var model = this.get('model');
        if (v === undefined) {
            return model.get("organization");
        } else {
            model.set('organization', v);
            //纠正model的belongsTo关联属性在changedAttributes及rollback上的bug
            this.get("model").fixChangedAttributesBugForKey("organization");
            return v;
        }
    }.property("model.organization"),
    // selectedOrganizationBinding:"organization",
    actions:{
        edit: function () {
            this.send("goEdit");
        },
        save:function(){
            this.get('model').save().then(function(model){
            }, function(){
            });
            if(this.get("isNew")){
                this.send("goBack");
            }
            else{
                this.send("goIndex");
            }
        },
        cancel:function(){
            if(this.get("isNew")){
                this.send("goBack");
            }
            else{
                this.get("model").rollback();
                this.send("goIndex");
            }
        },
        deleteRecord:function(){
            this.get("model").deleteRecord();
            this.get("model").save();
            this.send("goBack");
        }
    }
});

Hwv.Workshop.FIXTURES = [
    {
        id: 1,
        number: 'GroupA',
        organization: 8,
        description: '',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    },
    {
        id: 2,
        number: 'GroupB',
        organization: 9,
        description: '',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    },
    {
        id: 3,
        number: 'GroupC',
        organization: 10,
        description: '',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    },
    {
        id: 4,
        number: 'GroupE',
        organization: 11,
        description: '',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    },
    {
        id: 5,
        number: 'GroupK',
        organization: 12,
        description: '',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    }
];
