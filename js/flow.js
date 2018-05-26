
Hwv.FlowsRoute = Ember.Route.extend({
    renderTemplate: function() {
        this.render({ outlet: 'flows' });
    },
    beforeModel: function() {
        
    },
    model: function () {
        return this.store.all('flow');
    },
    afterModel: function(model, transition) {
    },
    actions:{
        goBack:function(){
            
            var self = this;
            $(".start-setting-flows.navigable-pane").navigablePop({
                targetTo:".start-setting.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('start.setting');
                }
            });
        },
        goFlow:function(flow){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('flow',flow);
        },
        goNew:function(){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('flows.new');
        }
    }
});
Hwv.FlowsNewRoute = Ember.Route.extend({
    controllerName: 'flow',
    renderTemplate: function(controller) {
        controller.set("isEditing",true);
        controller.set("isNew",true);
        controller.set("pannelTitle",Hwv.get("newModelTag").fmt(controller.get("modelName")));
        this.render('flow', {outlet: 'flow',controller: controller});
    },
    beforeModel: function() {
    },
    model:function(){
        return this.controllerFor("flows").createRecord();
    },
    actions:{
        goBack:function(){
            var controller = this.controller;
            controller.get("model").rollback();
            var self = this;
            $(".start-setting-flows-flow.navigable-pane").navigablePop({
                targetTo:".start-setting-flows.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('flows');
                }
            });
        }
    }
});
Hwv.FlowRoute = Ember.Route.extend({
    controllerName: 'flow',
    beforeModel: function() {
    },
    model:function(params){
        var curId = params.flow_id;
        var flow = this.store.getById('flow', curId);
        if(!flow && curId.indexOf("fixture") == 0){
            //如果没有找到记录，并且是fixture开头的新记录则创建一个新记录来匹配
            return this.controllerFor("flows").createRecord();
        }
        else{
            //注意，这里如果没有找到记录，并且不是fixture开头的新记录，将返回null
            return flow;
        }
    },
    actions:{
        goBack:function(){
            var model = this.controller.get("model");
            model && model.rollback();
            var self = this;
            $(".start-setting-flows-flow.navigable-pane").navigablePop({
                targetTo:".start-setting-flows.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('flows');
                }
            });
        }
    }
});
Hwv.FlowIndexRoute = Ember.Route.extend({
    controllerName: 'flow',
    renderTemplate: function(controller) {
        controller.set("isEditing",false);
        controller.set("isNew",false);
        controller.set("pannelTitle",Hwv.get("detailModelTag").fmt(controller.get("modelName")));
        this.render('flow',{ outlet: 'flow',controller: controller });
    },
    actions:{
        goEdit:function(){
            this.transitionTo('flow.edit');
        },
        goFlowversion:function(flowversion){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('flowversion',flowversion);
        }
    }
});
Hwv.FlowEditRoute = Ember.Route.extend({
    controllerName: 'flow',
    renderTemplate: function(controller) {
        controller.set("isEditing",true);
        controller.set("isNew",false);
        controller.set("pannelTitle",Hwv.get("editModelTag").fmt(controller.get("modelName")));
        this.render('flow', {outlet: 'flow',controller: controller});
    },
    actions:{
        goIndex:function(){
            this.transitionTo('flow.index');
        },
    }
});

Hwv.Flow = DS.Model.extend({
    name: DS.attr('string'),
    type: DS.attr('string'),//有两种类型freedom和strict，分别表示自由流程及严谨流程、自由流程不可以设置流程步骤指向，其工作单可以自由选择下一步骤、严谨流可以设置流程步骤指向，其工作单的下一步骤将只能流转到设置好的指向步骤中
    current: DS.belongsTo('flowversion'),
    is_valid: DS.attr('boolean', {defaultValue: false}),
    is_enabled: DS.attr('boolean', {defaultValue: false}),
    description: DS.attr('string'),
    help_text: DS.attr('string'),
    creater: DS.attr('string'),
    created_date: DS.attr('string'),
    modifier: DS.attr('string'),
    modified_date: DS.attr('string')
});

Hwv.FlowsView = Ember.View.extend({
    didInsertElement:function(buffer){
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "flows.index"){
            $(".start-setting.navigable-pane").navigablePush({
                targetTo:".start-setting-flows.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['start-setting-flows','navigable-pane','collapse']
});
Hwv.FlowView = Ember.View.extend({
    didInsertElement:function(buffer){
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "flow.index" || currentRouteName == "flow.edit.index" || currentRouteName == "flow.new.index"){
            $(".start-setting-flows.navigable-pane").navigablePush({
                targetTo:".start-setting-flows-flow.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['start-setting-flows-flow','navigable-pane','collapse']
});

Hwv.FlowsController = Ember.ArrayController.extend({
    needs:["application"],
    actions:{
        newRecord:function(){
            this.send("goNew");
        }
    }
});

Hwv.FlowController = Ember.ObjectController.extend({
    needs:["application"],
    isEditing:false,
    isNew:false,
    modelName:"流程",
    pannelTitle:"流程详情",
    helpInfo:"点击修改按钮修改流程基本信息或点击流程步骤按钮查看和设置流程步骤。",
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

Hwv.Flow.FIXTURES = [
    {
        id: 1,
        name: '标准自由流程',
        type: 'freedom',
        current: 1,
        is_valid: true,
        is_enabled: true,
        description: '作为系统初始版本需要的流程设置，该流程不能定制其流程流转方向（但可以定制其“返回上一步骤”功能）。',
        help_text: '',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    }
];
