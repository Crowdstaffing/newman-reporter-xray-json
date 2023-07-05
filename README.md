# newman-reporter-xray-json

X-Ray JSON Reporter focused on building Newman report which can be directly import into X-Ray Test Execution.

## Motivation

This reporter execute collections on postman and convert into X-Ray JSON report using tags surrounded by `[tag]` square brackets. Each postman request must have test ticket tag.

## Output structure

```json
{
  "testExecutionKey": "WRFL-123",
  "info": {
    "project": "WRFL",
    "summary": "Execution of automated tests",
    "description": "This execution is automatically created when importing execution results from Gitlab",
    "version": "",
    "revision": "",
    "startDate": "2023-07-05T06:18:04.815-05:30",
    "finishDate": "2023-07-05T06:18:10.603-05:30",
    "testPlanKey": "",
    "testEnvironments": []
  },
  "tests": [
    {
      "testKey": "WRFL-144",
      "comments": "[WRFL-144] Step 3: Retrieving Workflow Modules with no matching filters - Assertion - Status code is 200 FAILED. Detail - expected response to have status code 201 but got 200\n[WRFL-144] Step 3: Retrieving Workflow Modules with no matching filters - Assertion - Should contain not contain any Workflow modules data FAILED. Detail - expected 0 to equal 1",
      "status": "FAILED",
      "start": "2023-07-05T06:18:10.606-05:30",
      "finish": "2023-07-05T06:18:10.607-05:30",
      "executedBy": "",
      "assignee": "",
      "defects": [],
      "evidence": [],
      "customFields": []
    }
  ]
}
```

[Structures described.](https://github.com/postmanlabs/newman#newmanruncallbackerror-object--summary-object)

## Options

| Option                                  | Value                        | Required | Note                          |
|-----------------------------------------|------------------------------|----------|-------------------------------|
| --reporter-xray-json-export             | /path/to/save/json/file.json | YES      | Path to store JSON report     |
| --reporter-xray-json-project-key        | WRFL                         | YES      | JIRA Project key              |
| --reporter-xray-json-test-execution-key | WRFL-123                     | YES      | JIRA X-Ray Test Execution key |

*By default the report is generated in `newman` subfolder of current working directory.*
