DS.Model.reopen({
    /**
     * [rollback model的回滚函数]
     * 由于ember对于belongsTo关联属性在changedAttributes及rollback上有bug，
     * 这里通过强行把changedAttributes中所有belongsTo关联属性的更新记录还原到更新前的值，
     * 注意由于ember的这个bug同样存在于changedAttributes属性的更新（其会忽略掉belongsTo关联属性），
     * 所以需要手动把belongsTo关联属性的更改添加到changedAttributes集合中。
     */
    rollback: function() {
        var changedAttributes = this.changedAttributes(),
            belongsTos = Em.get(this.constructor,"relationshipNames").belongsTo,//array
            oldValue,typeForRelationship;
        belongsTos.forEach(function(belongsTo){
            if(changedAttributes[belongsTo]){
                typeForRelationship = this.constructor.typeForRelationship(belongsTo);
                oldValue = changedAttributes[belongsTo][0];
                if(oldValue.constructor != typeForRelationship){
                    oldValue = this.store.getById(typeForRelationship,oldValue);
                }
                this.set(belongsTo, oldValue);
            }
        },this);
        this._super();
    },
    fixChangedAttributesBugForKey:function(key){
        //由于ember对于belongsTo关联属性在changedAttributes及rollback上有bug
        //这里通过强行把belongsTo关联属性的更新记录到更新属性集合_attributes中
        //其会自动反映到changedAttributes集合中，从而可以正确的执行rollback
        this._attributes[key] = this.get(key);
        this.send('becomeDirty');
    }
});

Ember.View.reopen({
  init: function() {
    this._super();
    var self = this;

    // bind attributes beginning with 'data-'
    Em.keys(this).forEach(function(key) {
      if (key.substr(0, 5) === 'data-') {
        self.get('attributeBindings').pushObject(key);
      }
    });
  }
});

Ember.Handlebars.helper('color', function(value,options) {
    var text = options.hash.text;
    if(!text){
        switch(value){
            case "gray":
                text = "灰色";
                break;
            case "green":
                text = "绿色";
                break;
            case "yellow":
                text = "黄色";
                break;
            case "red":
                text = "红色";
                break;
        }
    }
    return new Handlebars.SafeString('<span class="timeout-color timeout-color-%@">%@</span>'.fmt(value,text));
});

Ember.Handlebars.helper('history_line', function(value,options) {
    var isFinished = options.hash.isFinished;
    return new Handlebars.SafeString('<div class="history-line timeout-color-%@ %@"></div>'.fmt(value,isFinished ? "" : "t5"));
});

Ember.Handlebars.helper('step_type', function(value,isTextNeeded) {
    var glyphicon = "",
        typeText = "";
    switch(value){
        case "start":
            glyphicon = "glyphicon-play green";
            typeText = "开始";
            break;
        case "end":
            glyphicon = "glyphicon-stop red";
            typeText = "结束";
            break;
        case "process":
            glyphicon = "glyphicon-random";
            typeText = "中间";
            break;
    }
    if(isTextNeeded){
        typeText = '<span>%@</span>'.fmt(typeText);
    }
    else{
        typeText = "";
    }
    return new Handlebars.SafeString('%@ <span class="glyphicon %@"></span>'.fmt(typeText,glyphicon));
});
Ember.Handlebars.helper('step_handler_org_type', function(value) {
    var typeText = "";
    switch(value){
        case "fix_organization":
            typeText = "指定组织";
            break;
        case "reserve_workshop":
            typeText = "处理时预定车间组";
            break;
    }
    return '%@'.fmt(typeText);
});
Ember.Handlebars.helper('step_handler_type', function(value) {
    var typeText = "";
    switch(value){
        case "fix_user":
            typeText = "指定人员";
            break;
        case "reserve_user":
            typeText = "处理时预定人员";
            break;
        case "empty":
            typeText = "空";
            break;
    }
    return '%@'.fmt(typeText);
});
Ember.Handlebars.helper('step_next_step_type', function(value) {
    var typeText = "";
    switch(value){
        case "all_step":
            typeText = "自由流转";
            break;
        case "last_step":
            typeText = "返回上一步";
            break;
    }
    return '%@'.fmt(typeText);
});
Ember.Handlebars.helper('boolean', function(value) {
    var text = value ? "是" : "否";
    return '%@'.fmt(text);
});
Ember.Handlebars.helper('timefmt', function(value) {
    if(value instanceof Date){
        return value.format("yyyy-MM-dd hh:mm:ss");
    }
    else{
        var date = HOJS.lib.parseDate(value);
        return date ? date.format("yyyy-MM-dd hh:mm:ss") : "";
    }
});
Ember.Handlebars.helper('approve_state', function(value,color) {
    var text = value == "on" ? "已激活" : "已停止";
    return new Handlebars.SafeString('<span class="%@">%@</span>'.fmt(color,text));
});



// DS.JSONSerializer.reopen({
//     serializeBelongsTo: function(record, json, relationship) {
//         var key = relationship.key,
//             belongsTo = Ember.get(record, key);
//         key = this.keyForRelationship ? this.keyForRelationship(key, "belongsTo") : key;
        
//         if (relationship.options.embedded === 'always') {
//             json[key] = belongsTo.serialize();
//         }
//         else {
//             return this._super(record, json, relationship);
//         }
//     },
//     serializeHasMany: function(record, json, relationship) {
//         var key = relationship.key,
//             hasMany = Ember.get(record, key),
//             relationshipType = DS.RelationshipChange.determineRelationshipType(record.constructor, relationship);
        
//         if (relationship.options.embedded === 'always') {
//             if (hasMany && relationshipType === 'manyToNone' || relationshipType === 'manyToMany' ||
//                 relationshipType === 'manyToOne') {
                
//                 json[key] = [];
//                 hasMany.forEach(function(item, index){
//                     json[key].push(item.serialize());
//                 });
//             }
        
//         }
//         else {
//             return this._super(record, json, relationship);
//         }
//     }
// });


// DS.JSONSerializer.reopen({
//   serializeHasMany: function(record, json, relationship) {
//     var key = relationship.key;
//     if (key === 'steps') {
//       return;
//     } else {
//       this._super.apply(this, arguments);
//     }
//   }
// });



