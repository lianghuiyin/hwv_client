Hwv.StartInstancesRoute = Ember.Route.extend({
    renderTemplate: function() {
        this.render({ outlet: 'instances' });
    },
    beforeModel: function() {
        
    },
    model: function () {
    },
    afterModel: function(model, transition) {
    },
    actions:{
        goBack:function(){
            var self = this;
            $(".start-instances.navigable-pane").navigablePop({
                targetTo:".start-index.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('start');
                }
            });
        },
        goInbox:function(){
            this.transitionTo('start.instances.inbox');
        },
        goOutbox:function(){
            this.transitionTo('start.instances.outbox');
        }
    }
});
Hwv.StartInstancesInboxRoute = Ember.Route.extend({
    controllerName: 'start_instances',
    model: function () {
        //这里不可以用store.all().filterBy函数，因为那个函数不会自动更新
        return this.store.filter('instance', function (instance) {
            return instance.get("isInbox");
        });
    },
    setupController: function (controller, model) {
        this._super(controller, model);
        controller.set("isInboxSelected",true);
        controller.set("isOutboxSelected",false);
    },
    actions:{
        goInstance:function(instance){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('inbox.instance',instance);
        }
    }
});
Hwv.StartInstancesOutboxRoute = Ember.Route.extend({
    controllerName: 'start_instances',
    model: function () {
        //这里不可以用store.all().filterBy函数，因为那个函数不会自动更新
        return this.store.filter('instance', function (instance) {
            return instance.get("isOutbox");
        });
    },
    setupController: function (controller, model) {
        this._super(controller, model);
        controller.set("isInboxSelected",false);
        controller.set("isOutboxSelected",true);
    },
    actions:{
        goInstance:function(instance){
            Hwv.transitionAnimation = "slideHorizontal";
            this.transitionTo('outbox.instance',instance);
        }
    }
});
Hwv.InboxInstanceRoute = Ember.Route.extend({
    controllerName: 'inbox-instance',
    renderTemplate: function(controller) {
        this.render('inbox/instance',{ 
            outlet: 'instance',
            controller: controller 
        });
    },
    beforeModel: function() {
        
    },
    model:function(params){
        var curId = params.instance_id;
        var instance = this.store.getById('instance', curId),
            traces = this.store.all("trace").filterBy("instance.id",instance.get("id")),
            lastTrace = traces.findBy("is_finished",false);
        return this.store.createRecord("trace_instance",{
            instance: lastTrace.get("instance"),
            next_step: null,
            next_handler_org_type: null,
            next_handler_type: null,
            next_organization: null,
            next_workshop: null,
            next_console: null,
            current_is_handler_locked: lastTrace.get("step.is_handler_locked"),
            current_is_controllable: lastTrace.get("step.is_controllable"),
            current_info: lastTrace.get("step.default_info"),
            current_user: lastTrace.get("user"),//预定用户（即上一步骤选择的预定用户）或当前步骤的指定用户
            current_handler: this.controllerFor("session").get("user"),
            next_yellow_timeout: 0,
            next_red_timeout: 0,
            next_color: "",
            next_off_yellow_timeout: 0,
            next_off_red_timeout: 0,
            next_off_color: ""
        });
    },
    actions:{
        goBack:function(){
            var model = this.controller.get("model");
            model && model.rollback();
            var self = this;
            $(".start-instances-inbox-instance.navigable-pane").navigablePop({
                targetTo:".start-instances.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('start.instances.inbox');
                }
            });
        }
    }
});
Hwv.OutboxInstanceRoute = Ember.Route.extend({
    controllerName: 'outbox-instance',
    renderTemplate: function(controller) {
        
        // controller.set("pannelTitle",Hwv.get("detailModelTag").fmt(controller.get("modelName")));
        this.render('outbox/instance',{ 
            outlet: 'instance',
            controller: controller
        });
    },
    beforeModel: function() {
        
    },
    model:function(params){
        var curId = params.instance_id;
        return this.store.getById('instance', curId);
    },
    actions:{
        goBack:function(){
            var model = this.controller.get("model");
            model && model.rollback();
            var self = this;
            $(".start-instances-outbox-instance.navigable-pane").navigablePop({
                targetTo:".start-instances.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('start.instances.outbox');
                }
            });
        }
    }
});


Hwv.Instance = DS.Model.extend({
    name: DS.attr('string'),
    car: DS.belongsTo('car'),
    testtype: DS.belongsTo('testtype'),
    is_started: DS.attr('boolean', {defaultValue: false}),
    is_finished: DS.attr('boolean', {defaultValue: false}),
    is_abort: DS.attr('boolean', {defaultValue: false}),
    flow: DS.belongsTo('flow'),
    flowversion: DS.belongsTo('flowversion'),
    inbox_organization: DS.belongsTo('organization'),
    inbox_user: DS.belongsTo('user'),
    inbox_console: DS.belongsTo('console'),
    // outbox_users: DS.attr('string'),
    creater: DS.belongsTo('user'),
    created_date: DS.attr('string'),
    modifier: DS.belongsTo('user'),
    modified_date: DS.attr('string'),
    traces:function(){
        
        return this.store.all("trace").filterBy("instance.id",this.get("id"));
    }.property("modified_date"),
    lastTrace:function(){
        
        return this.get("traces").findBy("is_finished",false);
    }.property("traces"),
    lastApproves:function(){
        
        return this.get("lastTrace.approves");
        // return this.store.all("approve").filterBy("trace.id",this.get("lastTrace.id"));
    }.property("lastTrace"),
    lastApprove:function(){
        var lastApproves = this.get("lastApproves");
        return lastApproves && lastApproves.findBy("is_finished",false);
    }.property("lastApproves"),
    isInbox:function(){
        var currentUser = Hwv.get("currentUser");
        var inboxUserId = this.get('inbox_user.id');
        //如果工作单是发给用户的，则判断是否发组当前用户，反之就一定是发组组织的，则判断是否发组当前用户所在组织
        if(inboxUserId){
            return inboxUserId == currentUser.get("id");
        }
        else{
            return this.get('inbox_organization.id') == currentUser.get("organization.id");
        }
    }.property("modified_date"),
    isOutbox:function(){
        var currentUser = Hwv.get("currentUser");
        var isInbox = this.get('isInbox');
        return !isInbox && !!this.get("traces").findBy("handler.id",currentUser.get("id"));
    }.property("modified_date"),
    /**
     * [realTimeoutColorForTrace 全局定时器定时更新该属性值]
     * @return {[sttring]} [颜色gray/green/yellow/red]
     */
    realTimeoutColorForTrace:function(){
        return "yellow";
    }.property(),
    /**
     * [realTimeoutColorForApprove 全局定时器定时更新该属性值]
     * @return {[sttring]} [颜色gray/green/yellow/red]
     */
    realTimeoutColorForApprove:function(){
        return "green";
    }.property()
});

Hwv.StartInstancesView = Ember.View.extend({
    didInsertElement:function(buffer){
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "start.instances.index" 
            || currentRouteName ==  "start.instances.inbox.index" 
            || currentRouteName ==  "start.instances.outbox.index"){
            $(".start-index.navigable-pane").navigablePush({
                targetTo:".start-instances.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['start-instances','navigable-pane','collapse']
});
Hwv.InboxInstanceView = Ember.View.extend({
    didInsertElement:function(buffer){
        
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "inbox.instance.index"){
            $(".start-instances.navigable-pane").navigablePush({
                targetTo:".start-instances-inbox-instance.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['start-instances-inbox-instance','navigable-pane','collapse']
});
Hwv.OutboxInstanceView = Ember.View.extend({
    didInsertElement:function(buffer){
        
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "outbox.instance.index"){
            $(".start-instances.navigable-pane").navigablePush({
                targetTo:".start-instances-outbox-instance.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['start-instances-outbox-instance','navigable-pane','collapse']
});

Hwv.StartInstancesController = Ember.ArrayController.extend({
    needs:["application"],
    isInboxSelected:true,
    isOutboxSelected:false,
    createRecord:function(){
        var instance = this.store.createRecord('instance', {
            name: '新工作单',
            car: 'car3',
        });
        return instance;
    },
    actions:{
    }
});

Hwv.InstanceController = Ember.ObjectController.extend({
});

Hwv.InboxInstanceController = Ember.ObjectController.extend({
    needs:["application","session"],
    modelName:"工作单",
    pannelTitle:"待处理工作单详情",
    helpInfo:function(){
        var stepHelpText = this.get("lastTrace.step.help_text");
        if(stepHelpText){
            return stepHelpText;
        }
        else{
            return "请输入处理信息并选择下一步骤后点击发送来提交工作单到下一步骤。";
        }
    }.property("lastTrace"),
    selectedStep:null,
    selectedWorkshop:null,
    selectedHandler:null,
    isFixOrganization:Ember.computed.equal('instance.lastTrace.step.handler_org_type', 'fix_organization'),
    isReserveWorkshop:Ember.computed.equal('instance.lastTrace.step.handler_org_type', 'reserve_workshop'),
    isNextFixOrganization:Ember.computed.equal('next_handler_org_type', 'fix_organization'),
    isNextReserveWorkshop:Ember.computed.equal('next_handler_org_type', 'reserve_workshop'),

    isFixUser:Ember.computed.equal('instance.lastTrace.step.handler_type', 'fix_user'),
    isReserveUser:Ember.computed.equal('instance.lastTrace.step.handler_type', 'reserve_user'),
    isEmptyUser:Ember.computed.equal('instance.lastTrace.step.handler_type', 'empty'),
    isNextFixUser:Ember.computed.equal('next_handler_type', 'fix_user'),
    isNextReserveUser:Ember.computed.equal('next_handler_type', 'reserve_user'),
    isNextEmptyUser:Ember.computed.equal('next_handler_type', 'empty'),
    isNextUsersEmpty:Ember.computed.equal('nextUsers.length', 0),
    isNeedNextUserSelection:function(){
        //是否需要显示下一步骤处理人选择框
        //注意虽然isNextFixUser为true时只有一个用户，但还是需要显示出来
        //并且一定要显示在选择框中
        return this.get("isNextFixUser") || this.get("isNextReserveUser");
    }.property("isNextFixUser","isNextReserveUser"),
    /**
     * [isConsoleUser 检测当前登录用户是否属于关联控制台的关联组织]
     * @return {Boolean} [是否为关联控制台的关联组织用户]
     */
    isConsoleUser:function(){
        return this.get("instance.lastTrace.console.organization") == this.get("controllers.session.user.organization");
    }.property("lastTrace"),
    nextSteps:function(){
        var allStep = this.get("instance.flowversion.steps"),
            nextStepType = this.get("instance.lastTrace.step.next_step_type");
        var self = this;
        if(nextStepType == "all_step"){
            var isCarOwner = self.get("instance.lastTrace.car.owner.id") == this.get("controllers.session.user.id");
            return this.get("instance.flowversion.steps").filter(function(item){
                //去掉当前步骤，如果不是当前车辆的负责人，则要同时去掉结束步骤
                return item.get("id") != self.get("instance.lastTrace.step.id") && (isCarOwner || item.get("type") != "end");
            });
        }
        else if(nextStepType == "last_step"){
            var prevTrace = this.get("instance.lastTrace.previous_trace");
            if(prevTrace){
                var prevStep = prevTrace.get("step");
                //自动选中上一步骤
                this.get("model").set("next_step",prevStep);
                return [prevStep];
            }
            else{
                return [null];
            }
        }
        
    }.property("instance"),
    selectedNextStep:function(k,v){
        var model = this.get("model");
        //这里一定要用!==，不可以用!=，因为null==undefined为true，但null===undefined为false，不等于号同理
        if(v !== undefined){
            model.set("next_step",v);
            return v;
        }
        else{
            return model.get("next_step");
        }
    }.property("model.next_step"),
    nextStepDidChange:function(){
        var model = this.get("model"),
            nextStep = model.get("next_step"),
            nextConsole = nextStep?nextStep.get("console"):null;
        model.beginPropertyChanges();
        model.set("next_handler_org_type",nextStep?nextStep.get("handler_org_type"):null);
        model.set("next_handler_type",nextStep?nextStep.get("handler_type"):null);
        model.set("next_organization",nextStep?nextStep.get("organization"):null);
        model.set("next_user",nextStep?nextStep.get("user"):null);
        model.set("next_console",nextConsole);
        model.set("next_yellow_timeout",nextStep?nextStep.get("yellow_timeout"):null);
        model.set("next_red_timeout",nextStep?nextStep.get("red_timeout"):null);
        model.set("next_color",nextStep?nextStep.get("color"):null);
        model.set("next_off_yellow_timeout",nextConsole?nextConsole.get("off_yellow_timeout"):null);
        model.set("next_off_red_timeout",nextConsole?nextConsole.get("off_red_timeout"):null);
        model.set("next_off_color",nextConsole?nextConsole.get("off_color"):null);
        model.endPropertyChanges();
    }.observes("model.next_step"),
    nextWorkshops:function(){
        return this.store.filter('workshop', function (workshop) {
            return true;
        });
    }.property("instance"),
    selectedNextWorkshop:function(k,v){
        var model = this.get("model");
        //这里一定要用!==，不可以用!=，因为null==undefined为true，但null===undefined为false，不等于号同理
        if(v !== undefined){
            model.set("next_workshop",v);
            return v;
        }
        else{
            return model.get("next_workshop");
        }
    }.property("model.next_workshop"),
    nextWorkshopDidChange:function(){
        var model = this.get("model"),
            next_workshop = model.get("next_workshop");
        model.set("next_organization",next_workshop?next_workshop.get("organization"):null);
    }.observes("model.next_workshop"),
    nextUsers:function(){
        var model = this.get("model"),
            next_step = model.get("next_step"),
            next_organization = model.get("next_organization"),
            next_handler_type = model.get("next_handler_type");
        if(next_handler_type == "reserve_user"){
            if(next_organization){
                return this.store.filter('user', function (user) {
                    return user.get('organization.id') == next_organization.get("id");
                });
            }
            else{
                return [];
            }
        }
        else if(next_handler_type == "fix_user"){
            return [next_step.get("user")];
        }
        else{
            //next_handler_type="empty"
            return [];
        }
    }.property("model.next_organization","model.next_handler_type"),
    selectedNextUser:function(k,v){
        var model = this.get("model");
        //这里一定要用!==，不可以用!=，因为null==undefined为true，但null===undefined为false，不等于号同理
        if(v !== undefined){
            model.set("next_user",v);
            return v;
        }
        else{
            return model.get("next_user");
        }
    }.property("model.next_user"),
    handlers:function(){
        var current_user = this.get("model.current_user");
        if(current_user){
            //如果current_user存在即lastTrace.user存在，亦即lastTrace.step.handler_type不为empty（为fix_user或reserve_user）
            return [current_user];
        }
        else{
            if(this.get("model.current_is_handler_locked")){
                return [this.get("controllers.session.user")];
            }
            else{
                // return this.store.all("user").filterBy("organization",this.get("instance.lastTrace.organization"));
                //这里不可以用store.all().filterBy函数，因为那个函数不会自动更新
                var lastTraceOrgId = this.get("instance.lastTrace.organization.id");
                return this.store.filter('user', function (user) {
                    return user.get('organization.id') == lastTraceOrgId;
                });
            }
        }
    }.property("instance"),
    selectedHandler:function(k,v){
        var model = this.get("model");
        //这里一定要用!==，不可以用!=，因为null==undefined为true，但null===undefined为false，不等于号同理
        if(v !== undefined){
            model.set("current_handler",v);
            return v;
        }
        else{
            return model.get("current_handler");
        }
    }.property("model.current_handler"),
    actions:{
        send:function(){
            
            this.store.beginPropertyChanges();
            var lastTrace = this.get("instance.lastTrace"),
                now = new Date(),
                nowStr = now.format("yyyy-MM-dd hh:mm:ss"),
                currentUser = this.get("controllers.session.user"),
                instance = this.get("model.instance"),
                current_is_handler_locked = this.get("model.current_is_handler_locked"),
                current_info = this.get("model.current_info"),
                current_user = this.get("model.current_user"),
                current_handler = this.get("model.current_handler"),
                current_is_controllable = this.get("model.current_is_controllable"),
                next_step = this.get("model.next_step"),
                next_handler_org_type = this.get("model.next_handler_org_type"),
                next_handler_type = this.get("model.next_handler_type"),
                next_organization = this.get("model.next_organization"),
                next_user = this.get("model.next_user"),
                next_workshop = this.get("model.next_workshop"),
                next_console = this.get("model.next_console"),
                next_yellow_timeout = this.get("model.next_yellow_timeout"),
                next_red_timeout = this.get("model.next_red_timeout"),
                next_color = this.get("model.next_color"),
                next_off_yellow_timeout = this.get("model.next_off_yellow_timeout"),
                next_off_red_timeout = this.get("model.next_off_red_timeout"),
                next_off_color = this.get("model.next_off_color");
            //模拟服务器端更新当前trace信息
            lastTrace.set("end_date",nowStr);
            lastTrace.set("is_finished",true);
            if(now > lastTrace.get("red_due")){
                lastTrace.set("color","red");
            }
            else if(now > lastTrace.get("yellow_due")){
                lastTrace.set("color","yellow");
            }
            lastTrace.set("info",current_info);
            lastTrace.set("handler",current_handler);
            lastTrace.set("modifier",currentUser);
            lastTrace.set("modified_date",now);
            //模拟服务器端更新当前approve信息
            if(current_is_controllable){
                //这里不判断也不更新lastApprove的state，即允许步骤直接从on状态的approve中流转到下一个步骤
                //因为不能保证lastApprove的id是否在服务器端一定与客户端同步，所以只能通过在服务器端查询得到lastApprove
                var lastApprove = instance.get("lastApprove"),
                    approveYellowDue = lastApprove.get("yellow_due"),
                    approveRedDue = lastApprove.get("red_due");
                lastApprove.set("end_date",nowStr);
                lastApprove.set("is_finished",true);
                if(now > approveRedDue){
                    lastApprove.set("color","red");
                }
                else if(now > approveYellowDue){
                    lastApprove.set("color","yellow");
                }
            }
            //模拟服务器端新建下一步骤的trace信息
            var nextTrace = this.store.createRecord("trace",{
                instance: lastTrace.get("instance"),
                previous_trace:lastTrace,
                car: lastTrace.get("car"),
                step: next_step,
                organization: next_organization,
                user: next_user,
                workshop: next_workshop,
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
            //模拟服务器端新建下一个approve信息
            if(next_console){
                var nextApprove = this.store.createRecord("approve",{
                    instance: lastTrace.get("instance"),
                    trace: nextTrace,
                    console: next_console,
                    previous_approve:instance.lastApprove,
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
            //模拟服务器端更新关联instance的modified_date
            // beginPropertyChanges
            instance.set("is_started",true);
            if(next_step.get("type") == "end"){
                instance.set("inbox_organization",null);
                instance.set("inbox_user",null);
                instance.get("car").set("status","retired");
                instance.set("finished",true);
            }
            else{
                instance.set("inbox_organization",next_organization);
                instance.set("inbox_user",next_user);
                instance.set("inbox_console",next_console);
            }
            instance.set("modifier",currentUser);
            instance.set("modified_date",nowStr);


            //保存到服务器
            lastTrace.save();
            nextTrace.save();
            lastApprove && lastApprove.save();
            nextApprove && nextApprove.save();
            instance.save().then(function(model){
                
                //因为instance的modified_date属性变更会造成其lastTrace等计算属性立刻执行，
                //所以需要通过beginPropertyChanges、endPropertyChanges来缓存属性变更
                model.store.endPropertyChanges();
            },function(){

            });
            instance.get("car").save();
            this.send("goBack");
            

            // this.get('model').save().then(function(model){
            // }, function(){
            // });
            // this.get('model').destroyRecord();
            // this.send("goBack");
        }
    }
});

Hwv.OutboxInstanceController = Ember.ObjectController.extend({
    needs:["application","session"],
    modelName:"工作单",
    pannelTitle:"已处理工作单详情",
    helpInfo:"您曾经处理过该工作单。",
    actions:{
    }
});

Hwv.TracesController = Ember.ArrayController.extend({
    tracesSortingDesc: ['start_date:desc'],
    allSortedTracesDesc: Ember.computed.sort('content', 'tracesSortingDesc'),
    topSortedTracesDesc: function(){
        //默认显示前三个历程
        var allSortedTracesDesc = this.get("allSortedTracesDesc");
        return allSortedTracesDesc.filter(function(item, index, self){
            return index < 3;
        });
    }.property("allSortedTracesDesc"),
    isAllTracesLoaded:function(){
        return this.get("topSortedTracesDesc.length") == this.get("allSortedTracesDesc.length");
    }.property("topSortedTracesDesc.length","allSortedTracesDesc.length"),
    sortedTracesDesc: function(){
        return this.get("isToShowAll") ? this.get("allSortedTracesDesc") : this.get("topSortedTracesDesc")
    }.property("isToShowAll"),
    isToShowAll:false,
    actions:{
        toggleToShowAll:function(){
            this.toggleProperty("isToShowAll");
        }
    }
});

Hwv.Instance.FIXTURES = [
    {
        id: 1,
        name: 'car1-asdf',
        car: 1,
        testtype:1,
        is_started: false,
        is_finished: false,
        is_abort: false,
        flow: 1,
        flowversion: 1,
        inbox_organization: 1,
        inbox_user: 1,
        inbox_console: null,
        // outbox_users: 'asdfasdf',
        creater: 1,
        created_date: '2014-12-12 12:12:12',
        modifier: 1,
        modified_date: '2014-12-12 12:12:12'
    },
    {
        id: 2,
        name: 'car2-asdf',
        car: 2,
        testtype:2,
        is_started: true,
        is_finished: false,
        is_abort: false,
        flow: 1,
        flowversion: 1,
        inbox_organization: 4,
        inbox_user: 7,
        inbox_console: null,
        // outbox_users: 'asdfasdf',
        creater: 1,
        created_date: '2014-12-12 12:12:12',
        modifier: 1,
        modified_date: '2014-12-12 12:12:12'
    },
    {
        id: 3,
        name: 'car3-asdf',
        car: 3,
        testtype:2,
        is_started: true,
        is_finished: false,
        is_abort: false,
        flow: 1,
        flowversion: 1,
        inbox_organization: 4,
        inbox_user: null,
        inbox_console: null,
        // outbox_users: 'asdfasdf',
        creater: 1,
        created_date: '2014-12-12 12:12:12',
        modifier: 1,
        modified_date: '2014-12-12 12:12:12'
    },
    {
        id: 4,
        name: 'car4-asdf',
        car: 4,
        testtype:2,
        is_started: false,
        is_finished: false,
        is_abort: false,
        flow: 1,
        flowversion: 1,
        inbox_organization: 2,
        inbox_user: null,
        inbox_console: null,
        // outbox_users: 'asdfasdf',
        creater: 1,
        created_date: '2014-12-12 12:12:12',
        modifier: 1,
        modified_date: '2014-12-12 12:12:12'
    }
];
