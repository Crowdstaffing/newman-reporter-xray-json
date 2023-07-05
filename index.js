/**
 * Custom reporter that dumps adapted structure of JSON report out.
 * Provides JSON response bodies if content-type is application/json, string otherwise.
 *
 * @param {Object} newman - The collection run object, with event hooks for reporting run details.
 * @param {Object} options - A set of collection run options.
 * @param {String} options.export - The path to which the report object must be written.
 * @param options.stats - Include also 'stats' dict in the output report.
 * @returns {*}
 */

const my = require('./package.json');
const prog = 'NR-json-steps@' + my.version;

function info(...msg) {
  console.log('INFO::' + prog, ...msg);
}

function error(...msg) {
  console.log('ERR::' + prog, ...msg);
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const offset = date.getTimezoneOffset() * -1;
  const offsetHours = Math.floor(Math.abs(offset) / 60).toString().padStart(2, '0');
  const offsetMinutes = (Math.abs(offset) % 60).toString().padStart(2, '0');
  const offsetSign = offset >= 0 ? '-' : '+';

  return `${date.toISOString().slice(0, -1)}${offsetSign}${offsetHours}:${offsetMinutes}`;
}

function createLightSummary(rawDetail, options) {
  if (options.xrayJsonProjectKey == undefined){
    throw new Error('Project Key is not provided')
  }

  if (options.xrayJsonTestExecutionKey == undefined) {
    throw new Error('Test Execution Key is not Provided.')
  }

  let steps = [];
  let test_steps = {};
  rawDetail.run.executions.forEach(function (exec) {
    let test_status = 'PASSED';
    let test_failed_details = [];
    if (exec.assertions !== undefined) {
      exec.assertions.forEach(function (assertionReport) {
        if (assertionReport.error) {
          test_status = 'FAILED';
          test_failed_details.push(`${exec.item.name} - Assertion - ${assertionReport.assertion} FAILED. Detail - ${assertionReport.error.message}`);
        }
      });
    }
    if (exec.requestError) {
      test_status = 'FAILED';
      test_failed_details.push(`${exec.item.name} Request Error - ${exec.requestError}`);
    }
    let test_comments = (test_failed_details.length > 0) ? test_failed_details.join('\n') : '';

    let test_key = exec.item.name.match(/\[(.+?)\]/);
    if (test_key == undefined || test_key == null || test_key.length < 2) {
      throw new Error('Test key tag not found');
    }

    test_key = test_key[1];
    if (test_key.startsWith(options.xrayJsonProjectKey) == false) {
      throw new Error('Test key is invalid.')
    }
    if (test_steps[test_key] == undefined) {
      test_steps[test_key] = {
        'status': 'PASSED',
        'comments': [],
        'response_time': 0
      }
    }
    if (test_comments != '') {
      test_steps[test_key].comments.push(test_comments)
    }
    if (test_steps[test_key].status == 'FAILED' || test_status == 'FAILED'){
      test_steps[test_key].status = 'FAILED';
    }
    if (exec.response.responseTime) {
      test_steps[test_key].response_time += (exec.response.responseTime / 1000) || 0;
    }
  });

  Object.keys(test_steps).forEach(function(step) {
    var currentTimestamp = Date.now();
    steps.push({
      'testKey': step,
      'comments': test_steps[step].comments.join('\n'),
      'status': test_steps[step].status,
      'start': `${formatTimestamp(currentTimestamp)}`,
      'finish': `${formatTimestamp(currentTimestamp + Math.round(test_steps[step].response_time))}`,
      "executedBy": "",
      "assignee": "",
      "defects": [],
      "evidence": [],
      "customFields": [],
    })
  })

  let xray_json = {
    "testExecutionKey": options.xrayJsonTestExecutionKey,
    'info': {
      'project': options.xrayJsonProjectKey,
      "summary": "Execution of automated tests",
      "description": "This execution is automatically created when importing execution results from Gitlab",
      "version": "",
      "revision": "",
      "startDate": `${formatTimestamp(rawDetail.run.timings.started)}`,
      "finishDate": `${formatTimestamp(rawDetail.run.timings.completed)}`,
      "testPlanKey": "",
      "testEnvironments": []
    },
    'tests': steps,
  }

  return xray_json;
}

module.exports = function (newman, options) {
  newman.on('beforeDone', function (err, o) {
    if (err) {
      info('stops on error:', err);
      return;
    }
    try {
      newman.exports.push({
        name: 'json-steps-reporter',
        default: 'newman-step-results.json',
        path: options.xrayJsonExport,
        content: createLightSummary(o.summary, options)
      });
    }
    catch (e) {
      error(e);
    }
  });
};
