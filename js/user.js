Hwv.UsersRoute = Ember.Route.extend({
    renderTemplate: function() {
        this.render({ outlet: 'users' });
    },
    beforeModel: function() {
        
    },
    model: function () {
        return this.store.all('user');
    },
    afterModel: function(model, transition) {
    },
    actions:{
        goBack:function(){
            
            var self = this;
            $(".start-setting-users.navigable-pane").navigablePop({
                targetTo:".start-setting.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('start.setting');
                }
            });
        },
        goUser:function(user){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('user',user);
        },
        goNew:function(){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('users.new');
        }
    }
});
Hwv.UsersNewRoute = Ember.Route.extend({
    controllerName: 'user',
    renderTemplate: function(controller) {
        controller.set("isEditing",true);
        controller.set("isNew",true);
        controller.set("pannelTitle",Hwv.get("newModelTag").fmt(controller.get("modelName")));
        this.render('user', {outlet: 'user',controller: controller});
    },
    beforeModel: function() {
    },
    model:function(){
        return this.controllerFor("users").createRecord();
    },
    actions:{
        goBack:function(){
            var controller = this.controller;
            controller.get("model").rollback();
            var self = this;
            $(".start-setting-users-user.navigable-pane").navigablePop({
                targetTo:".start-setting-users.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('users');
                }
            });
        }
    }
});
Hwv.UserRoute = Ember.Route.extend({
    controllerName: 'user',
    beforeModel: function() {
    },
    model:function(params){
        var curId = params.user_id;
        var user = this.store.getById('user', curId);
        if(!user && curId.indexOf("fixture") == 0){
            //如果没有找到记录，并且是fixture开头的新记录则创建一个新记录来匹配
            return this.controllerFor("users").createRecord();
        }
        else{
            //注意，这里如果没有找到记录，并且不是fixture开头的新记录，将返回null
            return user;
        }
    },
    actions:{
        goBack:function(){
            var model = this.controller.get("model");
            model && model.rollback();
            var self = this;
            $(".start-setting-users-user.navigable-pane").navigablePop({
                targetTo:".start-setting-users.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('users');
                }
            });
        }
    }
});
Hwv.UserIndexRoute = Ember.Route.extend({
    controllerName: 'user',
    renderTemplate: function(controller) {
        controller.set("isEditing",false);
        controller.set("isNew",false);
        controller.set("pannelTitle",Hwv.get("detailModelTag").fmt(controller.get("modelName")));
        this.render('user',{ outlet: 'user',controller: controller });
    },
    actions:{
        goEdit:function(){
            this.transitionTo('user.edit');
        }
    }
});
Hwv.UserEditRoute = Ember.Route.extend({
    controllerName: 'user',
    renderTemplate: function(controller) {
        controller.set("isEditing",true);
        controller.set("isNew",false);
        controller.set("pannelTitle",Hwv.get("editModelTag").fmt(controller.get("modelName")));
        this.render('user', {outlet: 'user',controller: controller});
    },
    actions:{
        goIndex:function(){
            this.transitionTo('user.index');
        },
    }
});

Hwv.User = DS.Model.extend({
    name: DS.attr('string'),
    phone: DS.attr('string'),
    email: DS.attr('string'),
    password: DS.attr('string'),
    role: DS.belongsTo('role'),
    organization: DS.belongsTo('organization'),
    signature: DS.attr('string'),
    is_developer: DS.attr('boolean', {defaultValue: false}),
    created:DS.attr('string'),
    created_by: DS.attr('string'),
    modified:DS.attr('string'),
    modified_by: DS.attr('string')
});

Hwv.UsersView = Ember.View.extend({
    didInsertElement:function(buffer){
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "users.index"){
            $(".start-setting.navigable-pane").navigablePush({
                targetTo:".start-setting-users.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['start-setting-users','navigable-pane','collapse']
});
Hwv.UserView = Ember.View.extend({
    didInsertElement:function(buffer){
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "user.index" || currentRouteName == "user.edit.index" || currentRouteName == "users.new.index"){
            $(".start-setting-users.navigable-pane").navigablePush({
                targetTo:".start-setting-users-user.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['start-setting-users-user','navigable-pane','collapse']
});

Hwv.UsersController = Ember.ArrayController.extend({
    needs:["application"],
    createRecord:function(){
        var user = this.store.createRecord('user', {
            name: '新用户',
            phone: '18901915679',
            email: '',
            signature: '我是好人'
        });
        return user;
    },
    actions:{
        newRecord:function(){
            this.send("goNew");
        }
    }
});

Hwv.UserController = Ember.ObjectController.extend({
    needs:["application"],
    isEditing:false,
    isNew:false,
    modelName:"用户",
    pannelTitle:"用户详情",
    helpInfo:"手机号或邮箱将作为账户登录的唯一凭证。",
    roles:function(){
        return this.store.all("role");
    }.property(),
    selectedRole:function(k,v){
        var model = this.get('model');
        if (v === undefined) {
            return model.get("role");
        } else {
            model.set('role', v);
            //纠正model的belongsTo关联属性在changedAttributes及rollback上的bug
            this.get("model").fixChangedAttributesBugForKey("role");
            return v;
        }
    }.property("model.role"),
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
        resetPwd:function(){
            
        },
        deleteRecord:function(){
            this.get("model").deleteRecord();
            this.get("model").save();
            this.send("goBack");
        }
    }
});

Hwv.User.FIXTURES = [
    {
        id: 1,
        name: '秦工',
        phone: '18704914345',
        email: 'QinShiliang@csvw.com',
        password:'hhhhhh',
        role:1,
        organization:1,
        signature: 'Take your time...',
        is_developer:true
    },
    {
        id: 2,
        name: '左工',
        phone: '12874837623',
        email: 'ZuoZongqiang@csvw.com',
        password:'hhhhhh',
        role:1,
        organization:1,
        signature: 'Take it easy...',
        is_developer:false
    },
    {
        id: 3,
        name: '殷亮辉',
        phone: '13701914323',
        email: 'lianghui_yin@163.com',
        password:'hhhhhh',
        organization:2,
        role:1,
        signature: 'hurry up',
        is_developer:true
    },
    {
        id: 4,
        name: '石破天',
        phone: '12459845678',
        email: '',
        password:'hhhhhh',
        organization:2,
        role:1,
        signature: 'hurry up',
        is_developer:false
    },
    {
        id: 5,
        name: '石大平',
        phone: '13701914323',
        email: '',
        password:'hhhhhh',
        organization:2,
        role:1,
        signature: 'hurry up',
        is_developer:false
    },
    {
        id: 6,
        name: 'steev_ai',
        phone: '16488834567',
        email: '',
        password:'hhhhhh',
        role:2,
        organization:4,
        signature: 'Take your time',
        is_developer:false
    },
    {
        id: 7,
        name: '石中玉',
        phone: '12983745684',
        email: '',
        password:'hhhhhh',
        role:2,
        organization:4,
        signature: 'Take your time',
        is_developer:false
    },
    {
        id: 8,
        name: '汤工',
        phone: '15678456272',
        email: '',
        password:'hhhhhh',
        role:3,
        organization:9,
        signature: 'put forhead',
        is_developer:true
    },
    {
        id: 9,
        name: '闵先生',
        phone: '14904935927',
        email: '',
        password:'hhhhhh',
        role:3,
        organization:9,
        signature: 'put forhead',
        is_developer:false
    },
    {
        id: 10,
        name: 'jerry',
        phone: '14567389138',
        email: '',
        password:'hhhhhh',
        role:3,
        organization:3,
        signature: 'put forhead',
        is_developer:true
    },
    {
        id: 11,
        name: 'selira',
        phone: '13456895432',
        email: '',
        password:'hhhhhh',
        role:3,
        organization:3,
        signature: 'put forhead',
        is_developer:true
    }
];
