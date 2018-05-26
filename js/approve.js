Hwv.Approve = DS.Model.extend({
    instance: DS.belongsTo('instance'),
    trace: DS.belongsTo('trace'),
    console: DS.belongsTo('console'),
    previous_approve: DS.belongsTo('approve'),
    start_date: DS.attr('string'),
    end_date: DS.attr('string'),
    is_finished: DS.attr('boolean', {defaultValue: false}),
    yellow_due: DS.attr('string'),
    red_due: DS.attr('string'),
    color: DS.attr('string'),
    state: DS.attr('string'),
    creater: DS.belongsTo('user'),
    created_date: DS.attr('string'),
    modifier: DS.belongsTo('user'),
    modified_date: DS.attr('string'),
    /**
     * [realTimeoutColor 全局定时器定时更新该属性值，只更新is_finished为false的trace]
     * @return {[sttring]} [颜色gray/green/yellow/red]
     */
    realTimeoutColor:function(){
        if(this.get("is_finished")){
            return this.get("color");
        }
        else{
            var now = new Date();
            if(now > new Date(this.get("red_due"))){
                return "red";
            }
            else if(now > new Date(this.get("yellow_due"))){
                return "yellow";
            }
            else{
                return this.get("color");
            }
        }
    }.property("is_finished","color"),
});


Hwv.ApproveToggleView = Ember.IconToggleButtonView.extend({
    click: function(event) {
        
        if(this.get("isLoading")){
            return;
        }
        this.set("isLoading",true);//模拟发送请求到服务器时的加载中状态
        Ember.run.later(this,function(){
            var approve = this.get("content"),
                now = new Date(),
                nowStr = now.format("yyyy-MM-dd hh:mm:ss"),
                currentUser = this.get("controllers.session.user"),
                currentState = approve.get("state"),
                currentConsole = approve.get("console"),
                nextState = currentState == "on" ? "off" : "on",
                nextYellowTimeout = currentState == "on" ? currentConsole.get("on_yellow_timeout") : currentConsole.get("off_yellow_timeout"),
                nextRedTimeout = currentState == "on" ? currentConsole.get("on_red_timeout") : currentConsole.get("off_red_timeout"),
                nextColor = currentState == "on" ? currentConsole.get("on_color") : currentConsole.get("off_color");
            //模拟服务器端更新当前approve逻辑
            approve.set("end_date",now);
            approve.set("is_finished",true);
            if(now > approve.get("red_due")){
                approve.set("color","red");
            }
            else if(now > approve.get("yellow_due")){
                approve.set("color","yellow");
            }
            approve.set("modifier",currentUser);
            approve.set("modified_date",nowStr);

            //模拟服务器端新建下一个approve逻辑
            var nextApprove = this.get("content").store.createRecord("approve",{
                instance: approve.get("instance"),
                trace: approve.get("trace"),
                console: currentConsole,
                previous_approve:approve,
                start_date: nowStr,
                end_date: null,
                is_finished: false,
                yellow_due: nextYellowTimeout ? now.addMinutes(nextYellowTimeout).format("yyyy-MM-dd hh:mm:ss") : null,
                red_due: nextRedTimeout ? now.addMinutes(nextRedTimeout).format("yyyy-MM-dd hh:mm:ss") : null,
                color: nextColor,
                state: currentState == "on" ? "off" :"on",//这里直接模拟服务器更改state状态为当前状态的反状态，省略了实际逻辑中应该包括的当前状态检验逻辑
                creater: currentUser,
                created_date: nowStr,
                modifier: currentUser,
                modified_date: nowStr
            });

            //模拟服务器端更新approve对应的trace逻辑
            approve.get("trace").set("modifier",currentUser);
            approve.get("trace").set("modified_date",nowStr);

            //模拟服务器端更新approve对应的instance逻辑
            approve.get("instance").set("modifier",currentUser);
            approve.get("instance").set("modified_date",nowStr);



            //保存到服务器
            approve.save();
            nextApprove.save();
            approve.get("trace").save();
            approve.get("instance").save();

            // var value = this.get("value"),
            //     onValue = this.get("onValue"),
            //     offValue = this.get("offValue");
            // this.set("value",value == onValue ? offValue : onValue);
            this.set("isLoading",false);
        },1000);
    }
});

Hwv.Approve.FIXTURES = [
    {
        id:1,
        instance: 3,
        trace: 33,
        console: 1,
        previous_approve: null,
        start_date: '2014-02-02 14:03:00',
        end_date: '2014-02-02 15:03:00',
        is_finished: true,
        yellow_due: '2014-02-02 14:44:00',
        red_due: '2014-02-02 15:53:00',
        color: 'gray',
        state: 'off',
        creater: 1,
        created_date: '2014-02-03 12:03:00',
        modifier: 7,
        modified_date: '2014-02-02 15:03:00'
    },
    {
        id:11,
        instance: 3,
        trace: 33,
        console: 1,
        previous_approve: 1,
        start_date: '2014-02-02 15:03:00',
        end_date: null,
        is_finished: false,
        yellow_due: '2014-02-02 16:44:00',
        red_due: '2014-02-02 17:53:00',
        color: 'green',
        state: 'on',
        creater: 7,
        created_date: '2014-02-02 15:03:00',
        modifier: 7,
        modified_date: '2014-02-02 15:03:00'

    }
];
