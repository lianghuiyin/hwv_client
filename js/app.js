/*!
 * Hwv v1.0
 * Copyright 2011-2014 Lit.In
 */

window.Hwv = Ember.Application.create({
  LOG_TRANSITIONS: false,
  transitionAnimation:"none",
  newModelTag:"新增%@",
  detailModelTag:"%@详情",
  editModelTag:"修改%@信息",
  currentUser:null
});

// Hwv.StepHandlerTypeSelectView = Ember.Select.extend({
//     content: Ember.A([{
//         value:"all_step2",
//         name:"自由流转2"
//     },{
//         value:"all_step",
//         name:"自由流转"
//     },{
//         value:"last_step",
//         name:"返回上一步"
//     }]),
//     optionLabelPath: 'content.name',
//     optionValuePath: 'content.value',
//     selection:function(k,v){
//         // if(typeof v == "string"){
//         //     return this.get("content").findBy("value",v)
//         // }
//     }.property("value")
// });
// Hwv.ApplicationSerializer = DS.ActiveModelSerializer.extend();
// Hwv.OrganizationSerializer = DS.JSONSerializer.extend();
Hwv.ApplicationRoute = Ember.Route.extend({
    beforeModel: function() {
        window.document.title = this.controllerFor("application").get("appTitle");
    },
    model: function() {
        var store = this.store;
        Hwv.Role.FIXTURES.forEach(function(item,index){
            store.push('role', item);
        });
        Hwv.Organization.FIXTURES.forEach(function(item,index){
            store.push('organization', item);
        });
        Hwv.User.FIXTURES.forEach(function(item,index){
            store.push('user', item);
        });
        Hwv.Car.FIXTURES.forEach(function(item,index){
            store.push('car', item);
        });
        Hwv.Workshop.FIXTURES.forEach(function(item,index){
            store.push('workshop', item);
        });
        Hwv.Testtype.FIXTURES.forEach(function(item,index){
            store.push('testtype', item);
        });
        Hwv.Console.FIXTURES.forEach(function(item,index){
            store.push('console', item);
        });
        Hwv.Flow.FIXTURES.forEach(function(item,index){
            store.push('flow', item);
        });
        Hwv.Flowversion.FIXTURES.forEach(function(item,index){
            store.push('flowversion', item);
        });
        Hwv.Step.FIXTURES.forEach(function(item,index){
            store.push('step', item);
        });
        Hwv.Exhibition.FIXTURES.forEach(function(item,index){
            store.push('exhibition', item);
        });
        Hwv.Screenarea.FIXTURES.forEach(function(item,index){
            store.push('screenarea', item);
        });
        Hwv.Instance.FIXTURES.forEach(function(item,index){
            store.push('instance', item);
        });
        Hwv.Trace.FIXTURES.forEach(function(item,index){
            store.push('trace', item);
        });
        Hwv.Approve.FIXTURES.forEach(function(item,index){
            store.push('approve', item);
        });
        var sessionController = this.controllerFor("session");
        sessionController.set("user",this.store.getById("user",7));
        sessionController.set("isLogined",true);
    },
    actions:{
        goIndex:function(){
            this.transitionTo('index');
        }
    }
});

Hwv.IndexRoute = Ember.Route.extend({
    beforeModel: function() {
        var isLogined = this.controllerFor("session").get("isLogined");
        if(isLogined){
            this.transitionTo('start');
        }
        else{
            this.transitionTo('login');
        }
    }
});

Hwv.ApplicationController = Ember.Controller.extend({
    needs:["session","session"],
    appName: 'Horizon Workshop Vehicle Management System.',
    appTitle:"车间车辆信息管理系统",
    author:"上海好耐电子科技有限公司 M&T HORIZON",
    copyright:"版权所有 copyright 2014",
    version:"当前版本：v1.0.0",
    timeoutTag:"分钟",
    isShowingExhibition:false,
    isDeveloper:function(){
        
        return this.get("controllers.session.user.is_developer");
    }.property("controllers.session.user.is_developer"),
    actions:{
        logout:function(){
            this.get("controllers.session").send("logout");
        }
    }
});


Hwv.ApplicationView = Ember.View.extend({
    templateName: 'application',
    classNames:['app-view'],
    classNameBindings:["controller.isShowingExhibition"]
});


// Hwv.ApplicationAdapter = DS.FixtureAdapter.extend({//RESTAdapter

// });



Hwv.ApplicationAdapter = DS.RESTAdapter.extend({//RESTAdapter

});


// Hwv.FlowversionSerializer = DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, {
//   attrs: {
//     steps: {embedded: 'always'}
//   }
// });

Hwv.Router.map(function () {
    this.route('login');
    this.route('start', function () {
        this.resource('start.instances', { path: '/instances' }, function () {
            this.route('inbox',function(){
                this.resource('inbox.instance', { path: '/instance/:instance_id' }, function () {
                });
            });
            this.route('outbox',function(){
                this.resource('outbox.instance', { path: '/instance/:instance_id' }, function () {
                });
            });
        });
        this.resource('start.exhibitionshow', { path: '/exhibitionshow' }, function () {
            
        });
        this.resource('start.consolewindow', { path: '/consolewindow' }, function () {
            
        });
        this.route('setting', function () {
            this.resource('roles', { path: '/roles' }, function () {
                this.resource('role', { path: '/role/:role_id' }, function () {
                    this.route('edit',function(){
                        
                    });
                });
                this.route('new',function(){
                    
                });
            });
            this.resource('organizations', { path: '/organizations' }, function () {
                this.resource('organization', { path: '/organization/:organization_id' }, function () {
                    this.route('edit',function(){
                        
                    });
                });
                this.route('new',function(){
                    
                });
            });
            this.resource('users', { path: '/users' }, function () {
                this.resource('user', { path: '/user/:user_id' }, function () {
                    this.route('edit',function(){
                        
                    });
                });
                this.route('new',function(){
                    
                });
            });
            this.resource('cars', { path: '/cars' }, function () {
                this.resource('car', { path: '/car/:car_id' }, function () {
                    this.route('edit',function(){
                        
                    });
                });
                this.route('new',function(){
                    
                });
            });
            this.resource('workshops', { path: '/workshops' }, function () {
                this.resource('workshop', { path: '/workshop/:workshop_id' }, function () {
                    this.route('edit',function(){
                        
                    });
                });
                this.route('new',function(){
                    
                });
            });
            this.resource('testtypes', { path: '/testtypes' }, function () {
                this.resource('testtype', { path: '/testtype/:testtype_id' }, function () {
                    this.route('edit',function(){
                        
                    });
                });
                this.route('new',function(){
                    
                });
            });
            this.resource('consoles', { path: '/consoles' }, function () {
                this.resource('console', { path: '/console/:console_id' }, function () {
                    this.route('edit',function(){
                        
                    });
                });
                this.route('new',function(){
                    
                });
            });
            this.resource('flows', { path: '/flows' }, function () {
                this.resource('flow', { path: '/flow/:flow_id' }, function () {
                    this.route('edit',function(){

                    });
                    this.resource('flowversion', { path: '/flowversion/:flowversion_id' },function(){
                        this.route('edit',function(){

                        });
                    });
                });
                this.route('new',function(){
                    
                });
            });
            this.resource('exhibitions', { path: '/exhibitions' }, function () {
                this.resource('exhibition', { path: '/exhibition/:exhibition_id' }, function () {
                    this.route('edit',function(){
                        
                    });
                });
                this.route('new',function(){
                    
                });
            });
        });
    });
    this.route('about');
    this.route('contact');
    this.route('account',function(){
        this.route('accountinfo',function(){
            this.route('edit',function(){
                
            });
        });
        this.route('accountpwd',function(){
        });
    });
});


