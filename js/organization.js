Hwv.OrganizationsRoute = Ember.Route.extend({
    renderTemplate: function() {
        this.render({ outlet: 'organizations' });
    },
    beforeModel: function() {
        
    },
    model: function () {
        return this.store.all('organization');
    },
    afterModel: function(model, transition) {
    },
    actions:{
        goBack:function(){
            
            var self = this;
            $(".start-setting-organizations.navigable-pane").navigablePop({
                targetTo:".start-setting.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('start.setting');
                }
            });
        },
        goOrganization:function(organization){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('organization',organization);
        },
        goNew:function(){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('organizations.new');
        }
    }
});
Hwv.OrganizationsNewRoute = Ember.Route.extend({
    controllerName: 'organization',
    renderTemplate: function(controller) {
        controller.set("isEditing",true);
        controller.set("isNew",true);
        controller.set("pannelTitle",Hwv.get("newModelTag").fmt(controller.get("modelName")));
        this.render('organization', {outlet: 'organization',controller: controller});
    },
    beforeModel: function() {
    },
    model:function(){
        return this.controllerFor("organizations").createRecord();
    },
    actions:{
        goBack:function(){
            var controller = this.controller;
            controller.get("model").rollback();
            var self = this;
            $(".start-setting-organizations-organization.navigable-pane").navigablePop({
                targetTo:".start-setting-organizations.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('organizations');
                }
            });
        }
    }
});
Hwv.OrganizationRoute = Ember.Route.extend({
    controllerName: 'organization',
    beforeModel: function() {
    },
    model:function(params){
        var curId = params.organization_id;
        var organization = this.store.getById('organization', curId);
        if(!organization && curId.indexOf("fixture") == 0){
            //如果没有找到记录，并且是fixture开头的新记录则创建一个新记录来匹配
            return this.controllerFor("organizations").createRecord();
        }
        else{
            //注意，这里如果没有找到记录，并且不是fixture开头的新记录，将返回null
            return organization;
        }
    },
    actions:{
        goBack:function(){
            var model = this.controller.get("model");
            model && model.rollback();
            var self = this;
            $(".start-setting-organizations-organization.navigable-pane").navigablePop({
                targetTo:".start-setting-organizations.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('organizations');
                }
            });
        }
    }
});
Hwv.OrganizationIndexRoute = Ember.Route.extend({
    controllerName: 'organization',
    renderTemplate: function(controller) {
        controller.set("isEditing",false);
        controller.set("isNew",false);
        controller.set("pannelTitle",Hwv.get("detailModelTag").fmt(controller.get("modelName")));
        this.render('organization',{ outlet: 'organization',controller: controller });
    },
    actions:{
        goEdit:function(){
            this.transitionTo('organization.edit');
        }
    }
});
Hwv.OrganizationEditRoute = Ember.Route.extend({
    controllerName: 'organization',
    renderTemplate: function(controller) {
        controller.set("isEditing",true);
        controller.set("isNew",false);
        controller.set("pannelTitle",Hwv.get("editModelTag").fmt(controller.get("modelName")));
        this.render('organization', {outlet: 'organization',controller: controller});
    },
    actions:{
        goIndex:function(){
            this.transitionTo('organization.index');
        },
    }
});


Hwv.Organization = DS.Model.extend({
    name: DS.attr('string'),
    is_car_owners: DS.attr('boolean', {defaultValue: false}),
    description: DS.attr('string'),
    creater: DS.attr('string'),
    created_date: DS.attr('string'),
    modifier: DS.attr('string'),
    modified_date: DS.attr('string')
});

Hwv.OrganizationsView = Ember.View.extend({
    didInsertElement:function(buffer){
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "organizations.index"){
            $(".start-setting.navigable-pane").navigablePush({
                targetTo:".start-setting-organizations.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['start-setting-organizations','navigable-pane','collapse']
});
Hwv.OrganizationView = Ember.View.extend({
    didInsertElement:function(buffer){
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "organization.index" || currentRouteName == "organization.edit.index" || currentRouteName == "organizations.new.index"){
            $(".start-setting-organizations.navigable-pane").navigablePush({
                targetTo:".start-setting-organizations-organization.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['start-setting-organizations-organization','navigable-pane','collapse']
});

Hwv.OrganizationsController = Ember.ArrayController.extend({
    needs:["application"],
    createRecord:function(){
        var organization = this.store.createRecord('organization', {
            name: '新组织',
            organization: 'organization1111',
        });
        return organization;
    },
    actions:{
        newRecord:function(){
            this.send("goNew");
        }
    }
});

Hwv.OrganizationController = Ember.ObjectController.extend({
    needs:["application"],
    isEditing:false,
    isNew:false,
    modelName:"组织",
    pannelTitle:"组织详情",
    helpInfo:"只有车辆负责组的组织内用户才能创建和报废车辆。",
    actions:{
        edit: function () {
            this.send("goEdit");
        },
        setIsCarOwners:function(value){
            this.get('model').set("is_car_owners",value);
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

Hwv.Organization.FIXTURES = [
    {
        id: 1,
        name: '支持组',
        is_car_owners: true,
        description: 'sddddf',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    },
    {
        id: 2,
        name: '检查组',
        is_car_owners: false,
        description: 'sddddf',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    },
    {
        id: 3,
        name: '工程组',
        is_car_owners: false,
        description: 'sddddf',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    },
    {
        id: 4,
        name: '统计组',
        is_car_owners: false,
        description: 'sddddf',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    },
    {
        id: 5,
        name: '保养组',
        is_car_owners: false,
        description: 'sddddf',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    },
    {
        id: 6,
        name: '轮胎更换组',
        is_car_owners: false,
        description: 'sddddf',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    },
    {
        id: 8,
        name: '车间组A',
        is_car_owners: false,
        description: 'sddddf',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    },
    {
        id: 9,
        name: '车间组B',
        is_car_owners: false,
        description: 'sddddf',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    },
    {
        id: 10,
        name: '车间组C',
        is_car_owners: false,
        description: 'sddddf',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    },
    {
        id: 11,
        name: '车间组E',
        is_car_owners: false,
        description: 'sddddf',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    },
    {
        id: 12,
        name: '车间组K',
        is_car_owners: false,
        description: 'sddddf',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    },
    {
        id: 13,
        name: '领导',
        is_car_owners: false,
        description: 'sddddf',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    },
    {
        id: 14,
        name: '访客',
        is_car_owners: false,
        description: 'sddddf',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    }
];
