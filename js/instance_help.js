Hwv.TraceInstance = DS.Model.extend({
    instance: DS.belongsTo('instance'),
    current_is_handler_locked: DS.attr('boolean'),
    current_is_controllable: DS.attr('boolean'),
    current_info: DS.attr('string'),
    current_user: DS.belongsTo('user'),//预定用户（即上一步骤选择的预定用户）或当前步骤的指定用户，其发送到后台的意义在于验证其值是否等于登录用户
    current_handler: DS.belongsTo('user'),
    next_step: DS.belongsTo('step'),
    next_handler_org_type: DS.attr('string'),
    next_handler_type: DS.attr('string'),
    next_workshop: DS.belongsTo('workshop'),
    next_organization: DS.belongsTo('organization'),
    next_user: DS.belongsTo('user'),
    next_console: DS.belongsTo('console'),
    next_yellow_timeout: DS.attr('number'),
    next_red_timeout: DS.attr('number'),
    next_color: DS.attr('string'),
    next_off_yellow_timeout: DS.attr('number'),
    next_off_red_timeout: DS.attr('number'),
    next_off_color: DS.attr('string')
});

Hwv.NewInstance = DS.Model.extend({
    flow: DS.belongsTo('flow'),
    flowversion: DS.belongsTo('flowversion'),
    car: DS.belongsTo('car'),
    next_organization: DS.belongsTo('organization'),
    next_step: DS.belongsTo('step'),
    next_yellow_timeout: DS.attr('number'),
    next_red_timeout: DS.attr('number'),
    next_color: DS.attr('string'),
    next_off_yellow_timeout: DS.attr('number'),
    next_off_red_timeout: DS.attr('number'),
    next_off_color: DS.attr('string')
});

// Hwv.ApproveInstance = DS.Model.extend({
//     instance: DS.belongsTo('instance'),
//     trace: DS.belongsTo('trace'),
//     approve: DS.belongsTo('approve'),
//     console: DS.belongsTo('approve'),
//     state: DS.attr('string')
// });
