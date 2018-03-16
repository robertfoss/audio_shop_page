var util = require('./util');


var canvas = document.getElementById('canvas');
var interact = document.getElementById('interact');
var img = document.getElementById('img');
var inputFile;
var inputData;

function newFile(file) {
  var bufferReader = new FileReader();
  bufferReader.readAsArrayBuffer(file);
  bufferReader.onload = function() {
    var arrayBuffer = bufferReader.result
    fileData = new Uint8Array(arrayBuffer);
    console.log(fileData);

    var split_name = file.name.split(".");
    var ext = split_name[1];

    //var default_args = "-y -loglevel error -i "
    var default_args = "-y -i ";
    util.ffmpegRunCommand(default_args + "\"" + file.name + "\" -vf vflip out." + ext,
                          file.name,
                          fileData);
  };
  util.displayFile(interact, file);
}
util.setupFileInput(interact, newFile);
util.setupCanvas(canvas);
