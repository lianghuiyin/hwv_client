Hwv.CarsRoute = Ember.Route.extend({
    renderTemplate: function() {
        this.render({ outlet: 'cars' });
    },
    beforeModel: function() {
        
    },
    model: function () {
        return this.store.all('car');
    },
    afterModel: function(model, transition) {
    },
    actions:{
        goBack:function(){
            
            var self = this;
            $(".start-setting-cars.navigable-pane").navigablePop({
                targetTo:".start-setting.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('start.setting');
                }
            });
        },
        goCar:function(car){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('car',car);
        },
        goNew:function(){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('cars.new');
        }
    }
});
Hwv.CarsNewRoute = Ember.Route.extend({
    controllerName: 'car',
    renderTemplate: function(controller) {
        controller.set("isEditing",true);
        controller.set("isNew",true);
        controller.set("pannelTitle",Hwv.get("newModelTag").fmt(controller.get("modelName")));
        this.render('car', {outlet: 'car',controller: controller});
    },
    beforeModel: function() {
    },
    model:function(){
        return this.controllerFor("cars").createRecord();
    },
    actions:{
        goBack:function(){
            var controller = this.controller;
            controller.get("model").rollback();
            var self = this;
            $(".start-setting-cars-car.navigable-pane").navigablePop({
                targetTo:".start-setting-cars.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('cars');
                }
            });
        }
    }
});
Hwv.CarRoute = Ember.Route.extend({
    controllerName: 'car',
    beforeModel: function() {
    },
    model:function(params){
        var curId = params.car_id;
        var car = this.store.getById('car', curId);
        if(!car && curId.indexOf("fixture") == 0){
            //如果没有找到记录，并且是fixture开头的新记录则创建一个新记录来匹配
            return this.controllerFor("cars").createRecord();
        }
        else{
            //注意，这里如果没有找到记录，并且不是fixture开头的新记录，将返回null
            return car;
        }
    },
    afterModel:function(model,transition){
        if(!model){
            //如果没有找到记录，则返回到上一层
            this.transitionTo("cars");
            this.send("goBack");
        }
    },
    actions:{
        goBack:function(){
            var model = this.controller.get("model");
            model && model.rollback();
            var self = this;
            $(".start-setting-cars-car.navigable-pane").navigablePop({
                targetTo:".start-setting-cars.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('cars');
                }
            });
        }
    }
});
Hwv.CarIndexRoute = Ember.Route.extend({
    controllerName: 'car',
    renderTemplate: function(controller) {
        controller.set("isEditing",false);
        controller.set("isNew",false);
        controller.set("pannelTitle",Hwv.get("detailModelTag").fmt(controller.get("modelName")));
        this.render('car',{ outlet: 'car',controller: controller });
    },
    actions:{
        goEdit:function(){
            this.transitionTo('car.edit');
        }
    }
});
Hwv.CarEditRoute = Ember.Route.extend({
    controllerName: 'car',
    renderTemplate: function(controller) {
        controller.set("isEditing",true);
        controller.set("isNew",false);
        controller.set("pannelTitle",Hwv.get("editModelTag").fmt(controller.get("modelName")));
        this.render('car', {outlet: 'car',controller: controller});
    },
    actions:{
        goIndex:function(){
            this.transitionTo('car.index');
        },
    }
});

Hwv.Car = DS.Model.extend({
    number: DS.attr('string'),
    owner: DS.belongsTo('user'),
    testtype: DS.belongsTo('testtype'),
    // status: DS.attr('string', {defaultValue: "unused"}),//闲置（unused）、流转中（turning）、退役（retired即报废）
    description: DS.attr('string'),
    creater: DS.attr('string'),
    created_date: DS.attr('string'),
    modifier: DS.attr('string'),
    modified_date: DS.attr('string')
});

Hwv.CarsView = Ember.View.extend({
    didInsertElement:function(buffer){
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "cars.index"){
            $(".start-setting.navigable-pane").navigablePush({
                targetTo:".start-setting-cars.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['start-setting-cars','navigable-pane','collapse']
});
Hwv.CarView = Ember.View.extend({
    didInsertElement:function(buffer){
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "car.index" || currentRouteName == "car.edit.index" || currentRouteName == "cars.new.index"){
            $(".start-setting-cars.navigable-pane").navigablePush({
                targetTo:".start-setting-cars-car.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['start-setting-cars-car','navigable-pane','collapse']
});

Hwv.CarsController = Ember.ArrayController.extend({
    needs:["application","session"],
    pannelTitle:"车辆管理",
    helpInfo:"请选择一个车辆，只有车辆负责组的组织内用户才能创建车辆。",
    createRecord:function(){
        var currentUser = this.get("controllers.session.user");
        var car = this.store.createRecord('car', {
            number: 'NewCar' + new Date().format("ddhhmmss"),
            owner: currentUser,
            testtype: null,
            // status: "unused",
            description: ''
        });
        return car;
    },
    actions:{
        newRecord:function(){
            var currentUser = this.get("controllers.session.user");
            if(currentUser.get("organization.is_car_owners")){
                this.send("goNew");
            }
            else{
                Ember.warn("current user 's organization is not a car owners");
            }
        }
    }
});

Hwv.CarController = Ember.ObjectController.extend({
    needs:["application","session"],
    isEditing:false,
    isNew:false,
    modelName:"车辆",
    pannelTitle:"车辆详情",
    helpInfo:"只有车辆负责人才能报废车辆。",
    testtypes:function(){
        return this.store.filter('testtype', function (testtype) {
            return true;
        });
    }.property(),
    selectedTesttype:function(k,v){
        var model = this.get('model');
        if (v === undefined) {
            return model.get("testtype");
        } else {
            model.set('testtype', v);
            //纠正model的belongsTo关联属性在changedAttributes及rollback上的bug
            this.get("model").fixChangedAttributesBugForKey("testtype");
            return v;
        }
    }.property("model.testtype"),
    owners:function(){
        var model = this.get('model'),
            store = this.store;
        return store.filter('user', function (user) {
            var orgsWithOwners = store.all("organization").filterBy("is_car_owners",true);
            return orgsWithOwners.isAny("id",user.get('organization.id'));
        });
    }.property(),
    selectedOwner:function(k,v){
        var model = this.get('model');
        if(!model){
            return;
        }
        if (v === undefined) {
            return model.get("owner");
        } else {
            model.set('owner', v);
            //纠正model的belongsTo关联属性在changedAttributes及rollback上的bug
            this.get("model").fixChangedAttributesBugForKey("owner");
            return v;
        }
    }.property("model.owner"),
    createInstance:function(){
        
        this.store.beginPropertyChanges();
        var now = new Date(),
            nowStr = now.format("yyyy-MM-dd hh:mm:ss"),
            currentUser = this.get("controllers.session.user");
        var flow = this.store.all("flow").get("firstObject");
        var flowversion = this.store.all("flowversion").findBy("is_current",true);
        var startStep = this.store.all("step").findBy("type","start");
        var car = this.get("model");
        var next_step = startStep,
            next_organization = next_step.get("organization"),
            next_console = next_step.get("console"),
            next_yellow_timeout = next_step.get("yellow_timeout"),
            next_red_timeout = next_step.get("red_timeout"),
            next_color = next_step.get("color"),
            next_off_yellow_timeout = next_console ? next_console.get("off_yellow_timeout") : 0,
            next_off_red_timeout = next_console ? next_console.get("off_red_timeout") : 0,
            next_off_color = next_console ? next_console.get("off_color") : 0;
        //模拟服务器端新建instance
        var nextInstance = this.store.createRecord("instance",{
            name: car.get("number") + nowStr.replace("-","").replace(":","").replace(" ",""),
            car: car,
            testtype: car.get("testtype"),
            is_started: false,
            is_finished: false,
            is_abort: false,
            flow: flow,
            flowversion: flowversion,
            inbox_organization: next_organization,
            inbox_console: next_console,
            // outbox_users: DS.attr('string'),
            creater: currentUser,
            created_date: nowStr,
            modifier: currentUser,
            modified_date: nowStr
        });
        //模拟服务器端新建步骤的trace信息
        var nextTrace = this.store.createRecord("trace",{
            instance: nextInstance,
            previous_trace:null,
            car: car,
            step: next_step,
            organization: next_organization,
            workshop: null,
            console: next_console,
            // next_step: null,
            // next_organization: null,
            // next_workshop: null,
            // next_console: null,
            start_date: nowStr,
            end_date: null,
            is_finished: false,
            yellow_due: next_yellow_timeout ? now.addMinutes(next_yellow_timeout).format("yyyy-MM-dd hh:mm:ss") : null,
            red_due: next_red_timeout ? now.addMinutes(next_red_timeout).format("yyyy-MM-dd hh:mm:ss") : null,
            color: next_color,
            info: '',
            handler: null,
            creater: currentUser,
            created_date: nowStr,
            modifier: currentUser,
            modified_date: nowStr
        });
        //模拟服务器端新建approve信息
        if(next_console){
            var nextApprove = this.store.createRecord("approve",{
                instance: nextInstance,
                trace: nextTrace,
                console: next_console,
                previous_approve:null,
                start_date: nowStr,
                end_date: null,
                is_finished: false,
                yellow_due: next_off_yellow_timeout ? now.addMinutes(next_off_yellow_timeout).format("yyyy-MM-dd hh:mm:ss") : null,
                red_due: next_off_red_timeout ? now.addMinutes(next_off_red_timeout).format("yyyy-MM-dd hh:mm:ss") : null,
                color: next_off_color,
                state: "off",
                creater: currentUser,
                created_date: nowStr,
                modifier: currentUser,
                modified_date: nowStr
            });
        }
        //模拟服务器端新建car信息
        // car.set("status","turning");


        //保存到服务器
        // nextInstance.save();
        nextInstance.save().then(function(model){
            
            //因为instance的modified_date属性变更会造成其lastTrace等计算属性立刻执行，
            //所以需要通过beginPropertyChanges、endPropertyChanges来缓存属性变更
            model.store.endPropertyChanges();
        },function(){

        });
        nextTrace.save();
        nextApprove && nextApprove.save();
        // car.save();//这里如果执行save会有问题
        
        // car.save().then(function(model){
        //     
        //     //因为instance的modified_date属性变更会造成其lastTrace等计算属性立刻执行，
        //     //所以需要通过beginPropertyChanges、endPropertyChanges来缓存属性变更
        //     model.store.endPropertyChanges();
        // },function(){

        // });
    },
    // selectedTesttypeBinding:"testtype",
    actions:{
        edit: function () {
            this.send("goEdit");
        },
        save:function(){
            debugger;
            this.get('model').save().then(function(model){
            }, function(){
            });
            if(this.get("isNew")){
                
                this.createInstance();
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

Hwv.Car.FIXTURES = [
    {
        id: 1,
        number: 'Car1',
        owner: 1,
        testtype: 1,
        description: 'sddddf',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    },
    {
        id: 2,
        number: 'Car2',
        owner: 1,
        testtype: 2,
        description: 'sddddf',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    },
    {
        id: 3,
        number: 'Car3',
        owner: 1,
        testtype: 2,
        description: 'sddddf',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    },
    {
        id: 4,
        number: 'Car4',
        owner: 1,
        testtype: 3,
        description: 'sddddf',
        creater: 'sdfsdfdsfsdf',
        created_date: 'sdfsdfdsfsdf',
        modifier: 'sdfsdfdsfsdf',
        modified_date: 'sdfsdfdsfsdf'
    }
];
