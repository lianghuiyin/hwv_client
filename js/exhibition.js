Hwv.ExhibitionsRoute = Ember.Route.extend({
    renderTemplate: function() {
        this.render({ outlet: 'exhibitions' });
    },
    beforeModel: function() {
        
    },
    model: function () {
        
        return this.store.all('exhibition');
    },
    afterModel: function(model, transition) {
    },
    actions:{
        goBack:function(){
            
            var self = this;
            $(".start-setting-exhibitions.navigable-pane").navigablePop({
                targetTo:".start-setting.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('start.setting');
                }
            });
        },
        goExhibition:function(exhibition){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('exhibition',exhibition);
        },
        goNew:function(){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('exhibitions.new');
        }
    }
});
Hwv.ExhibitionsNewRoute = Ember.Route.extend({
    controllerName: 'exhibition',
    renderTemplate: function(controller) {
        controller.set("isEditing",true);
        controller.set("isNew",true);
        controller.set("pannelTitle",Hwv.get("newModelTag").fmt(controller.get("modelName")));
        this.render('exhibition', {outlet: 'exhibition',controller: controller});
    },
    beforeModel: function() {
    },
    model:function(){
        return this.controllerFor("exhibitions").createRecord();
    },
    actions:{
        goBack:function(){
            var controller = this.controller;
            controller.get("model").rollback();
            var self = this;
            $(".start-setting-exhibitions-exhibition.navigable-pane").navigablePop({
                targetTo:".start-setting-exhibitions.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('exhibitions');
                }
            });
        }
    }
});
Hwv.ExhibitionRoute = Ember.Route.extend({
    controllerName: 'exhibition',
    beforeModel: function() {
    },
    model:function(params){
        var curId = params.exhibition_id;
        var exhibition = this.store.getById('exhibition', curId);
        if(!exhibition && curId.indexOf("fixture") == 0){
            //如果没有找到记录，并且是fixture开头的新记录则创建一个新记录来匹配
            return this.controllerFor("exhibitions").createRecord();
        }
        else{
            //注意，这里如果没有找到记录，并且不是fixture开头的新记录，将返回null
            return exhibition;
        }
    },
    actions:{
        goBack:function(){
            var model = this.controller.get("model");
            model && model.rollback();
            var self = this;
            $(".start-setting-exhibitions-exhibition.navigable-pane").navigablePop({
                targetTo:".start-setting-exhibitions.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('exhibitions');
                }
            });
        }
    }
});
Hwv.ExhibitionIndexRoute = Ember.Route.extend({
    controllerName: 'exhibition',
    renderTemplate: function(controller) {
        controller.set("isEditing",false);
        controller.set("isNew",false);
        controller.set("pannelTitle",Hwv.get("detailModelTag").fmt(controller.get("modelName")));
        this.render('exhibition',{ outlet: 'exhibition',controller: controller });
    },
    actions:{
        goEdit:function(){
            this.transitionTo('exhibition.edit');
        }
    }
});
Hwv.ExhibitionEditRoute = Ember.Route.extend({
    controllerName: 'exhibition',
    renderTemplate: function(controller) {
        controller.set("isEditing",true);
        controller.set("isNew",false);
        controller.set("pannelTitle",Hwv.get("editModelTag").fmt(controller.get("modelName")));
        this.render('exhibition', {outlet: 'exhibition',controller: controller});
    },
    actions:{
        goIndex:function(){
            this.transitionTo('exhibition.index');
        },
    }
});

Hwv.Exhibition = DS.Model.extend({
    name: DS.attr('string'),
    areas: DS.hasMany('screenarea', {embedded: 'always'}),
    description: DS.attr('string'),
    creater: DS.attr('string'),
    created_date: DS.attr('string'),
    modifier: DS.attr('string'),
    modified_date: DS.attr('string')
});

Hwv.ExhibitionsView = Ember.View.extend({
    didInsertElement:function(buffer){
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "exhibitions.index"){
            $(".start-setting.navigable-pane").navigablePush({
                targetTo:".start-setting-exhibitions.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['start-setting-exhibitions','navigable-pane','collapse']
});
Hwv.ExhibitionView = Ember.View.extend({
    didInsertElement:function(buffer){
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "exhibition.index" || currentRouteName == "exhibition.edit.index" || currentRouteName == "exhibitions.new.index"){
            $(".start-setting-exhibitions.navigable-pane").navigablePush({
                targetTo:".start-setting-exhibitions-exhibition.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['start-setting-exhibitions-exhibition','navigable-pane','collapse']
});

Hwv.ExhibitionsController = Ember.ArrayController.extend({
    needs:["application"],
    createRecord:function(){
        var exhibition = this.store.createRecord('exhibition', {
            name: 'New Group'
        });
        return exhibition;
    },
    actions:{
        newRecord:function(){
            this.send("goNew");
        }
    }
});

Hwv.ExhibitionController = Ember.ObjectController.extend({
    needs:["application"],
    isEditing:false,
    isNew:false,
    modelName:"展示台",
    pannelTitle:"展示台详情",
    helpInfo:"在流程步骤中指定该展示台后将自动关联到该展示台的关联组织，工作单流转到该展示台也将自动发送到工作单到该展示台关联组织的工作台。",
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

Hwv.Exhibition.FIXTURES = [
    {
        id: 1,
        name: '大屏展示台',
        areas: [1,2,3,4,5,6,7,8,9,10,11],
        description: '',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    }
];
