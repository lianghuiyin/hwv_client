Hwv.StartExhibitionshowRoute = Ember.Route.extend({
    renderTemplate: function() {
        this.render({ outlet: 'exhibitionshow' });
    },
    beforeModel: function() {
        
    },
    model: function () {
        return this.store.all('exhibition').get("lastObject");
    },
    afterModel: function(model, transition) {
    },
    setupController: function (controller, model) {
        this._super(controller, model);
        this.controllerFor("application").set("isShowingExhibition",true);
    },
    actions:{
        goBack:function(){
            this.controllerFor("application").set("isShowingExhibition",false);
            
            var self = this;
            $(".start-exhibitionshow.navigable-pane").navigablePop({
                targetTo:".start-index.navigable-pane",
                animation:"slideHorizontal",
                callBack:function(){
                    self.transitionTo('start');
                }
            });
        }
    }
});

Hwv.StartExhibitionshowView = Ember.View.extend({
    didInsertElement:function(buffer){
        var currentRouteName = this.controller.get("controllers.application.currentRouteName");
        if(currentRouteName == "start.exhibitionshow.index"){
            $(".start-index.navigable-pane").navigablePush({
                targetTo:".start-exhibitionshow.navigable-pane",
                animation:Hwv.transitionAnimation
            });
            Hwv.transitionAnimation = "none";
        }
        return this;
    },
    classNames:['start-exhibitionshow','navigable-pane','collapse']
});
Hwv.StartExhibitionshowController = Ember.ObjectController.extend({
    needs:["application"]
});

Hwv.ExhibitionshowAreaItemController = Ember.ObjectController.extend({
    needs:["application"],
    colMdClass:function(){
        return "col-md-%@".fmt(this.get("columns"));
    }.property("columns"),
    isHasChild:function(){
        return this.get("children.length") > 0;
    }.property("children"),
    /**
     * [checkInstance 检测instance是否符合area定制的条件，
     * 依次检测area的steps、workshops及testtypes只有三个条件同时满足时才表示通过检测]
     * @param  {[Hwv.Instance]} instance [description]
     * @param  {[Hwv.Screenarea]} area     [description]
     * @return {[boolean]}          [返回是否符合]
     */
    checkIsInstanceInArea:function(instance,area,isHasChild){
        if(instance.get("is_finished")){
            //instance为空时肯定不需要显示在展示台，直接检测不通过即可
            return false;
        }
        else{
            var lastTrace = instance.get("lastTrace"),
                lastApprove = instance.get("lastApprove"),
                isStepChecked = false,//是否通过步骤的检测
                isWorkshopChecked = false,//是否通过车间组的检测
                isTesttypeChecked = false,//是否通过试验类型的检测
                areaSteps = area.get("steps"),
                areaWorkshops = area.get("workshops"),
                areaTesttypes = area.get("testtypes"),
                areaState = area.get("state"),
                lastTraceStepId = lastTrace ? lastTrace.get("step.id") : 0,
                lastApproveState = lastApprove ? lastApprove.get("state") : null;
            if(areaSteps && areaSteps.get("length") > 0){
                //areaSteps存在时才开始检测，
                if(lastApprove){
                    //lastApprove不为空时要同时检测步骤及步骤的控制台状态
                    isStepChecked = areaSteps.isAny("id",lastTraceStepId) && (areaState ? areaState == lastApproveState : true);
                }
                else{
                    //lastApprove为空时只要检测步骤，即只检测lastTrace
                    //lastTrace为空时说明instance已结束，这时肯定不需要显示在展示台，直接检测不通过即可
                    isStepChecked = lastTrace ? areaSteps.isAny("id",lastTraceStepId) : false;
                }
            }
            else{
                //areaSteps为空时说明不需要检测步骤
                isStepChecked = true;
            }
            if(isStepChecked){
                //如果通过了步骤的检测，继续车间组的检测及试验类型的检测
                if(areaWorkshops && areaWorkshops.get("length") > 0){
                    //areaWorkshops存在时才开始检测
                    //lastTrace为空时说明instance已结束，这时肯定不需要显示在展示台，直接检测不通过即可
                    isWorkshopChecked = lastTrace ? areaWorkshops.isAny("id",lastTrace.get("workshop.id")) : false;
                }
                else{
                    //areaWorkshops为空时说明不需要检测车间组
                    isWorkshopChecked = true;
                }
                if(isWorkshopChecked){
                    //如果通过了车间组的检测，继续试验类型的检测
                    if(areaTesttypes && areaTesttypes.get("length") > 0){
                        //areaTesttypes存在时才开始检测
                        isTesttypeChecked = areaTesttypes.isAny("id",instance.get("testtype.id"));
                    }
                    else{
                        //areaTesttypes为空时说明不需要检测试验类型
                        isTesttypeChecked = true;
                    }
                    if(!isTesttypeChecked){
                        //如果没有通过试验类型的检测，直接返回不通过检测
                        return false;
                    }
                }
                else{
                    //如果没有通过车间组的检测，直接返回不通过检测
                    return false;
                }
            }
            else{
                //如果没有通过步骤的检测，直接返回不通过检测
                return false;
            }
            return isStepChecked && isWorkshopChecked && isTesttypeChecked;
        }
    },
    instances:function(){
        var self = this,isHasChild = this.get("isHasChild"),
            children = this.get("children"),
            checkIsInstanceInArea = this.get("checkIsInstanceInArea");
        return this.store.filter("instance",function(instance){
            if(isHasChild){
                if(instance.get("is_finished")){
                    return false;
                }
                else{
                    var isChecked = false;
                    children.every(function(child,index){
                        //只要instance能满足任何一个子区域设置说明通过检测，反之不通过
                        isChecked = checkIsInstanceInArea(instance,child);
                        if(isChecked){
                            //如果发现有一个通过，则立刻退出循环
                            return false;
                        }
                        else{
                            return true;
                        }
                    });
                    return isChecked;
                }
            }
            else{
                return checkIsInstanceInArea(instance,self);
            }
        });
    }.property()
});

Hwv.ExhibitionshowChildItemController = Ember.ObjectController.extend({
    needs:["exhibitionshow_area_item"],
    colMdClass:function(){
        return "col-md-%@".fmt(this.get("columns"));
    }.property("columns"),
    instances:function(){
        var self = this,checkIsInstanceInArea = this.get("controllers.exhibitionshow_area_item.checkIsInstanceInArea");
        return this.store.filter("instance",function(instance){
            return checkIsInstanceInArea(instance,self);
        });
    }.property()
});

