/*
 * An email needs to be sent to all account owners
 * Pretend your server received a request with the query below. It contains all the info needed
 * to build requests to other endpoints.
 *
 const queryString = '/status-email?accountId=8675309&accountsEndpoint=account&usersEndpoint=user&emailEndpoint=sendGrid';
 *
 * Given this request (queryString), create a
 * function (or set of functions) that parses the initial query string and builds the
 * requests queue and handles requesting the endpoints
 *
 * Put your answer on your GitHub/BitBucket/GitLab or some other place where
 * it can be seen. Reply to this email with a link to your answer.

 * Hint:
 * The requests that you'll build, once parsed from the original url, will look like this:
 * GET https://safe-beyond-14033.herokuapp.com/<accountsEndpoint>/<accountId>
 * (You'll need to parse the endpoint's real value out of the queryString. i.e. accountsEndpoint=account)

  This endpoint returns account info like this:
  { status: 'ACTIVE', users: [123456, 123457, 123458] }

  Your next set of requests will look like this:
  GET https://safe-beyond-14033.herokuapp.com/<usersEndpoint>/<userId>
  This endpoint returns user info per user
  (remember, you're getting data for multiple users) that looks like this:
  { userId: 123456, firstName: 'Biff', lastName: 'Tannen', email: 'biff@biffsautodetailing.com }

  Finally, you're ready to POST to the sendGrid endpoint
 * POST https://safe-beyond-14033.herokuapp.com/<emailEndpoint>
  POST Body: {
    accountStatus: 'ACTIVE',
    users: [
      { firstName: 'mike', email: 'mike@tyson.com' },
      { firstName: 'george', email: 'george@thegrilla.com'}
    ]
  }

 * Note: one or more requests can be made in parallel.
 */

const bunyan = require('bunyan');
const qs = require('qs');
const rp = require('request-promise');

const BASE_URL = 'https://safe-beyond-14033.herokuapp.com';
const log = bunyan.createLogger({name: "emailer"});
const queryString = '/status-email?accountId=8675309&accountsEndpoint=account&usersEndpoint=user&emailEndpoint=sendGrid';

async function sendAccountOwnerEmail(val) {

    const parsedQueryString = qs.parse(val.split('?')[1]);
    const accountId = parsedQueryString.accountId;

    log.info(`Attempting to send email for account: ${accountId}`)

    const accountInfo = await getAccountInfo(parsedQueryString.accountsEndpoint, accountId);
    const userInfoList = await getUserInfo(parsedQueryString.usersEndpoint, accountInfo.users);

    if (userInfoList && userInfoList.length > 0) {
        const isPostSuccess = await postGrid(parsedQueryString.emailEndpoint, userInfoList, accountInfo.status);
        if (isPostSuccess) {
            log.info(`Email sent successfully for account: ${accountId}`);
            return;
        }
        log.error(`There was a problem when attempting to send email for account: ${accountId}`);
    }
}

async function getAccountInfo(endpoint, accountId) {
    return doGetRequest(`${endpoint}/${accountId}`);
}

async function getUserInfo(endpoint, users) {
    const userInfoPromises = users.map((user) => {
        return doGetRequest(`${endpoint}/${user}`);
    })
    return Promise.all(userInfoPromises).then((values) => {
        return values;
    });
}

async function postGrid(endpoint, userInfoList, accountStatus) {
    const users = userInfoList.map((user) => {
        const email = user.email;
        const firstName = user.firstName;
        return {firstName, email};
    });
    const payload = {accountStatus, users};
    return doPostRequest(endpoint, payload);
}

async function doGetRequest(endpoint) {
    const options = {
        uri: `${BASE_URL}/${endpoint}`,
        json: true
    };
   return rp(options)
   .then(function (res) {
       return res;
   })
   .catch(function (err) {
       log.error(err, `There was a problem with your get request`);
   });
}

async function doPostRequest(endpoint, body) {

    const options = {
        method: 'POST',
        uri: `${BASE_URL}/${endpoint}`,
        body: body,
        json: true
    };

    return rp(options)
    .then(function (res) {
        return res;
    })
    .catch(function (err) {
        log.error(err, `There was a problem with your post request`);
    });
}

sendAccountOwnerEmail(queryString);
