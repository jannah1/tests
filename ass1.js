const fs = require('fs');
files = ["edge-chromium.json","safari.json","chrome.json"];
var results= {};
var resultkeys=[];
var processing = true;
const readJsonFile = (fileName) => {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName,
    function(err, data) { 
        if (err) { 
            reject(err);
            return;
        }
         resolve(processJson(JSON.parse(data.toString('utf8').replace(/'/g,"\""))));
    })
  })
};
if(!fs.existsSync('results'))
        fs.mkdirSync('results');
prms = [];
   for(i=0;i<files.length;i++){
         prms[i] = Promise.resolve(readJsonFile(files[i]));
   }
   Promise.all(prms).then(() => { finalizeResults() });
function finalizeResults(){
    for(i=0;i<resultkeys.length;i++){
         results[resultkeys[i]].failed = results[resultkeys[i]].total - results[resultkeys[i]].passed; 
         d = new Date();          
	fs.writeFile( 'results/'+resultkeys[i]+"_"+d.toISOString()+'.json', JSON.stringify(results[resultkeys[i]],null,2) , function (err) {
  		if (err) throw err;
  	console.log('Done writing .json file'+' !');
	}); 
     }   
}
function processJson(data){  
    for(let i=0;i<data["fixtures"].length;i++){
            if(!results[data.fixtures[i].meta.feature]){		
            results[data.fixtures[i].meta.feature] = { "passed": 0, "total": 0, "failed": 0, "skipped": 0 , "name": data.fixtures[0].meta.feature, "tests": []};
	    resultkeys.push(data.fixtures[i].meta.feature);
        }
            results[data.fixtures[i].meta.feature].passed += data.passed; 
            results[data.fixtures[i].meta.feature].failed += data.failed;
            results[data.fixtures[i].meta.feature].skipped += data.skipped;
            results[data.fixtures[i].meta.feature].total += data.total;
            data.fixtures[i].tests.forEach(element => results[data.fixtures[i].meta.feature].tests.push(element));
        }
}
