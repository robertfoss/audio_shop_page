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

exports.setAlert = function (str) {
  var alert = document.getElementById('alert');
  alert.style.visibility = "visible";
  alert.innerHtml = str;
};

exports.error = function (str) {
  console.log("Error: " + str);
  exports.setAlert(str);
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
    console.log("Drop 1");
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
      console.log("Drop 2");
      if (dt.items[0].kind != "file") {
        console.log("Not a file");
        return;
      }
      console.log("Drop 3");
      file = dt.items[0].getAsFile();
    } else if (dt && dt.files) {
      console.log("Drop 4");
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
      console.log("Drop 5");
      file = dt.items[0].getAsFile();
    } else if (this.files) {
      console.log("Drop 6");
      file = this.files[0];
    }
    console.log("Drop 7");
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
    video.style = "display: none;";
    img.style = "";
  } else {
    console.log("Video displayed: " + file.name);
    fr.onload = function () {
      video.src = fr.result;
    }
    fr.readAsDataURL(file);
    img.src = "images/upload.svg";
    img.style = "padding-top: 1.5em; padding-bottom: 1em; padding-left: 35%; padding-right: 35%";
    video.style = "";
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
