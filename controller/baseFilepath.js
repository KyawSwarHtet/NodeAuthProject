const path = require("path");

// var fileDetail = "react-app/testserver.js";
var fileDetail = __dirname;
// var filePathReq = "myanfobasefull/react-app/client/public/images";

const pathMain = path.dirname(fileDetail);
// const pathMain = path.basename(filePathReq);
console.log("file path is ", pathMain);

module.exports = pathMain;
