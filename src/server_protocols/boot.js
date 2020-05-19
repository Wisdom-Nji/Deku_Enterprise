/*
##### Server Protocols:
###### Booting [SP1]:
1. __Checks custom configuration files__ __[SP2]__ __[EP1]__ __[ FP1 ]__
    * If files are absent __[SP2]__
      * It complains and exits __[EP2]__
    * If files are present but incomplete or invalid 
      * It complains and exists __[EP2]__
*/


/*
 * This method should be not implemented by default because the configurations are required to run
 * Should rather use the --r (--require) default options in nodejs to load this file in
*/
/*
const envFileReader = require('dotenv');

var filePath_sysConfig = // TODO: Read this as terminal argument

// This loads the configurations into the process object 
// Output becomes accessible via (process.env)

envFileReader.config({ path : filePath_sysConfig.toString() })
*/

// Boot should check if passed in configurations match enough details for server to startup


function view() {
	console.log(process.env);
}


// Exported modules
module.exports = view
