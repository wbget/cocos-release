#!/usr/bin/env node

const OSS = require('ali-oss');
const path = require('path');
const fs = require('fs');
const { prompt } = require('enquirer');

const configPath = process.argv[2];
if (!configPath) {
  console.error('ERROR: 需要指定配置');
  process.exit(-1);
}
const from = path.resolve(process.cwd(), configPath);
const config = JSON.parse(fs.readFileSync(from).toString('utf8'));

const client = new OSS(config);
const upload = async (name, buffer) =>
  await new Promise((resolve, reject) => {
    // resolve();
    // return;
    client
      .put(name, buffer, {
        headers: { 'Cache-Control': 'no-cache' },
      })
      .then(result => {
        if (result) {
          resolve();
        } else {
          reject();
        }
      });
  });

const main = (version, tag) => {
  const name = path.join(config.remoteRoot, version).replace(/\\/g, '/');
  upload(name, Buffer.from(JSON.stringify({ version: tag })))
    .then(() => {
      console.log('Success');
    })
    .catch(() => {
      console.log('Fail');
    });
};
(async () => {
  const response = await prompt([
    {
      type: 'input',
      name: 'version',
      message: 'Version',
    },
    {
      type: 'input',
      name: 'tag',
      message: 'Tag',
    },
  ]);
  const version = response.version;
  const tag = response.tag;

  if (!version) {
    console.error('ERROR: 需要指定版本号');
    process.exit(-1);
  }
  if (!tag) {
    console.error('ERROR: 需要指定版本标签');
    process.exit(-1);
  }
  main(version, tag);
})();
