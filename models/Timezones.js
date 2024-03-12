const {
    Schema,
    model
} = require("mongoose"); 

const Timezone = new Schema({
    prefix: {type: String, require}, 
    operator: {type: String, require}, 
    region: {type: String, require},
    time_zone: {type: String, require},  
    time_zone_GMT: {type: String, require}, 
    country: {type: String, require}
})

module.exports = model("timezone_prefixes", Timezone); 

