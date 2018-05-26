Hwv.RolesRoute = Ember.Route.extend({
    renderTemplate: function() {
        this.render({ outlet: 'roles' });
    },
    beforeModel: function() {
        
    },
    model: function () {
        return this.store.all('role');
    },
    afterModel: function(model, transition) {
    },
    actions:{
        goBack:function(){
            
            var self = this;
            $(".start-setting-roles.navigable-pane").navigablePop({
                targetTo:".start-setting.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('start.setting');
                }
            });
        },
        goRole:function(role){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('role',role);
        },
        goNew:function(){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('roles.new');
        }
    }
});
Hwv.RolesNewRoute = Ember.Route.extend({
    controllerName: 'role',
    renderTemplate: function(controller) {
        controller.set("isEditing",true);
        controller.set("isNew",true);
        controller.set("pannelTitle",Hwv.get("newModelTag").fmt(controller.get("modelName")));
        this.render('role', {outlet: 'role',controller: controller});
    },
    beforeModel: function() {
    },
    model:function(){
        return this.controllerFor("roles").createRecord();
    },
    actions:{
        goBack:function(){
            var controller = this.controller;
            controller.get("model").rollback();
            var self = this;
            $(".start-setting-roles-role.navigable-pane").navigablePop({
                targetTo:".start-setting-roles.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('roles');
                }
            });
        }
    }
});
Hwv.RoleRoute = Ember.Route.extend({
    controllerName: 'role',
    beforeModel: function() {
    },
    model:function(params){
        var curId = params.role_id;
        var role = this.store.getById('role', curId);
        if(!role && curId.indexOf("fixture") == 0){
            //如果没有找到记录，并且是fixture开头的新记录则创建一个新记录来匹配
            return this.controllerFor("roles").createRecord();
        }
        else{
            //注意，这里如果没有找到记录，并且不是fixture开头的新记录，将返回null
            return role;
        }
    },
    actions:{
        goBack:function(){
            var model = this.controller.get("model");
            model && model.rollback();
            var self = this;
            $(".start-setting-roles-role.navigable-pane").navigablePop({
                targetTo:".start-setting-roles.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('roles');
                }
            });
        }
    }
});
Hwv.RoleIndexRoute = Ember.Route.extend({
    controllerName: 'role',
    renderTemplate: function(controller) {
        controller.set("isEditing",false);
        controller.set("isNew",false);
        controller.set("pannelTitle",Hwv.get("detailModelTag").fmt(controller.get("modelName")));
        this.render('role',{ outlet: 'role',controller: controller });
    },
    actions:{
        goEdit:function(){
            this.transitionTo('role.edit');
        }
    }
});
Hwv.RoleEditRoute = Ember.Route.extend({
    controllerName: 'role',
    renderTemplate: function(controller) {
        controller.set("isEditing",true);
        controller.set("isNew",false);
        controller.set("pannelTitle",Hwv.get("editModelTag").fmt(controller.get("modelName")));
        this.render('role', {outlet: 'role',controller: controller});
    },
    actions:{
        goIndex:function(){
            this.transitionTo('role.index');
        },
    }
});

Hwv.Role = DS.Model.extend({
    name: DS.attr('string'),
    power: DS.attr('string'),
    description: DS.attr('string'),
    creater: DS.attr('string'),
    created_date: DS.attr('string'),
    modifier: DS.attr('string'),
    modified_date: DS.attr('string')
});

Hwv.RolesView = Ember.View.extend({
    didInsertElement:function(buffer){
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "roles.index"){
            $(".start-setting.navigable-pane").navigablePush({
                targetTo:".start-setting-roles.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['start-setting-roles','navigable-pane','collapse']
});
Hwv.RoleView = Ember.View.extend({
    didInsertElement:function(buffer){
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "role.index" || currentRouteName == "role.edit.index" || currentRouteName == "roles.new.index"){
            $(".start-setting-roles.navigable-pane").navigablePush({
                targetTo:".start-setting-roles-role.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['start-setting-roles-role','navigable-pane','collapse']
});

Hwv.RolesController = Ember.ArrayController.extend({
    needs:["application"],
    createRecord:function(){
        var role = this.store.createRecord('role', {
            name: '新角色',
            power: '敬请期待',
        });
        return role;
    },
    actions:{
        newRecord:function(){
            this.send("goNew");
        }
    }
});

Hwv.RoleController = Ember.ObjectController.extend({
    needs:["application"],
    isEditing:false,
    isNew:false,
    modelName:"角色",
    pannelTitle:"角色详情",
    helpInfo:"可以为角色设置不同的权限。",
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

Hwv.Role.FIXTURES = [
    {
        id: 1,
        name: '系统管理员',
        power: '敬请期待',
        description: '',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    },
    {
        id: 2,
        name: '超级用户',
        power: '敬请期待',
        description: '',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    },
    {
        id: 3,
        name: '普通用户',
        power: '敬请期待',
        description: '',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    },
    {
        id: 4,
        name: '大屏展示员',
        power: '敬请期待',
        description: '',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    }
];
