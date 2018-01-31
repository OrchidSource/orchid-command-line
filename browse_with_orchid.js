
/**
 * Command-line script to launch a browser using Orchid.
 * TODO: Most of this code is just copy-and-pasted from index.js; all of that should
 * be refactored into a single module.
 */

var orchid = {
  core: require('@orchidprotocol/core'),
  vpn: require('@orchidprotocol/service-vpn')
};
const {spawn} = require('child_process');

let logizomai = require('logizomai');
let using = logizomai.using;

const port = 1323;

process.on('uncaughtException', function(error) {
  console.log("GOT ERROR: ", error);
});

var sfo_seeds = ['orchid://0@104.131.141.48:3200/0/NGgM-Dvy7LQ-RO7oSr2iRaskwnxbdUal8OHI-vTTv0k', /* ALPHA-SFO-1 */
  'orchid://0@165.227.9.47:3200/0/mza4QadI_d7XchB5CW2rIe9YjEEcInBHZNl5-vPcCBY', /* ALPHA-SFO-2 */
  'orchid://0@165.227.13.29:3200/0/lG1Qx-DpNKdYLQ9l2otkBf-DsKvYkwXo72O-6foQXB8', /* ALPHA-SFO-3 */
  'orchid://0@165.227.11.29:3200/0/_S8mCK7E47_Kri7zK68Bd7vg6SzRWpkNme1v_qxS4GA' /* ALPHA-SFO-4 */
];

var nyc_seeds = ['orchid://0@159.203.81.5:3200/0/R6x45CN-OlJVKv4srEcbq9MAM6GulXsXw1QHxxzH90w']; /* ALPHA-NYC-1 */
var ams_seeds = ['orchid://0@188.166.87.162:3200/0/LlSjBhzmScTiaYynTCGMV8iCXUJDgvp7WwvgnlTFkBY']; /* ALPHA-AMS-1 */

var de_seeds = ['orchid://0@46.101.188.244:3200/0/aflY86Krju0pLdrKxBDtQS8Wshf3Uc1QY5oXglurUhg']; /* ALPHA-FRA-1 */
var sng_seeds = ['orchid://0@128.199.214.165:3200/0/lcMM3Blomj6Thyiy36cqdxm1zP1qghMZyWsxByhnBFo']; /* ALPHA-SNG-1 */
var hkg_seeds = ['orchid://0@180.235.133.148:3200/0/OrZ358LCmMTLPI5R4j7G9TLFdyZGc5HT4WgSubzOdHE']; /* ALPHA-HKG-1 */

var us_seeds = sfo_seeds.concat(nyc_seeds);
var eu_seeds = ams_seeds.concat(de_seeds);
var cn_seeds = sng_seeds.concat(hkg_seeds);

var all_seeds = (us_seeds).concat(eu_seeds).concat(cn_seeds);
var all_but_sf = nyc_seeds.concat(eu_seeds).concat(cn_seeds);

var virtuals = [];

function start_orchid_network(desired_exit_location) {
  var choices = all_but_sf;

  if (!desired_exit_location)
    desired_exit_location = "ALL";
  console.log("Starting Orchid Network: " + desired_exit_location);
  if (desired_exit_location == "US") {
    choices = us_seeds;
  } else if (desired_exit_location == "EU") {
    choices = eu_seeds;
  } else if (desired_exit_location == "CN") {
    choices = cn_seeds;
  } else if (desired_exit_location == "DE") {
    choices = de_seeds;
  } else if (desired_exit_location == "HKG") {
    choices = hkg_seeds;
  } else if (desired_exit_location == "SNG") {
    choices = sng_seeds;
  }
  var index = Math.floor(Math.random() * choices.length);
  var referral = choices[index];
  var result;

  async function filter(host) {
    console.log("FILTER CALLED");
    return true;
  }

  console.log("REFERRAL:" + referral);
  result = (async () => {
    await using(new orchid.core.DummyClock(), async (clock) => {
      await using(new orchid.core.DummyContext(clock), async (context) => {
        await context.refer(referral);
        await using(await new orchid.vpn.Client(context)._(), async (client) => {
          await using(await new orchid.vpn.SocksCapture(context, client, filter, port)._(), async (virtual) => {
            virtual.retain();
            virtuals.push(virtual);
          });
        });
      });
    });
  })().catch(function(err) {
    console.log("Error: ", err);
  });
}

function stop_orchid_network() {
  if (virtuals && virtuals.length) {
    var virtual = virtuals.pop();
    console.log("Stopping Orchid Network...", virtual);
    virtual.release();
  }
}
;

function get_chrome_path() {
  switch (process.platform) {
    case "darwin":
      return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    case "win32":
      // windows 10, TODO: older versions
      return "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe";
    case "linux":
      return "/usr/bin/google-chrome";
    default:
      throw new Error("unsupported platform: " + process.platform);
  }
}

function startChrome() {
  var userData = '~/Application\ Support/OrchidAlpha'; // TODO: hard-coded
  var program = get_chrome_path();
  var args = ['--user-data-dir=' + userData,
    '--no-first-run',
    '--proxy-server=socks5://127.0.0.1:1323',
    '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1'
  ];
  console.log("Chrom args:", args);
  if (this.instance) this.instance.kill();
  this.instance = spawn(program, args);
  // win.webContents.send(this.EVENTS.CONNECTED);
  console.log("Chrome started");
}

start_orchid_network('EU');

setTimeout(startChrome, 1000);
