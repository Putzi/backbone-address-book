Parse.initialize("jYSgqLNNUdEIsTR5V1VFKqwnK2CZYxbjH7f1acy5", "hopbwRHXlpV9uQPHEZ6QSBZRb84r3k56qVW0lnLE");

var Person = Parse.Object.extend({
    className: 'Person',

    defaults: {
        firstName: 'No name',
        lastName: 'No surname',
        email: 'test@example.com'
    }
});

var PersonView = Parse.View.extend({
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
        this.model.on('change', this.render, this);
        this.model.on('destroy', this.remove, this);
    },

    select: function() {
        this.$el.parent().find('li').removeClass('active');
        this.$el.addClass('active');
    }
});

var PersonCardView = Parse.View.extend({
    template: _.template($('#person-card-template').html()),
    className: 'well span4',
    events: {
        'click button': 'removePerson'
    },

    initialize: function() {
        this.model.on('change', this.render, this);
        this.model.on('destroy', this.remove, this);
    },

    render: function() {
        this.$el.html(this.template(this.model.attributes));
        return this;
    },

    removePerson: function() {
        this.model.destroy();
    }
});

var AddPersonView = Parse.View.extend({
    template: _.template($('#person-add-template').html()),

    events: {
        'click button': 'addPerson'
    },

    render: function() {
        this.$el.html(this.template());
        return this;
    },

    addPerson: function(event) {
        event.preventDefault();
        var p = new Person();
        p.save({
            firstName: this.$el.find('[name=firstName]').val(),
            lastName: this.$el.find('[name=lastName]').val(),
            email: this.$el.find('[name=email]').val(),
            phone: this.$el.find('[name=phone]').val()
        }, {
            success: function() {
                personList.add(p);
                router.navigate('#/show/' + p.objectId, true);
            }
        });

    }
});

var PersonList = Parse.Collection.extend({
    model: Person
});

var PersonListView = Parse.View.extend({
    tagName: 'ul',

    className: 'nav nav-tabs nav-stacked',

    initialize: function() {
        this.collection.on('add', this.addOne, this);
        this.collection.on('reset', this.addAll, this);
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

var ToolbarView = Parse.View.extend({
    className: 'navbar',

    events: {
        'keyup input[name=search]': 'search'
    },

    template: _.template($('#toolbar-template').html()),

    render: function() {
        this.$el.html(this.template());
        return this;
    },

    search: function(event) {
        var that = this;
        if(!this.timeout) {
            this.timeout = setTimeout(function() {
                var value = $(event.target).val();
                var q1 = new Parse.Query(Person);
                q1.contains('firstName', value);
                var q2 = new Parse.Query(Person);
                q2.contains('lastName', value);
                personList.query = Parse.Query.or(q1, q2);
                personList.fetch();
                that.timeout = null;
            }, 500);
        }
    }
});


var defaultQuery = new Parse.Query(Person);
defaultQuery.ascending('lastName');

var personList = new PersonList();
personList.query = defaultQuery;

var Router = Parse.Router.extend({
    routes: {
        '': 'index',
        'show/:id': 'show',
        'add': 'add'
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
    },

    add: function() {
        var v = new AddPersonView();
        $('#card-view').html('');
        $('#card-view').append(v.render().el);
    }
});

var personListView = new PersonListView({collection: personList});
var toolbarView = new ToolbarView();
$('#list-view').html('');
$('#list-view').append(personListView.render().$el);
$('#toolbar').append(toolbarView.render().el);
var router = new Router();
personList.fetch({
    success: function() {
        Parse.history.start();
    }
});

