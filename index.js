// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var fs = require('fs')
var path = require('path')
var mirror = require('mirror-folder')
var Dat = require('dat-node')
var parse = require('parse-dat-url')

// var key = process.argv[2]
// if (!key) {
//   console.error('Run with: node examples/download.js <key>')
//   process.exit(1)
// }

var rootDir = '/Users/tswast/src/dat-pin-box/pins/'

Dat(rootDir + 'pins/', {key: process.env.DAT_PIN_ARCHIVE}, function (err, dat) {
  if (err) throw err

  dat.joinNetwork(function (err) {
    if (err) throw err

    // After the first round of network checks, the callback is called
    // If no one is online, you can exit and let the user know.
    if (!dat.network.connected || !dat.network.connecting) {
      console.error('No users currently online for pin key.')
      // process.exit(1)
    }
  })
  console.log('Downloading: pin archive')
})

fs.readFile(rootDir + 'pins/pins.json', 'utf8', function (err, data) {
  if (err) throw err;
  var pins = JSON.parse(data);
  pins['archives'].forEach(function (archive) {
    var url = parse(archive['url'])
    Dat(rootDir + archive['directory'] + '/', {key: url['host']}, function (err, dat) {
      if (err) throw err

      dat.joinNetwork(function (err) {
        if (err) throw err
        if (!dat.network.connected || !dat.network.connecting) {
          console.error('No users currently online for ' + archive['directory'] + ' key.')
          // process.exit(1)
        }
      })
      console.log(`Downloading: ${archive['directory']}\n`)
    })
  })
});
