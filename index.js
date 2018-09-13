// Copyright 2018 The Pin Box Authors
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

async function main() {
  const url = new URL(import.meta.url)
  const pinUrl = url.hash.substring(1)

  const pinsRepo = await DatArchive.load(pinUrl)
  await pinsRepo.download('/')
  const buf = await pinsRepo.readFile('/pins.json')
  const pins = JSON.parse(buf)['archives']

  for (let pinned of pins) {
    const pinnedUrl = pinned.url
    await seed(pinnedUrl)
  }
}

// TODO: refactor follow-seeder so that we can reuse the "seed these paths on
//       this dat repo" logic here See: https://github.com/RangerMauve/follow-seeder
async function seed(url) {
  console.log(`Seeding ${url}`);
  try {
    const pinnedArchive = await DatArchive.load(url)
    try {
      await pinnedArchive.download('/');

    } catch(e) {
      console.error(`Unable to seed ${url}: ${e}`);
    }
  } catch (e) {
    console.error(e);
  }
}

main()
  .then(v => console.log(v))
  .catch(err => console.error(err))
