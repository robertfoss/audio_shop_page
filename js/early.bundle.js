(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
    //var default_args = "-y -loglevel error -i "
    var default_args = "-y -i ";
    var split_name = file.name.split(".");
    var escaped_name = file.name.replace(" ", "\ ");

    var ext = split_name[1];
    util.ffmpegRunCommand(default_args + "\"" + file.name + "\" -vf vflip out." + ext,
                          file.name,
                          fileData);
  };
  util.displayFile(interact, file);
}
util.setupFileInput(interact, newFile);
util.setupCanvas(canvas);

},{"./util":2}],2:[function(require,module,exports){

exports.getImgDataID = function (id) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var img = document.getElementById(id);
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0 );
    return context.getImageData(0, 0, img.width, img.height);
};

exports.drawImgDataCanvas = function (canvas_id, img, x, y, w, h, offsetX, offsetY) {
    var canvas_ctx = document.getElementById(canvas_id).getContext('2d');
    if (arguments.length <= 2) {
        x = y = 0;
    }
    if (arguments.length <= 4) {
        w = canvas_ctx.canvas.width;
        h = canvas_ctx.canvas.height;
    }

    // Default offset is center
    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;

    // Keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    var iw = img.width,
        ih = img.height,
        r = Math.min(w / iw, h / ih),
        nw = iw * r,   // new prop. width
        nh = ih * r,   // new prop. height
        cx, cy, cw, ch, ar = 1;

    // Decide which gap to fill
    if (nw >= w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
    nw *= ar;
    nh *= ar;

    // Calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    if (x === "CENTER") {
      x = (cw - w) / 2;
    }

    if (y === "CENTER") {
      y = (ch - h) / 2;
    }

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // Make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    console.log("iw="+iw);
    console.log("ih="+ih);
    console.log("nw="+nw);
    console.log("nh="+nh);

    console.log("cx="+cx);
    console.log("cy="+cy);
    console.log("cw="+cw);
    console.log("ch="+ch);

    console.log("x="+x);
    console.log("y="+y);

    // Handle ImageData input
    if (img instanceof ImageData) {
        var img_canvas = document.createElement('canvas');
        img_canvas.width = iw;
        img_canvas.height = ih
        img_canvas.getContext("2d").putImageData(img, 0, 0);
        img = img_canvas;
    }

    // Fill image in dest. rectangle
    canvas_ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h);
};

exports.setAlert = function (type, title, msg) {
  if (!type || type === "") {
    type = "primary";
  }
  var alert_html = "" +
    "<div class='alert alert-" + type + " alert-dismissible fade show hide' role='alert' id='alert' style=''>" +
    "  <strong>" + title + "</strong> " + msg +
    "  <button type='button' class='close' data-dismiss='alert' aria-label='Close'>" +
    "    <span aria-hidden='true'>&times;</span>" +
    "  </button>" +
    "</div>";
  $('#alert-container').append(alert_html);
};

exports.error = function error(str) {
  console.log("Error: " + str);
  exports.setAlert("danger", "Error", str);
};

exports.toDataURL = function encodeImageFileAsURL(element) {
  var file = element.files[0];
  var reader = new FileReader();
  reader.onloadend = function() {
    console.log('RESULT', reader.result)
  }
  reader.readAsDataURL(file);
};

/* Make div I/O div interactive */
exports.setupFileInput = function setupFileInput(interact, func) {
  function drop_handler(ev) {
    console.log("Drop");
    ev.preventDefault();
    // If dropped items aren't files, reject them
    var dt = ev.dataTransfer;

    if (dt && dt.items) {
      // Use DataTransferItemList interface to access the file(s)
      /*
      for (var i=0; i < dt.items.length; i++) {
        if (dt.items[i].kind == "file") {
          var f = dt.items[i].getAsFile();
          console.log("... file[" + i + "].name = " + f.name);
        }
      }
      */
      if (dt.items[0].kind != "file") {
        console.log("Not a file");
        return;
      }
      file = dt.items[0].getAsFile();
    } else if (dt && dt.files) {
      // Use DataTransfer interface to access the file(s)
      /*
      for (var i=0; i < dt.files.length; i++) {
        console.log("... file[" + i + "].name = " + dt.files[i].name);
      }
      */
      if (dt.items[0].kind != "file") {
        console.log("Not a file");
        return;
      }
      file = dt.items[0].getAsFile();
    } else if (this.files) {
      file = this.files[0];
    }
    func(file);
  }

  function dragover_handler(ev) {
    console.log("dragOver");
    // Prevent default select and drag behavior
    ev.preventDefault();
  }

  function dragend_handler(ev) {
    console.log("dragEnd");
    // Remove all of the drag data
    var dt = ev.dataTransfer;
    if (dt.items) {
      // Use DataTransferItemList interface to remove the drag data
      for (var i = 0; i < dt.items.length; i++) {
        dt.items.remove(i);
      }
    } else {
      // Use DataTransfer interface to remove the drag data
      ev.dataTransfer.clearData();
    }
  }

  interact.ondrop=drop_handler;
  interact.ondragover=dragover_handler;
  interact.ondragend=dragend_handler;
  var input = document.createElement("input");
  input.id = "input";
  input.name = "input";
  input.type = "file";
  input.style = "display: none;";
  input.onchange=drop_handler;
  interact.parentElement.appendChild(input);
  $('#interact').on('click', function() {
      $("input").trigger('click');
  });
};

exports.displayFile = function displayFile(interact, file) {
  var upload = document.getElementById('upload');
  var img = document.getElementById('img');
  var video = document.getElementById('video');
  var ext = file.name.split('.').pop().toLowerCase();
  var fr = new FileReader();

  if (ext === "jpg" || ext === "jpeg" ||
      ext === "png" || ext == "gif") {
    console.log("Image displayed: " + file.name);
    fr.onload = function () {
      img.src = fr.result;
    }
    fr.readAsDataURL(file);
    img.style = "display: block; margin: auto;";
    upload.style.display = "inherit";
    video.style = "display: none;";
  } else {
    console.log("Video displayed: " + file.name);
    fr.onload = function () {
      video.src = fr.result;
    }
    fr.readAsDataURL(file);
    img.style.display = "none";
    upload.style.display = "inherit";
    video.style = "display: block; margin: auto;";
  }
}


exports.setupCanvas = function setupCanvas(interact, file) {
var tmp_img = new Image();
window.onresize = drawCanvas;
tmp_img.onload = drawCanvas;

function drawCanvas() {
    canvas.width  = canvas.offsetWidth;
    canvas.style.height = canvas.width * 0.7;
    canvas.offsetHeight = canvas.width * 0.7;
    canvas.height = canvas.width * 0.7;
    console.log("canvas.width=" + canvas.width);
    console.log("canvas.offsetWidth=" + canvas.offsetWidth);
    console.log("canvas.style.width=" + canvas.style.width);
    console.log("canvas.width=" + canvas.height);
    console.log("canvas.offsetWidth=" + canvas.offsetHeight);
    console.log("canvas.style.width=" + canvas.style.height);
    exports.drawImgDataCanvas('canvas', tmp_img);
}
tmp_img.src = "images/upload.svg";
};

exports.showOutput = function showOutput(file) {
  console.log("showOutput() file.name", file.name);
  console.log("showOutput() file.data", file.data);
  var blob = new Blob([file.data]);
  var src = window.URL.createObjectURL(blob);
  console.log("blob: ", blob);
  var img = document.getElementById('img');
  console.log("setting img.src to: ", src);
  img.src = src;
  /*
  if (file.name.match(/\.jpeg|\.gif|\.jpg|\.png/)) {
    var blob = new Blob([file.data]);
    var src = window.URL.createObjectURL(blob);
    var img = document.createElement('img');
    img.src = src;
    return img;
  } else {
    var a = document.createElement('a');
    a.download = file.name;
    var blob = new Blob([file.data]);
    var src = window.URL.createObjectURL(blob);
    a.href = src;
    a.textContent = 'Click here to download ' + file.name + "!";
    return a;
  }
  */
}

exports.parseArguments = function parseArguments(text) {
  text = text.replace(/\s+/g, ' ');
  var args = [];
  // Allow double quotes to not split args.
  text.split('"').forEach(function(t, i) {
    t = t.trim();
    if ((i % 2) === 1) {
      args.push(t);
    } else {
      args = args.concat(t.split(" "));
    }
  });
  return args;
}

exports.ffmpegIsSupported = function ffmpegIsSupported() {
  return document.querySelector && window.URL && window.Worker;
};

exports.ffmpegWorkerOnMessage = function ffmpegWorkerOnMessage(event) {
  var message = event.data;
  if (message.type == "ready") {
    exports.setAlert("success", "ffmpeg:", " Ready!");
  } else if (message.type == "stdout") {
    exports.setAlert("primary", "stdout", message.data);
  } else if (message.type == "stderr") {
    exports.setAlert("danger", "stderr", message.data);
  } else if (message.type == "start") {
    exports.setAlert("primary", "ffmpeg", message.data);
  } else if (message.type == "exit") {
    exports.ffmpegWorker.terminate();
  } else if (message.type == "done") {
    exports.setAlert("success", "ffmpeg:", " Finished operation in " + message.time + "ms");
    var buffers = message.data;
    if (!buffers.length) {
      console.log("ffmpegWorkerOnMessage() !buffers.length");
      return;
    }
    buffers.forEach(function(file) {
      exports.showOutput(file);
    });
  }
};

exports.ffmpegRunCommand = function ffmpegRunCommand(arg, inputFile, inputData) {
  console.log("ffmpegInitWorker()");
  if (!exports.ffmpegIsSupported()) {
    exports.error("Unable to start ffmpeg");
  }
  exports.ffmpegWorker = new Worker("js/worker-asm.js");
  exports.ffmpegWorker.onmessage = exports.ffmpegWorkerOnMessage;
  var args = exports.parseArguments(arg);

  console.log("ffmpeg: " + arg);
  console.log("inputFile:", inputFile);
  console.log("inputData:", inputData);

  exports.ffmpegWorker.postMessage({
    type: 'run',
    arguments: args,
    files: [
      {
        "name": inputFile,
        "data": inputData
      }
    ]
  });
}

},{}]},{},[1]);
