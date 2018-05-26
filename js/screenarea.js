Hwv.Screenarea = DS.Model.extend({
    title: DS.attr('string'),
    steps: DS.hasMany('step'),//流转到哪个步骤
    workshops:DS.hasMany('workshop'),//流转到哪个车间组
    testtypes:DS.hasMany('testtype'),//车辆试验类型
    children:DS.hasMany('screenarea', {embedded: 'always'}),//子区域，比如一个所有车间组的区域
    state: DS.attr('string'),//控制台状态on/off，如果为空则表示on/off两种状态都包括
    columns:DS.attr('number'),//点位宽，12个点满屏
    rows:DS.attr('number'),//点位高，12个点满屏
    description: DS.attr('string')
});

Hwv.ScreenareaController = Ember.ObjectController.extend({
});
Hwv.SelectedScreenareaController = Ember.ObjectController.extend({
});

Hwv.Screenarea.FIXTURES = [
    {
        id: 1,
        workshops:null,
        children:null,
        title: 'Running SWP/SSS',
        testtypes:[1],
        steps: [8],
        state: "on",
        columns: 4,
        rows: 4,
        description: '正在跑试验SWP/SSS的车辆'
    },
    {
        id: 2,
        workshops:null,
        children:null,
        title: 'Running SVP',
        testtypes:[2],
        steps: [8],
        state: "on",
        columns: 2,
        rows: 4,
        description: '正在跑试验SVP的车辆'
    },
    {
        id: 3,
        workshops:null,
        children:null,
        title: 'Einlauf&others',
        testtypes:[3],
        steps: [8],
        state: "on",
        columns: 2,
        rows: 4,
        description: '正在跑试验Einlauf&others的车辆'
    },
    {
        id: 4,
        workshops:null,
        children:null,
        title: 'Not running cars',
        testtypes:null,
        steps: [8],
        state: "off",
        columns: 4,
        rows: 4,
        description: '待试验车辆'
    },
    {
        id: 5,
        workshops:null,
        children:null,
        title: 'Pruefer',
        testtypes:null,
        steps: [6],
        state: "",
        columns: 2,
        rows: 4,
        description: '检查员正在检查的车辆'
    },
    {
        id: 6,
        workshops:null,
        children:null,
        title: 'Engineer',
        testtypes:null,
        steps: [4,15],
        state: "",
        columns: 2,
        rows: 4,
        description: '工程师正在处理的车辆，包括工程师检查、工程师招车等'
    },
    {
        id: 7,
        workshops:null,
        children:null,
        title: 'Tire change',
        testtypes:null,
        steps: [9],
        state: "",
        columns: 2,
        rows: 4,
        description: '正在换胎的车辆'
    },
    {
        id: 8,
        workshops:null,
        children:null,
        title: 'Brake change',
        testtypes:null,
        steps: [10],
        state: "",
        columns: 2,
        rows: 4,
        description: '正在换制动片的车辆'
    },
    {
        id: 9,
        workshops:null,
        children:null,
        title: 'Wartung',
        testtypes:null,
        steps: [3],
        state: "",
        columns: 4,
        rows: 4,
        description: '正在保养的车辆'
    },
    {
        id: 10,
        workshops:null,
        children:null,
        title: 'Support Team',
        testtypes:null,
        steps: [1,13,16],
        state: "",
        columns: 4,
        rows: 4,
        description: '支持组正在处理的车辆，包括试验前准备、试验后准备、支持组招车等'
    },
    {
        id: 11,
        workshops:null,
        children:[12,13,14,15,16],
        title: 'WORKSHOP',
        testtypes:null,
        steps: [],
        state: "",
        columns: 8,
        rows: 4,
        description: '所有正在车间组处理的车辆，包括装车、故障维修、拆解等'
    },
    {
        id: 12,
        workshops:[1],
        children:null,
        title: 'GroupA',
        testtypes:null,
        steps: [],
        state: "",
        columns: 3,
        rows: 12,
        description: '所有正在车间组GroupA中处理的车辆'
    },
    {
        id: 13,
        workshops:[2],
        children:null,
        title: 'GroupB',
        testtypes:null,
        steps: [],
        state: "",
        columns: 3,
        rows: 12,
        description: '所有正在车间组GroupB中处理的车辆'
    },
    {
        id: 14,
        workshops:[3],
        children:null,
        title: 'GroupC',
        testtypes:null,
        steps: [],
        state: "",
        columns: 2,
        rows: 12,
        description: '所有正在车间组GroupC中处理的车辆'
    },
    {
        id: 15,
        workshops:[4],
        children:null,
        title: 'GroupE',
        testtypes:null,
        steps: [],
        state: "",
        columns: 2,
        rows: 12,
        description: '所有正在车间组GroupE中处理的车辆'
    },
    {
        id: 16,
        workshops:[5],
        children:null,
        title: 'GroupK',
        testtypes:null,
        steps: [],
        state: "",
        columns: 2,
        rows: 12,
        description: '所有正在车间组GroupK中处理的车辆'
    }
];
