var app = getApp();
var core = app.requirejs('core');
module.exports.getAreas = function(callback){

    core.get('shop/get_areas',{}, function(ret){
 

        var provinces =[];
        
        for(var i in  ret.areas.province){
            if(i==0){
                continue;
            }
            var province_name =ret.areas.province[i]['@attributes']['name'];
            //provinces.push( province_name);
            
            var citys = [];
            for(var j in ret.areas.province[i].city){
               if(j==0){
                 continue;
               }
               var countys = [];
               var city_name =ret.areas.province[i].city[j]['name'];
               for(var k in ret.areas.province[i].city[j].county){
                     if( ret.areas.province[i].city[j].county[k].hasOwnProperty('@attributes')){
                          var county_name =ret.areas.province[i].city[j].county[k]['@attributes']['name'];
                      } else{
                          var county_name =ret.areas.province[i].city[j].county[k]['name'];
                      }
                      countys.push(county_name );
               }
               citys.push( { city_name : countys });
            }

            provinces.push({ province_name : citys});
 

        }
        if(typeof(callback)==='function'){
            callback(ret.areas);
        }

    })

}