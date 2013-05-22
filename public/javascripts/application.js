var Person = Backbone.Model.extend({
    urlRoot: '/person',

    idAttribute: '_id',

    defaults: {
        firstName: 'No name',
        lastName: 'No surname',
        email: 'test@example.com'
    }
});

var PersonView = Backbone.View.extend({
    tagName: 'li',

    template: _.template($('#person-template').html()),

    events: {
        'click a': 'select'
    },

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize: function() {
        this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.model, 'destroy', this.remove);
    },

    select: function() {
        this.$el.parent().find('li').removeClass('active');
        this.$el.addClass('active');
    }
});

var PersonCardView = Backbone.View.extend({
    template: _.template($('#person-card-template').html()),
    className: 'well span4',
    events: {
        'click button': 'removePerson'
    },

    initialize: function() {
        this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.model, 'destroy', this.remove);
    },

    render: function() {
        this.$el.html(this.template(this.model.attributes));
        return this;
    },

    removePerson: function() {
        this.model.destroy();
    }
});

var PersonList = Backbone.Collection.extend({
    url: '/person',
    model: Person
});

var PersonListView = Backbone.View.extend({
    tagName: 'ul',

    className: 'nav nav-tabs nav-stacked',

    initialize: function() {
        this.listenTo(this.collection, 'add', this.addOne, this);
        this.listenTo(this.collection, 'reset', this.addAll, this);
    },

    render: function(){
        this.addAll();
        return this;
    },

    addOne: function(person) {
        var v = new PersonView({model: person});
        this.$el.append(v.render().el);
    },

    addAll: function() {
        this.$el.html('');
        this.collection.forEach(this.addOne, this);
    }
});

var personList = new PersonList();

var Router = Backbone.Router.extend({
    routes: {
        '': 'index',
        'show/:id': 'show'
    },

    index: function() {
        $('#card-view').html('');
    },

    show: function(id) {
        var person = personList.get(id);
        if(person) {
        var v = new PersonCardView({model: person});
        $('#card-view').html('');
        $('#card-view').append(v.render().el);
        } else {
            router.navigate('', true);
        }
    }
});

var personListView = new PersonListView({collection: personList});

$('#list-view').html('');
$('#list-view').append(personListView.render().$el);
var router = new Router();
personList.fetch({
    success: function() {
        Backbone.history.start();
    }
});

