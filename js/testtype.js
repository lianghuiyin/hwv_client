Hwv.TesttypesRoute = Ember.Route.extend({
    renderTemplate: function() {
        this.render({ outlet: 'testtypes' });
    },
    beforeModel: function() {
        
    },
    model: function () {
        return this.store.all('testtype');
    },
    afterModel: function(model, transition) {
    },
    actions:{
        goBack:function(){
            
            var self = this;
            $(".start-setting-testtypes.navigable-pane").navigablePop({
                targetTo:".start-setting.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('start.setting');
                }
            });
        },
        goTesttype:function(testtype){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('testtype',testtype);
        },
        goNew:function(){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('testtypes.new');
        }
    }
});
Hwv.TesttypesNewRoute = Ember.Route.extend({
    controllerName: 'testtype',
    renderTemplate: function(controller) {
        controller.set("isEditing",true);
        controller.set("isNew",true);
        controller.set("pannelTitle",Hwv.get("newModelTag").fmt(controller.get("modelName")));
        this.render('testtype', {outlet: 'testtype',controller: controller});
    },
    beforeModel: function() {
    },
    model:function(){
        return this.controllerFor("testtypes").createRecord();
    },
    actions:{
        goBack:function(){
            var controller = this.controller;
            controller.get("model").rollback();
            var self = this;
            $(".start-setting-testtypes-testtype.navigable-pane").navigablePop({
                targetTo:".start-setting-testtypes.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('testtypes');
                }
            });
        }
    }
});
Hwv.TesttypeRoute = Ember.Route.extend({
    controllerName: 'testtype',
    beforeModel: function() {
    },
    model:function(params){
        var curId = params.testtype_id;
        var testtype = this.store.getById('testtype', curId);
        if(!testtype && curId.indexOf("fixture") == 0){
            //如果没有找到记录，并且是fixture开头的新记录则创建一个新记录来匹配
            return this.controllerFor("testtypes").createRecord();
        }
        else{
            //注意，这里如果没有找到记录，并且不是fixture开头的新记录，将返回null
            return testtype;
        }
    },
    actions:{
        goBack:function(){
            var model = this.controller.get("model");
            model && model.rollback();
            var self = this;
            $(".start-setting-testtypes-testtype.navigable-pane").navigablePop({
                targetTo:".start-setting-testtypes.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('testtypes');
                }
            });
        }
    }
});
Hwv.TesttypeIndexRoute = Ember.Route.extend({
    controllerName: 'testtype',
    renderTemplate: function(controller) {
        controller.set("isEditing",false);
        controller.set("isNew",false);
        controller.set("pannelTitle",Hwv.get("detailModelTag").fmt(controller.get("modelName")));
        this.render('testtype',{ outlet: 'testtype',controller: controller });
    },
    actions:{
        goEdit:function(){
            this.transitionTo('testtype.edit');
        }
    }
});
Hwv.TesttypeEditRoute = Ember.Route.extend({
    controllerName: 'testtype',
    renderTemplate: function(controller) {
        controller.set("isEditing",true);
        controller.set("isNew",false);
        controller.set("pannelTitle",Hwv.get("editModelTag").fmt(controller.get("modelName")));
        this.render('testtype', {outlet: 'testtype',controller: controller});
    },
    actions:{
        goIndex:function(){
            this.transitionTo('testtype.index');
        },
    }
});


Hwv.Testtype = DS.Model.extend({
    name: DS.attr('string'),
    description: DS.attr('string'),
    creater: DS.attr('string'),
    created_date: DS.attr('string'),
    modifier: DS.attr('string'),
    modified_date: DS.attr('string')
});

Hwv.TesttypesView = Ember.View.extend({
    didInsertElement:function(buffer){
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "testtypes.index"){
            $(".start-setting.navigable-pane").navigablePush({
                targetTo:".start-setting-testtypes.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['start-setting-testtypes','navigable-pane','collapse']
});
Hwv.TesttypeView = Ember.View.extend({
    didInsertElement:function(buffer){
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "testtype.index" || currentRouteName == "role.edit.index" || currentRouteName == "roles.new.index"){
            $(".start-setting-testtypes.navigable-pane").navigablePush({
                targetTo:".start-setting-testtypes-testtype.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['start-setting-testtypes-testtype','navigable-pane','collapse']
});

Hwv.TesttypesController = Ember.ArrayController.extend({
    needs:["application"],
    createRecord:function(){
        var testtype = this.store.createRecord('testtype', {
            name: '新试验类型',
            description: 'testtype1111',
        });
        return testtype;
    },
    actions:{
        newRecord:function(){
            this.send("goNew");
        }
    }
});

Hwv.TesttypeController = Ember.ObjectController.extend({
    needs:["application"],
    isEditing:false,
    isNew:false,
    modelName:"试验类型",
    pannelTitle:"试验类型详情",
    helpInfo:"为车辆定义不同的试验类型。",
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

Hwv.Testtype.FIXTURES = [
    {
        id: 1,
        name: 'SWP/SSS',
        description: '',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    },
    {
        id: 2,
        name: 'SVP',
        description: '',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    },
    {
        id: 3,
        name: 'Einlauf&others',
        description: '',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    }
];
