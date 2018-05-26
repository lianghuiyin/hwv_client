Hwv.Step = DS.Model.extend({
    name: DS.attr('string'),
    type: DS.attr('string'),//开始步骤（start）、开始步骤（start）、结束步骤（end）、中间步骤（process）
    handler_org_type: DS.attr('string', {defaultValue: 'fix_organization'}),//处理组织类型，不能为空，选项：指定组织fix_organization，处理时预定车间reserve_workshop
    handler_type: DS.attr('string', {defaultValue: 'empty'}),//处理人类型，不能为空，选项：指定人员fix_user，处理时预定人员reserve_user，空empty
    next_step_type: DS.attr('string'),//流转方式，不能为空，选项：自由流转all_step，返回上一步last_step
    organization: DS.belongsTo('organization'),//关联组织，handler_org_type为fix_organization时不能为空
    user: DS.belongsTo('user'),//关联用户，handler_type为fix_user时不能为空
    is_handler_locked: DS.attr('boolean', {defaultValue: true}),//是否锁定处理人为当前登录账户，如果锁定则工作单中处理人只能是当前登录用户，不可以选择处理人，反之可以选择其他用户为处理人
    is_controllable: DS.attr('boolean', {defaultValue: false}),//是否可控制，如果是则console不能为空
    console: DS.belongsTo('console'),//关联控制台，如果步骤需要发送到控制台，则在这里指定一个控制台，否则不发送到控制台
    description: DS.attr('string'),
    help_text: DS.attr('string'),//当工作单流转到当前步骤时给用户提示帮助
    default_info: DS.attr('string'),//当前步骤的默认处理信息
    yellow_timeout: DS.attr('number', {defaultValue: 0}),
    red_timeout: DS.attr('number', {defaultValue: 0}),
    color: DS.attr('string', {defaultValue: "green"}),
    isStart:function(){
        return this.get("type") == "start";
    }.property("modified_date"),
    isEnd:function(){
        return this.get("type") == "end";
    }.property("modified_date")
});

Hwv.StepController = Ember.ObjectController.extend({
    needs:["flowversion"],
    isDeletedForTemp:false,
    isSelected:function(){
        return this.get("controllers.flowversion.selectedStep.id") == this.get("id");
    }.property("controllers.flowversion.selectedStep")
});
Hwv.SelectedStepController = Ember.ObjectController.extend({
    needs:["application","flowversion"],
    isEditing:false,
    isNew:false,
    pannelTitle:"控制台详情",
    helpInfo:"只有该控制台的“关联组织”才能操作该控制台，\
    在控制台中可以在“激活”和“停止”两种状态间切换，\
    可通过设置超时时限来提醒用户车辆处于“激活”或“停止”状态的时间已超时，\
    “帮助信息”中的文字内容将出现在控制台的帮助栏以帮助用户正确的操作该控制台。",
    organizations:function(){
        // return this.store.all("organization");
        //这里不可以用store.all().filterBy函数，因为那个函数不会自动更新
        return this.store.filter('organization', function (organization) {
            return true;
        });
    }.property(),
    selectedOrganization:function(k,v){
        var model = this.get('model');
        if(!model){
            return;
        }
        if (v === undefined) {
            return model.get("organization");
        } else {
            model.set('organization', v);
            //纠正model的belongsTo关联属性在changedAttributes及rollback上的bug
            this.get("model").fixChangedAttributesBugForKey("organization");
            return v;
        }
    }.property("model.organization"),
    users:function(){
        var model = this.get('model'),
            organization = model.get("organization");
        if(organization){
            return this.store.filter('user', function (user) {
                return user.get('organization.id') == organization.get("id");
            });
        }
        else{
            return [];
        }
    }.property("model.organization"),
    selectedUser:function(k,v){
        var model = this.get('model');
        if(!model){
            return;
        }
        if (v === undefined) {
            return model.get("user");
        } else {
            model.set('user', v);
            //纠正model的belongsTo关联属性在changedAttributes及rollback上的bug
            this.get("model").fixChangedAttributesBugForKey("user");
            return v;
        }
    }.property("model.user"),
    consoles:function(){
        return this.store.all("console");
    }.property(),
    selectedConsole:function(k,v){
        var model = this.get('model');
        if(!model){
            return;
        }
        if (v === undefined) {
            return model.get("console");
        } else {
            model.set('console', v);
            //纠正model的belongsTo关联属性在changedAttributes及rollback上的bug
            this.get("model").fixChangedAttributesBugForKey("console");
            return v;
        }
    }.property("model.console"),
    isNotEndStep:function(){
        return this.get("type") != "end";
    }.property("type"),
    isFixUserDisabled:function(){
        //这里不可以用Ember.computed.equal或not，因为handler_org_type变化时不会实时更新
        return this.get("model.handler_org_type") != "fix_organization";
    }.property("model.handler_org_type"),
    isFixOrganization:Ember.computed.equal('handler_org_type', 'fix_organization'),
    isReserveWorkshop:Ember.computed.equal('handler_org_type', 'reserve_workshop'),
    isFixUser:Ember.computed.equal('handler_type', 'fix_user'),
    isReserveUser:Ember.computed.equal('handler_type', 'reserve_user'),
    isEmptyUser:Ember.computed.equal('handler_type', 'empty'),
    isReserveWorkshop:Ember.computed.equal('handler_org_type', 'reserve_workshop'),
    isAllStep:Ember.computed.equal('next_step_type', 'all_step'),
    isLastStep:Ember.computed.equal('next_step_type', 'last_step'),
    isGray:Ember.computed.equal('color', 'gray'),
    isGreen:Ember.computed.equal('color', 'green'),
    isYellow:Ember.computed.equal('color', 'yellow'),
    isRed:Ember.computed.equal('color', 'red'),
    isUsersEmpty:function(){
        if(this.get("model.organization")){
            return this.get("users.length") == 0;
        }
        else{
            return false;
        }
    }.property("users.length","model.organization"),
    actions:{
        setColor:function(value){
            this.get('model').set("color",value);
        },
        setHandlerOrgType:function(value){
            this.get('model').set("handler_org_type",value);
            if(value != "fix_organization"){
                if(this.get("model.handler_type") == "fix_user"){
                    //如果handler_org_type不是指定组织，则handler_type不可以为指定用户，所以需要强行改成其他值
                    this.set("model.handler_type","empty");
                    this.set("model.user",null);
                    //纠正model的belongsTo关联属性在changedAttributes及rollback上的bug
                    this.get("model").fixChangedAttributesBugForKey("user");
                }
                this.set("model.organization",null);
                //纠正model的belongsTo关联属性在changedAttributes及rollback上的bug
                this.get("model").fixChangedAttributesBugForKey("organization");
            }
        },
        setHandlerType:function(value){
            this.get('model').set("handler_type",value);
            if(value != "fix_user"){
                this.set("model.user",null);
                //纠正model的belongsTo关联属性在changedAttributes及rollback上的bug
                this.get("model").fixChangedAttributesBugForKey("user");
            }
        },
        setNextStepType:function(value){
            this.get('model').set("next_step_type",value);
        },
        setIsHandlerLocked:function(value){
            this.get('model').set("is_handler_locked",value);
        },
        setIsControllable:function(value){
            this.get('model').set("is_controllable",value);
            if(!value){
                this.get('model').set("console",null);
            }
        },
        deleteRecord:function(){
        }
    }
});

Hwv.Step.FIXTURES = [
    {
        id: 1,
        name: '试验前准备',
        type: 'start',
        handler_org_type: 'fix_organization',
        handler_type: 'reserve_user',
        next_step_type: 'all_step',//all_step/last_step
        organization: 1,
        user:null,
        is_handler_locked:true,
        is_controllable:false,
        console:null,
        yellow_timeout: 80,
        red_timeout: 120,
        color: 'green',
        default_info: '准备好了，可以装车了',
        description: '当需要支持小组协调处理试验前工作时可以发送到该步骤',
        help_text: ''
    },
    {
        id: 2,
        name: '报废',
        type: 'end',
        handler_org_type: 'fix_organization',
        handler_type: 'empty',
        next_step_type: 'all_step',
        organization: null,
        user:null,
        is_handler_locked:true,
        is_controllable:false,
        console:null,
        yellow_timeout: 0,
        red_timeout: 0,
        color: 'green',
        default_info: '',
        description: '当车辆退股并报废后可以发送到该步骤，同时结束该工作单',
        help_text: ''
    },
    {
        id: 3,
        name: '保养',
        type: 'process',
        handler_org_type: 'fix_organization',
        handler_type: 'empty',
        next_step_type: 'last_step',//all_step/last_step
        organization: 5,
        user:null,
        is_handler_locked:false,
        is_controllable:false,
        console:null,
        yellow_timeout: 80,
        red_timeout: 120,
        color: 'green',
        default_info: '保养完成',
        description: '当车辆需要保养时可以发送到该步骤',
        help_text: ''
    },
    {
        id: 4,
        name: '工程师检查',
        type: 'process',
        handler_org_type: 'fix_organization',
        handler_type: 'reserve_user',
        next_step_type: 'all_step',//all_step/last_step
        organization: 3,
        user:null,
        is_handler_locked:true,
        is_controllable:false,
        console:null,
        yellow_timeout: 80,
        red_timeout: 120,
        color: 'green',
        default_info: '检查完成',
        description: '',
        help_text: ''
    },
    {
        id: 5,
        name: '装车',
        type: 'process',
        handler_org_type: 'reserve_workshop',
        handler_type: 'empty',
        next_step_type: 'last_step',//all_step/last_step
        organization: null,
        user:null,
        is_handler_locked:false,
        is_controllable:false,
        console:null,
        yellow_timeout: 80,
        red_timeout: 120,
        color: 'green',
        default_info: '装车完成，可以投入试验了',
        description: '当需要装车时可以发送到该步骤',
        help_text: '请输入处理信息后点击发送来提交工作单，该工作单将返回给支持小组协调后续工作。'
    },
    {
        id: 6,
        name: '检查员检查',
        type: 'process',
        handler_org_type: 'fix_organization',
        handler_type: 'empty',
        next_step_type: 'all_step',//all_step/last_step
        organization: 2,
        user:null,
        is_handler_locked:true,
        is_controllable:false,
        console:null,
        yellow_timeout: 80,
        red_timeout: 120,
        color: 'green',
        default_info: '检查完成',
        description: '',
        help_text: ''
    },
    {
        id: 7,
        name: '统计员接收',
        type: 'process',
        handler_org_type: 'fix_organization',
        handler_type: 'empty',
        next_step_type: 'all_step',//all_step/last_step
        organization: 4,
        user:null,
        is_handler_locked:true,
        is_controllable:false,
        console:null,
        yellow_timeout: 80,
        red_timeout: 120,
        color: 'green',
        default_info: '',
        description: '当需要统计员接收车辆并准备投入试验时可以发送到该步骤',
        help_text: ''
    },
    {
        id: 8,
        name: '投入试验',
        type: 'process',
        handler_org_type: 'fix_organization',
        handler_type: 'empty',
        next_step_type: 'all_step',//all_step/last_step
        organization: 4,
        user:null,
        is_handler_locked:true,
        is_controllable:true,
        console:1,
        yellow_timeout: 0,
        red_timeout: 0,
        color: 'gray',
        default_info: '试验完成',
        description: '当把车辆投入试验并需要在试验控制台开始试验时可以发送到该步骤',
        help_text: ''
    },
    {
        id: 9,
        name: '换胎',
        type: 'process',
        handler_org_type: 'fix_organization',
        handler_type: 'empty',
        next_step_type: 'last_step',//all_step/last_step
        organization: 6,
        user:null,
        is_handler_locked:false,
        is_controllable:false,
        console:null,
        yellow_timeout: 80,
        red_timeout: 120,
        color: 'green',
        default_info: '换好胎了',
        description: '当轮胎需要更换时可以发送到该步骤',
        help_text: ''
    },
    {
        id: 10,
        name: '换制动片',
        type: 'process',
        handler_org_type: 'fix_organization',
        handler_type: 'empty',
        next_step_type: 'last_step',//all_step/last_step
        organization: 5,
        user:null,
        is_handler_locked:false,
        is_controllable:false,
        console:null,
        yellow_timeout: 80,
        red_timeout: 120,
        color: 'green',
        default_info: '换过制动片了',
        description: '当需要更换制动片时可以发送到该步骤',
        help_text: ''
    },
    {
        id: 11,
        name: '故障支持',
        type: 'process',
        handler_org_type: 'fix_organization',
        handler_type: 'reserve_user',
        next_step_type: 'all_step',//all_step/last_step
        organization: 1,
        user:null,
        is_handler_locked:true,
        is_controllable:false,
        console:null,
        yellow_timeout: 80,
        red_timeout: 120,
        color: 'green',
        default_info: '请帮忙处理下这个故障',
        description: '当出现故障时可以发送到该步骤，由支持小组协调处理',
        help_text: ''
    },
    {
        id: 12,
        name: '故障维修',
        type: 'process',
        handler_org_type: 'reserve_workshop',
        handler_type: 'empty',
        next_step_type: 'last_step',//all_step/last_step
        organization: null,
        user:null,
        is_handler_locked:false,
        is_controllable:false,
        console:null,
        yellow_timeout: 80,
        red_timeout: 120,
        color: 'green',
        default_info: '修理好了',
        description: '当需要处理故障时可以发送到该步骤',
        help_text: ''
    },
    {
        id: 13,
        name: '试验后准备',
        type: 'process',
        handler_org_type: 'fix_organization',
        handler_type: 'reserve_user',
        next_step_type: 'all_step',//all_step/last_step
        organization: 1,
        user:null,
        is_handler_locked:true,
        is_controllable:false,
        console:null,
        yellow_timeout: 80,
        red_timeout: 120,
        color: 'green',
        default_info: '准备好了，可以拆解了',
        description: '当试验完成后可以发送到该步骤，由支持小组协调试验后的工作',
        help_text: ''
    },
    {
        id: 14,
        name: '拆解',
        type: 'process',
        handler_org_type: 'reserve_workshop',
        handler_type: 'empty',
        next_step_type: 'last_step',//all_step/last_step
        organization: null,
        user:null,
        is_handler_locked:false,
        is_controllable:false,
        console:null,
        yellow_timeout: 80,
        red_timeout: 120,
        color: 'green',
        default_info: '拆解完成',
        description: '试验完成后需要把车辆拆解时可以发送到该步骤',
        help_text: ''
    },
    {
        id: 15,
        name: '工程师招车',
        type: 'process',
        handler_org_type: 'fix_organization',
        handler_type: 'reserve_user',
        next_step_type: 'all_step',//all_step/last_step
        organization: 3,
        user:null,
        is_handler_locked:true,
        is_controllable:false,
        console:null,
        yellow_timeout: 80,
        red_timeout: 120,
        color: 'green',
        default_info: '',
        description: '当工程师需要招车时可以发送到该步骤',
        help_text: ''
    },
    {
        id: 16,
        name: '支持组招车',
        type: 'process',
        handler_org_type: 'fix_organization',
        handler_type: 'reserve_user',
        next_step_type: 'all_step',//all_step/last_step
        organization: 1,
        user:null,
        is_handler_locked:true,
        is_controllable:false,
        console:null,
        yellow_timeout: 80,
        red_timeout: 120,
        color: 'green',
        default_info: '',
        description: '当支持小组需要招车时可以发送到该步骤',
        help_text: ''
    }
];
