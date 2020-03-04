const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
const port = process.env.PORT || 3000;
const exphbs = require('express-handlebars')
const request = require('request-promise');

const commonQuery = {
    method: 'GET',
    uri: 'https://api.openbrewerydb.org/breweries'
}

app.engine('.hbs', exphbs({
    defaultLayout: 'index',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views')
}));

app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

class Brewery {
    constructor(id, name, brewery_type, street, city, state, postal_code, country, longitude, latitude, phone, website_url, updated_at, tag_list) {
        this.id = id;
        this.name = name;
        this.brewery_type = brewery_type;
        this.street = street;
        this.city = city;
        this.state = state;
        this.postal_code = postal_code;
        this.country = country;
        this.longitude = longitude;
        this.latitude = latitude;
        this.phone = phone;
        this.website_url = website_url;
        this.updated_at = updated_at;
        this.tag_list = tag_list;
    }
    
    getFullAddress() {
        return '' + this.postal_code + '<br />' + this.country + '<br />' + this.state + '<br />' + this.city + '<br />' + this.street;
    }
}

app.get('/', (req, res, next) => {
    request(commonQuery)
        .then((data) => {
            data = JSON.parse(data);
            let objectsOfBrewery = [];
            let addressesOfBewery = {};
            let filteredBrewery = [];
            let breweryAddressesHTML = '<tr><th>State</th><th>Adress</th></tr>';
            let filteredBreweryHTML = '<tr><th>id</th><th>name</th><th>full address</th><th>phone</th><th>website</th></tr>';

            for(let i = 0; i < data.length; i++){
                objectsOfBrewery[i] = new Brewery(data[i].id, data[i].name, data[i].brewery_type, data[i].street, data[i].city, data[i].state, data[i].postal_code, data[i].country, data[i].longitude, data[i].latitude, data[i].phone, data[i].website_url, data[i].updated_at, data[i].tag_list);
            }

            console.log('Objects of Brewery created: ', objectsOfBrewery);

            for(let i = 0; i < objectsOfBrewery.length; i++){
                if(!addressesOfBewery[objectsOfBrewery[i].state]){
                    addressesOfBewery[objectsOfBrewery[i].state] = [objectsOfBrewery[i].getFullAddress()];
                }
                else {
                    addressesOfBewery[objectsOfBrewery[i].state].push(objectsOfBrewery[i].getFullAddress());
                }

            }

            console.log('Object with adresses of Brewery created: ', addressesOfBewery);

            for(let i = 0; i < objectsOfBrewery.length; i++){
                if(objectsOfBrewery[i].brewery_type !== 'micro'){
                    filteredBrewery.push(objectsOfBrewery[i]);
                }
            }

            console.log('Filtered array of Brewery objects created: ', filteredBrewery);

            for(state in addressesOfBewery){
                breweryAddressesHTML += '<tr><td rowspan=\"' + addressesOfBewery[state].length + '\">' + state + '</td>';
                addressesOfBewery[state].forEach((item, index, array) => {
                    if(index === 0){
                        breweryAddressesHTML += '<td>' + item + '</td></tr>';
                    }
                    else {
                        breweryAddressesHTML += '<tr><td>' + item + '</td></tr>';
                    }
                });
            }

            filteredBrewery.forEach((item, index, array) => {
                filteredBreweryHTML += '<tr><td>' + item.id + '</td><td>' + item.name + '</td><td>' + item.getFullAddress() + '</td><td>' + item.phone + '</td><td>' + item.website_url + '</td></tr>'
            });

            res.render('index', {
                breweryAddresses: breweryAddressesHTML,
                filteredBrewery: filteredBreweryHTML
            });
        })
        .catch((err) => {
            console.log(err);
            res.send('Error');
        })
});




server.listen(port, () => {
    console.log('Server listening at port %d', port);
  });