var allLocations = [
    {id: 0, name: 'Ponte 25 de Abril'},
    {id: 1, name: 'Basílica da Estrela'},
    {id: 2, name: 'Torre de Belém'},
    {id: 3, name: 'Casa Fernando Pessoa'},
    {id: 4, name: 'Palácio Nacional da Ajuda'},
    {id: 5, name: 'Planetário Calouste Goulbekian'},
    {id: 6, name: 'Centro Cultural de Belém'},
    {id: 7, name: 'Museu Nacional dos Coches'},
    {id: 8, name: 'Cordoaria Nacional'},
    {id: 9, name: 'LxFactory'}
];

ko.utils.stringContains = function (string, filter) {        	
    string = string || "";
    if (filter.length > string.length)
        return false;
    return string.includes(filter);
};

var AppViewModel = function() {
    var self = this;

    self.setList = function() {
        self.currentList = ko.computed(function() {
            if(self.filter() === '') {
                return self.allLocations();
            } else {
                return ko.utils.arrayFilter(self.allLocations(), function(item) {
                    return ko.utils.stringContains(item.name.toLowerCase(), self.filter().toLowerCase());
                });
            }
        });
    };

    self.allLocations = ko.observableArray(allLocations);
    self.filter = ko.observable('');
    self.setList();
    
};

ko.applyBindings(new AppViewModel());