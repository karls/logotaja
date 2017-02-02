// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const sharp = require('sharp');
const _ = require('underscore');
const path = require('path');
const url = require('url');
const appVersion = require('electron').remote.app.getVersion();

const version = "0.1";

var imageSelector = document.querySelector("#image-selector");
var convertButton = document.querySelector("#convert-button");
var statusText = document.querySelector("#status-text");
var loader = document.querySelector("#loader");

var layers = {'logo-landscape': __dirname + '/assets/images/logo-landscape.png',
              'logo-portrait': __dirname + '/assets/images/logo-portrait.png'};

console.log(layers);

var converted = 0;
var files = [];
var images = [];

function updateStatus (status) {
  statusText.innerText = status;
};

function handleFileSelection () {
  converted = 0;
  files = imageSelector.files;
  console.log(files);
  if (files.length == 0) {
    convertButton.disabled = true;
    updateStatus("Vali logotamiseks mõned pildid.");
  } else if (files.length == 1) {
    convertButton.disabled = false;
    updateStatus("1 pilt logotamiseks valitud.");
  } else {
    convertButton.disabled = false;
    updateStatus(files.length + " pilti logotamiseks valitud.");
  }
};

function pasteLogo (image) {
  image.metadata().then(function(metadata) {
    console.log(metadata);
    if (metadata.width > metadata.height) {
      return image.overlayWith(layers['logo-landscape'], {top: 0, left: 750});
    } else {
      return image.overlayWith(layers['logo-portrait'], {top: 0, left: 468});
    }
  }).then(function (i) {
    return i;
  });
};

function writeImage(imageInfo) {
  var p = imageInfo[0];
  var image = imageInfo[1];
  var ext = path.extname(p);
  var dir = path.dirname(p);
  var base = path.basename(imageInfo[0], ext);
  var to = path.join(dir, base + "-logo") + ext;
  return image.jpeg({quality: 100}).webp({quality: 100}).tiff({quality: 100}).toFile(to);
};

function convertImages () {
  if (_.isEmpty(files)) {
    updateStatus("Vali logotamiseks mõned pildid.");
    return;
  }

  toggleProgressSpinner();
  convertButton.disabled = true;
  // images = _.map(files, function (f) { return [f.path, sharp(f.path)]; });
  // images = _.map(images, function(i) { return [i[0], pasteLogo(i[1])]; });
  // console.log(images);
  // var processes = _.map(images, writeImage);
  var processes = _.map(files, process);
  Promise.all(processes).then(function (values) {
    updateStatus(values.length + " pilti logotatud!");
    toggleProgressSpinner();
  }, function (reason) {
       console.log(reason);
       updateStatus("Midagi läks valesti. Mõni pilt jäi logotamata!");
       toggleProgressSpinner();
     });
};

function process(file) {
  var filePath = file.path;
  const image = sharp(filePath);

  image.metadata().then(function(metadata) {
    console.log(filePath, metadata);
    if (metadata.width > metadata.height) {
      return image.overlayWith(layers['logo-landscape'], {top: 0, left: 750});
    } else {
      return image.overlayWith(layers['logo-portrait'], {top: 0, left: 468});
    }
  }).then(function(newImage) {
    var ext = path.extname(filePath);
    var dir = path.dirname(filePath);
    var base = path.basename(filePath, ext);
    var to = path.join(dir, base + "-logo") + ext;
    return newImage.
      jpeg({quality: 100}).
      webp({quality: 100}).
      tiff({quality: 100}).
      toFile(to);
  });
};

function toggleProgressSpinner () {
  statusText.classList.toggle("is-hidden");
  loader.classList.toggle("is-hidden");
};

imageSelector.onchange = handleFileSelection;
convertButton.onclick = convertImages;

var title = document.getElementsByTagName("title")[0];
title.innerText = "Logotaja ver. " + appVersion;
