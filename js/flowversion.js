Hwv.FlowversionRoute = Ember.Route.extend({
    // templateName: 'flowversion',
    controllerName: 'flowversion',
    renderTemplate: function(controller) {
        controller.set("isEditing",false);
        controller.set("pannelTitle",Hwv.get("detailModelTag").fmt(controller.get("modelName")));
        this.render('flowversion',{ into:'start', outlet: 'flowversion',controller: controller });
    },
    beforeModel: function() {
    },
    model:function(params){
        var curId = params.flowversion_id;
        return this.store.getById('flowversion', curId);
    },
    actions:{
        goBack:function(){
            var model = this.controller.get("model");
            model && model.rollback();
            var self = this;
            $(".start-setting-flows-flow-flowversion.navigable-pane").navigablePop({
                targetTo:".start-setting-flows-flow.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('flow',model.get("flow.id"));
                }
            });
        }
    }
});
Hwv.FlowversionIndexRoute = Ember.Route.extend({
    // templateName: 'flowversion',
    controllerName: 'flowversion',
    renderTemplate: function(controller) {
        controller.set("isEditing",false);
        controller.set("pannelTitle",Hwv.get("detailModelTag").fmt(controller.get("modelName")));
        this.render('flowversion',{ into:'start',outlet: 'flowversion',controller: controller });
    },
    actions:{
        goEdit:function(){
            this.transitionTo('flowversion.edit');
        }
    }
});
Hwv.FlowversionEditRoute = Ember.Route.extend({
    // templateName: 'flowversion',
    controllerName: 'flowversion',
    renderTemplate: function(controller) {
        controller.set("isEditing",true);
        controller.set("pannelTitle",Hwv.get("editModelTag").fmt(controller.get("modelName")));
        this.render('flowversion', { into:'start',outlet: 'flowversion',controller: controller});
    },
    actions:{
        goIndex:function(){
            this.transitionTo('flowversion.index');
        }
    }
});

Hwv.Flowversion = DS.Model.extend({
    flow: DS.belongsTo('flow'),
    number: DS.attr('number'),
    is_current: DS.attr('boolean', {defaultValue: true}),
    // steps: DS.hasMany('step', {key: 'comments', embedded: true}),
    steps: DS.hasMany('step', {embedded: 'always'}),
    // steps: DS.attr('string'),
    creater: DS.attr('string'),
    created_date: DS.attr('string'),
    modifier: DS.attr('string'),
    modified_date: DS.attr('string')
});

Hwv.FlowversionView = Ember.View.extend({
    // templateName:"flowversion",
    didInsertElement:function(buffer){
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "flowversion.index" || currentRouteName == "flowversion.edit.index"){
            $(".start-setting-flows-flow.navigable-pane").navigablePush({
                targetTo:".start-setting-flows-flow-flowversion.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['start-setting-flows-flow-flowversion','navigable-pane','collapse']
});

Hwv.FlowversionController = Ember.ObjectController.extend({
    needs:["application","selectedStep"],
    isEditing:false,
    modelName:"流程步骤",
    pannelTitle:"流程步骤详情",
    helpInfo:"请选择一个步骤",
    selectedStep:null,
    stepsInList:function(){
        return this.get("steps").filter(function(item){
            return !item.get("isDeletedForTemp");
        });
    }.property("steps.@each.isDeletedForTemp"),
    actions:{
        edit: function () {
            this.send("goEdit");
        },
        save:function(){
            this.get('model').save().then(function(model){
            }, function(){
            });
            this.send("goIndex");
        },
        cancel:function(){
            // this.get("model").rollback();
            
            // this.get("selectedStep").deleteRecord();
            this.get("model").get("steps").forEach(function(item){
                if(item.get("isNew")){
                    //这里因不能把新建的步骤通过rollback回滚来删除，所以只能手动删除。
                    item.deleteRecord();
                }
                else if(item.get("isDeletedForTemp")){
                    item.set("isDeletedForTemp",false);
                }
                else{
                    item.rollback();
                }
            });
            this.get("model").rollback();
            // this.get("selectedStep").deleteRecord();
            // this.set("selectedStep",null);
            this.send("goIndex");
        },
        selStep:function(id){
            this.set("selectedStep",this.get("steps").findBy("id",id));
            // var stepController = this.get("controllers.step");
            // stepController.set("content",this.get("steps").findBy("id",id));
        },
        addStep:function(){
            var newStep = this.get('model').get("steps").createRecord({
                name: '中间步骤',
                type: 'process',
                handler_org_type: 'fix_organization',
                next_step_type: 'all_step'
            })
            this.set("selectedStep",newStep);
        },
        deleteStep:function(){
            this.get("selectedStep").set("isDeletedForTemp",true);
            this.set("selectedStep",null);
        }
    }
});

Hwv.Flowversion.FIXTURES = [
    {
        id: 1,
        flow: 1,
        number: 1,
        is_current: true,
        steps:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
        // steps: [
        //     {
        //         id: 1,
        //         name: '开始'
        //     },
        //     {
        //         id: 2,
        //         name: '结束'
        //     }
        // ],
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    }
];
