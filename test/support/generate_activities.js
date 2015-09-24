var exec = require('child_process').exec;

/**
 * Generates a random activity
 * @param start_date start date range
 * @param end_date end date range
 * @param max_version max version used in the generated activity
 * @param model_names model names to be used in the generated activity
 * @returns {{entry_date: Date, api_version: string, action_name: string, model_name: *, api_consumer_ip: string, api_consumer_user_agent: string, response_time: number, api_communication_payload_size: number}}
 */
function create_random_activity(start_date, end_date, max_version, model_names){
    var action_names = ["CREATE","UPDATE","DELETE","READ","SIGN_IN","SIGN_OUT"];

    var _random_entry_date                     = new Date(start_date.getTime() + Math.random() * (end_date.getTime() - start_date.getTime()));
    var _random_api_version                    = "v" + Math.ceil(Math.random()*max_version);
    var _random_action_name                    = action_names[Math.floor(Math.random()*6)];
    var _random_model_name                     = model_names[Math.floor(Math.random()*(model_names.length - 1))];
    var _random_api_consumer_ip                = '127.0.0.1';
    var _random_api_consumer_user_agent        = 'Mozilla';
    var _random_response_time                  = Math.floor(Math.random()*300 + 50);
    var _random_api_communication_payload_size = Math.floor(Math.random()*1500 + 300);

    return {
        "entry_date": _random_entry_date,
        "api_version": _random_api_version,
        "action_name": _random_action_name,
        "model_name": _random_model_name,
        "api_consumer_ip": _random_api_consumer_ip,
        "api_consumer_user_agent": _random_api_consumer_user_agent,
        "response_time": _random_response_time,
        "api_communication_payload_size": _random_api_communication_payload_size
    }
}

/**
 * Generates a N number of activities.
 * Usage:
 * npm start <TOTAL_ACTIVITIES> <END_YEAR> <END_MONTH> <END_DAY> <MAX_VERSION> [MODELS..]
 *
 * In example: node generate_activities 1000 2016 05 10 1 employees
 *
 * where:
 *
 * TOTAL_ACTIVITIES -> the number of activities to be generated
 * END_YEAR -> Maximum year to be used in generated activities
 * END_MONTH -> Maximum month to be used in generated activities
 * END_DAY -> Maximum day to be used in generated activities
 * MAX_VERSION -> Max version to be used in generated activities (in example, 4)
 * MODELS -> Comma separated model names
 */
function generate_activities(){
    var models = [];
    var params = process.argv;
    var end_year = parseInt(params[3]);
    var end_month = parseInt(params[4]);
    var end_day = parseInt(params[5]);
    var max_version = parseInt(params[6]);

    for(var j = 7; j < params.length; j++){
        models.push(params[j]);
    }

    for(var i = 0; i < params[2]; i++){
        var activity = create_random_activity(new Date(end_year, end_month, end_day), new Date(), max_version, models);
        console.log(JSON.stringify(activity));
        var args = " -d '"+JSON.stringify(activity)+"' -H 'Content-Type: application/json' http://localhost:1337/api/activity";
        exec('curl' + args, function (error) {
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });
    }
}

generate_activities();
