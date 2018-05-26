Hwv.LoginRoute = Ember.Route.extend({
    beforeModel: function() {
        var isLogined = this.controllerFor("session").get("isLogined");
        if(isLogined){
            this.transitionTo('start');
        }
    },
    model:function(){
    	return this.store.createRecord("login");
    }
});

Hwv.Login = DS.Model.extend({
    name: DS.attr('string'),
    password: DS.attr('string')
});

Hwv.LoginController = Ember.ObjectController.extend({
    needs:["application","session"],
    actions:{
	    go:function(){
	        // this.get("model").save();
	    	var name = this.get("model.name"),
	    		password = this.get("model.password"),
	    		isPassed = false,
	    		itemPhone,itemEmail,itemPassword,currentUser;
	    	this.store.all("user").every(function(item,index){
	    		itemPhone = item.get("phone"),
	    		itemEmail = item.get("email"),
	    		itemPassword = item.get("password");
	    		isPassed = (itemPhone == name && itemPassword == password) 
	    			|| (itemEmail == name && itemPassword == password);
	    		if(isPassed){
	    			currentUser = item;
	    			return false;
	    		}
	    		else{
	    			return true;
	    		}
	    	});
	    	if(isPassed){
		        this.get("controllers.session").send("login",currentUser);
	    	}
	    	else{
	    	}
	    }
	}
});