const fs = require('fs');
const util = require('util');
const _ = require('lodash');

const readFile = util.promisify(fs.readFile);
const EARTH_RADIUS = 6371.01

class InviteCustomer {
    
    constructor(baseLat, baseLng){
        this.baseLat = baseLat;
        this.baseLng = baseLng;
    }

    degreesToRadians(value) {
        if (!_.isNumber(value)) {
          throw new Error('Not a valid number');
        }
        
        return value * (Math.PI / 180);
      };

      distance(lat, lon) {
          var lat1 = this.degreesToRadians(this.baseLat),
          lat2 = this.degreesToRadians(lat),
          lon1 = this.degreesToRadians(this.baseLng),
          lon2 = this.degreesToRadians(lon);
          
        return Math.acos(Math.sin(lat1) * Math.sin(lat2) + 
          Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)) * EARTH_RADIUS;
      };

      async readCustomerFile(list) {
        var data = await readFile(list);
        var dataObj = JSON.parse(data);
        return dataObj;
      };
    
      async customerInvitationList(file) {
          var data = await this.readCustomerFile(file);
          var list = _.chain(data)
            .sortBy('user_id')
            .map(obj => {
              if (this.distance(parseInt(obj.latitude,10), parseInt(obj.longitude, 10)) <= 100) {
                return {
                  user_id: obj.user_id,
                  name: obj.name
                };
              }
            })
            .compact()
            .value();
            
          return list;
      };
}

var invitations = new InviteCustomer(53.339428, -6.257664);
invitations.customerInvitationList('customers.txt')
.then(data => console.log(data));