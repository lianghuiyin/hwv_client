Hwv.ConsolesRoute = Ember.Route.extend({
    renderTemplate: function() {
        this.render({ outlet: 'consoles' });
    },
    beforeModel: function() {
        
    },
    model: function () {
        return this.store.all('console');
    },
    afterModel: function(model, transition) {
    },
    actions:{
        goBack:function(){
            
            var self = this;
            $(".start-setting-consoles.navigable-pane").navigablePop({
                targetTo:".start-setting.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('start.setting');
                }
            });
        },
        goConsole:function(console){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('console',console);
        },
        goNew:function(){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('consoles.new');
        }
    }
});
Hwv.ConsolesNewRoute = Ember.Route.extend({
    controllerName: 'console',
    renderTemplate: function(controller) {
        controller.set("isEditing",true);
        controller.set("isNew",true);
        controller.set("pannelTitle",Hwv.get("newModelTag").fmt(controller.get("modelName")));
        this.render('console', {outlet: 'console',controller: controller});
    },
    beforeModel: function() {
    },
    model:function(){
        return this.controllerFor("consoles").createRecord();
    },
    actions:{
        goBack:function(){
            var controller = this.controller;
            controller.get("model").rollback();
            var self = this;
            $(".start-setting-consoles-console.navigable-pane").navigablePop({
                targetTo:".start-setting-consoles.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('consoles');
                }
            });
        }
    }
});
Hwv.ConsoleRoute = Ember.Route.extend({
    controllerName: 'console',
    beforeModel: function() {
    },
    model:function(params){
        var curId = params.console_id;
        var console = this.store.getById('console', curId);
        if(!console && curId.indexOf("fixture") == 0){
            //如果没有找到记录，并且是fixture开头的新记录则创建一个新记录来匹配
            return this.controllerFor("consoles").createRecord();
        }
        else{
            //注意，这里如果没有找到记录，并且不是fixture开头的新记录，将返回null
            return console;
        }
    },
    actions:{
        goBack:function(){
            var model = this.controller.get("model");
            model && model.rollback();
            var self = this;
            $(".start-setting-consoles-console.navigable-pane").navigablePop({
                targetTo:".start-setting-consoles.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('consoles');
                }
            });
        }
    }
});
Hwv.ConsoleIndexRoute = Ember.Route.extend({
    controllerName: 'console',
    renderTemplate: function(controller) {
        controller.set("isEditing",false);
        controller.set("isNew",false);
        controller.set("pannelTitle",Hwv.get("detailModelTag").fmt(controller.get("modelName")));
        this.render('console',{ outlet: 'console',controller: controller });
    },
    actions:{
        goEdit:function(){
            this.transitionTo('console.edit');
        }
    }
});
Hwv.ConsoleEditRoute = Ember.Route.extend({
    controllerName: 'console',
    renderTemplate: function(controller) {
        controller.set("isEditing",true);
        controller.set("isNew",false);
        controller.set("pannelTitle",Hwv.get("editModelTag").fmt(controller.get("modelName")));
        this.render('console', {outlet: 'console',controller: controller});
    },
    actions:{
        goIndex:function(){
            this.transitionTo('console.index');
        },
    }
});

Hwv.Console = DS.Model.extend({
    name: DS.attr('string'),
    organization: DS.belongsTo('organization'),
    description: DS.attr('string'),
    help_text: DS.attr('string'),
    on_yellow_timeout: DS.attr('number', {defaultValue: 0}),
    on_red_timeout: DS.attr('number', {defaultValue: 0}),
    on_color: DS.attr('string', {defaultValue: "green"}),
    off_yellow_timeout: DS.attr('number', {defaultValue: 0}),
    off_red_timeout: DS.attr('number', {defaultValue: 0}),
    off_color: DS.attr('string', {defaultValue: "gray"}),
    creater: DS.attr('string'),
    created_date: DS.attr('string'),
    modifier: DS.attr('string'),
    modified_date: DS.attr('string')
});

Hwv.ConsolesView = Ember.View.extend({
    didInsertElement:function(buffer){
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "consoles.index"){
            $(".start-setting.navigable-pane").navigablePush({
                targetTo:".start-setting-consoles.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['start-setting-consoles','navigable-pane','collapse']
});
Hwv.ConsoleView = Ember.View.extend({
    didInsertElement:function(buffer){
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "console.index" || currentRouteName == "console.edit.index" || currentRouteName == "consoles.new.index"){
            $(".start-setting-consoles.navigable-pane").navigablePush({
                targetTo:".start-setting-consoles-console.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['start-setting-consoles-console','navigable-pane','collapse']
});

Hwv.ConsolesController = Ember.ArrayController.extend({
    needs:["application"],
    actions:{
    }
});

Hwv.ConsoleController = Ember.ObjectController.extend({
    needs:["application"],
    isEditing:false,
    isNew:false,
    modelName:"控制台",
    pannelTitle:"控制台详情",
    helpInfo:"只有该控制台的“关联组织”才能操作该控制台，\
    在控制台中可以在“激活”和“停止”两种状态间切换，\
    可通过设置超时时限来提醒用户车辆处于“激活”或“停止”状态的时间已超时，\
    “帮助信息”中的文字内容将出现在控制台的帮助栏以帮助用户正确的操作该控制台。",
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
    isOnGray:Ember.computed.equal('on_color', 'gray'),
    isOnGreen:Ember.computed.equal('on_color', 'green'),
    isOnYellow:Ember.computed.equal('on_color', 'yellow'),
    isOnRed:Ember.computed.equal('on_color', 'red'),

    isOffGray:Ember.computed.equal('off_color', 'gray'),
    isOffGreen:Ember.computed.equal('off_color', 'green'),
    isOffYellow:Ember.computed.equal('off_color', 'yellow'),
    isOffRed:Ember.computed.equal('off_color', 'red'),
    actions:{
        edit: function () {
            this.send("goEdit");
        },
        setOnColor:function(value){
            this.get('model').set("on_color",value);
        },
        setOffColor:function(value){
            this.get('model').set("off_color",value);
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

Hwv.Console.FIXTURES = [
    {
        id: 1,
        name: '试验控制台',
        organization: 4,
        description: '当工作单流转到“投入试验”步骤时，统计员可通过试验控制台操控所有车辆的试验状态。',
        help_text: '请点击列表中激活或停止按钮来控制车辆的试验状态。',
        on_yellow_timeout: 80,
        on_red_timeout: 120,
        on_color: 'green',
        off_yellow_timeout: 80,
        off_red_timeout: 120,
        off_color: 'gray',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    }
];
