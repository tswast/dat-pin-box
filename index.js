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

var rootDir = process.argv[2]
if (!rootDir) {
  console.error('Run with: node index.js path/to/pins/root/')
  process.exit(1)
}
rootDir = path.resolve(rootDir)
pinsRepo = path.resolve(rootDir, 'pins')

Dat(pinsRepo, {key: process.env.DAT_PIN_ARCHIVE}, function (err, dat) {
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

fs.readFile(path.resolve(pinsRepo, 'pins.json'), 'utf8', function (err, data) {
  if (err) throw err;
  var pins = JSON.parse(data);
  pins['archives'].forEach(function (archive) {
    var url = parse(archive['url'])
    Dat(path.resolve(rootDir, archive['directory']), {key: url['host']}, function (err, dat) {
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
