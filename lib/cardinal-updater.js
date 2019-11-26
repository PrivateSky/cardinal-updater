function processUpdateCommand(args){
 console.log(`Received update command with arguments ", ${args}`);
}
try{
 processUpdateCommand(process.argv);
}
catch (e) {
 console.error(e);
}