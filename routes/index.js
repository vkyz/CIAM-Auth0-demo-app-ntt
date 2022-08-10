var router = require('express').Router();
const dotenv = require('dotenv');
const { requiresAuth } = require('express-openid-connect');
var randomWords = require('random-words');
const helper = require('../helper');
//var jose = require('node-jose');
var axios = require("axios").default;
var qs = require('qs');
let ManagementClient = require('auth0').ManagementClient;
var randomWords = require('random-words');
const jwt_decode = require('jwt-decode');

dotenv.load();

/** Documentation: https://auth0.github.io/node-auth0/ */
let auth0 = new ManagementClient({
  domain: process.env.TENANT_NAME,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
});

router.get('/test', function (req, res, next) {
  /*var access_token = null;
  if(req.oidc.accessToken) {
    access_token = req.oidc.accessToken;
    console.log("access token: ",access_token);
  }*/
  
  res.render('test');
});

router.get('/pp-form', function (req, res, next) {
  res.render('pp-form',{words: randomWords(5)});
});

router.get('/', function (req, res, next) {
  var access_token = null;
  if(req.oidc.accessToken) {
    access_token = req.oidc.accessToken;
    console.log("access token: ",access_token);
  }
  if(req.oidc.idToken) {
    id_token = req.oidc.idToken;
    console.log("id token: ",id_token);
  }
  
  res.render('dashboard', {
    title: 'CIAM demo',
    isAuthenticated: req.oidc.isAuthenticated(),
    section: 'Dashboard',
    subsec: '',
    accessToken: access_token!=null?access_token.access_token:''
  });
});


router.get('/profile', requiresAuth(), async function (req, res, next) {
  //console.log("access token: ", req.oidc.accessToken);
  const userInfo = await req.oidc.fetchUserInfo();
  const namespace_url = process.env.NAMESPACE+"/identities";
  const identities = req.oidc.user[namespace_url];
  console.log("identities: ",identities);
  console.log("userinfo: ",userInfo);
  res.render('profile', {
    isAuthenticated: req.oidc.isAuthenticated(),
    userProfile: JSON.stringify(userInfo, null, 4),
    accessTokenDecoded: JSON.stringify(helper.decodeToken(req.oidc.accessToken.access_token), null, 4),
    idTokenDecoded: JSON.stringify(helper.decodeToken(req.oidc.idToken), null, 4),
    accessToken: req.oidc.accessToken.access_token,
    identities: identities?JSON.stringify(identities):"",
    title: 'Profile page',
    section: 'profile',
    subsec: ''
  });
});

router.get('/authn/embedded-lock', function (req, res, next) {
  res.render('embedded-lock', {
    isAuthenticated: false,
    title: 'Embedded Login - Lock',
    section: 'Authentication',
    subsec: 'lock'
  });
});

router.get('/authn/embedded-auth0js', function (req, res, next) {
  res.render('embedded-auth0js', {
    isAuthenticated: false,
    title: 'Embedded Login - Auth0.js',
    section: 'Authentication',
    subsec: 'auth0js'
  });
});

router.get('/authn/m2m', function (req, res, next) {
  res.render('m2m', {
    isAuthenticated: false,
    title: 'Machine-to-Machine Flow - Auth0.js',
    section: 'Authentication',
    subsec: 'm2m'
  });
});

router.get('/progressiveprofiling', function (req, res, next) {
  res.render('progressiveprofiling', {
    isAuthenticated: false,
    title: 'Progressive Profiling',
    section: 'PP',
    subsec: ''
  });
});

router.get('/stepupmfa-api', function (req, res, next) {
  res.render('stepupmfa-api', {
    isAuthenticated: false,
    title: 'Step-up MFA - API',
    section: 'StepUpMfa',
    subsec: 'StepUpMfaAPI'
  });
});

router.get('/stepupmfa-web', function (req, res, next) {
  res.render('stepupmfa-web', {
    isAuthenticated: false,
    title: 'Step-up MFA - Web',
    section: 'StepUpMfa',
    subsec: 'StepUpMfaWeb'
  });
});

router.get('/stepupmfa-adaptive', function (req, res, next) {
  res.render('stepupmfa-adaptive', {
    isAuthenticated: false,
    title: 'Step-up MFA - Adaptive',
    section: 'StepUpMfa',
    subsec: 'StepUpMfaAdaptive'
  });
});

router.get('/b2b', function (req, res, next) {
  res.render('b2b', {
    isAuthenticated: false,
    title: 'Identity Providers - B2B',
    section: 'B2B',
    subsec: ''
  });
});

router.get('/orgs', function (req, res, next) {
  res.render('orgs', {
    isAuthenticated: false,
    title: 'Organizations - B2B',
    section: 'Orgs',
    subsec: ''
  });
});

router.get('/privacy', function (req, res, next) {
  res.render('privacy', {
    isAuthenticated: false,
    title: 'Data Privacy and Compliance',
    section: 'Privacy',
    subsec: ''
  });
});

router.get('/authn/passwordless', function (req, res, next) {
  res.render('passwordless', {
    isAuthenticated: false,
    title: 'Passwordless',
    section: 'Authentication',
    subsec: 'passwordless'
  });
});

router.get('/authn/sso', function (req, res, next) {
  res.render('sso', {
    isAuthenticated: false,
    title: 'Single Sign On',
    section: 'Authentication',
    subsec: 'sso'
  });
});

router.get('/actionsnippets', function (req, res, next) {
  res.render('actionsnippets', {
    isAuthenticated: false,
    title: 'Action Code Snippets',
    section: 'ActionSnippets',
    subsec: ''
  });
});

router.get('/android', function (req, res, next) {
  res.render('android', {
    isAuthenticated: false,
    title: 'Mobile - Android',
    section: 'Mobile',
    subsec: 'Android'
  });
});

router.post('/m2m', function (req, res, next) {
  let url = 'https://' + process.env.TENANT_NAME + '/oauth/token';
  console.log("url: ",url);

    var data = qs.stringify({
      audience: process.env.AUDIENCE,
      grant_type: 'client_credentials',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET 
    });
    var config = {
      method: 'post',
      url: url,
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded', 
      },
      data : data
    };
    
    axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      res.send(response.data);
    })
    .catch(function (error) {
      console.log(error);
      res.status(500).send(error);
    });
});

/** ************************************************* */
/** MANAGEMENT API */
/** ************************************************* */

router.post('/updateprofile', function(req,res){
  let userid = req.body.userid;
  let body = {'picture': req.body.picture};
  //console.log("body: ",body);
  auth0.users.update({id: userid}, body, function (err, response) {
    if (err) {
      // Handle error.
      console.log("Error updating user profile: ", err);
      res.status(500).send(err);
    }
    res.send(response);
  });
});

router.post('/unlinkuser', function(req,res){
  console.log("unlinkuser body: ",req.body);
  auth0.users.unlink(req.body, function (err, response) {
    if (err) {
      // Handle error.
      console.log("Error unlinking users: ", err);
      res.status(500).send(err);
    }
    res.send(response);
  });
});

router.post('/enablerule', function(req,res){
  var params = { id: ACCOUNT_LINKING_RULE_ID };
  var data = { enabled: 'true'};
  management.updateRule(params, data, function (err, rule) {
    if (err) {
      // Handle error.
      console.log("Error enabling the account linking rule: ", err);
      res.status(500).send(err);
    }

    console.log(rule); // 'my-rule'.
    res.send(response);
  });
});


router.get('/actions', function (req, res, next) {
  try {
    auth0.actions.getAllTriggers(
      function (err, response) {
        if (err) {
          // Handle error.
          console.log("Error getting triggers: ", err);
        }
        //console.log(response);
        res.render('actions', {
          data: response,
          title: 'Actions',
          section: 'Actions',
          subsec: ''
        });
      }
    );
  } catch (error) {
    console.error(error);
  }
});

router.post('/triggerbindings', function (req, res, next) {
  let triggerid = req.body.triggerid;
  try {
    auth0.actions.getTriggerBindings({trigger_id: triggerid},
      function (err, response) {
        if (err) {
          // Handle error.
          console.log("Error getting trigger bindings: ", err);
        }
        console.log(response);
        res.send(response);
      }
    );
  } catch (error) {
    console.error(error);
  }
});


router.post('/getaction', function(req,res){
  let actionid = req.body.actionid;
  //console.log("actionid: ",actionid);
  auth0.ActionsManager.get(
    {
      id: actionid
    },
    function (err, response) {
      if (err) {
        // Handle error.
        console.log("Error getting admin api: ", err);
      }
      //console.log(response);
      res.send(response);
    }
  );
});

router.post('/triggers/getall', function(req,res){
  auth0.ActionsManager.getAllTriggers(
    function (err, response) {
      if (err) {
        // Handle error.
        console.log("Error getting triggers: ", err);
      }
      //console.log(response);
      res.send(response);
    }
  );
});

router.post('/createaction', function(req,res){
  let action_name = req.body.name;
  let code = req.body.code;
  let actionobject = {
    "name": action_name,
    "supported_triggers": [
      {
        "id": "post-login",
        "version": "v2"
      }
    ],
    "code": code
  };
  console.log("actionobject: ",actionobject);
  auth0.actions.create(actionobject,
    function (err, response) {
      if (err) {
        // Handle error.
        console.log("Error creating action: ", err);
        res.status(500).send(err);
      }
      /*sleep(3000).then(() => {
        auth0.actions.deploy({'id': response.id},function (err, response) {
          if (err) {
            // Handle error.
            console.log("Error deploying action: ", err);
            res.status(500).send(err);
          }
          res.send(response);
        });
      });*/
      res.send(response);
    }
  );
});

router.post('/deployaction', function(req,res){
  let action_id = req.body.id;
  auth0.actions.deploy({'id': action_id},function (err, response) {
    if (err) {
      // Handle error.
      console.log("Error deploying action: ", err);
      res.status(500).send(err);
    }
    res.send(response);
  });
});

router.post('/changeprompt', function(req,res){
  let prompt = req.body.prompt;
  console.log("prompt: ",prompt);
  let body = {
    'identifier_first': prompt.identifier_first!=null?prompt.identifier_first:null,
    'webauthn_platform_first_factor': prompt.webauthn_platform_first_factor!=null?prompt.webauthn_platform_first_factor:null
  };
  console.log("body: ",body);
  auth0.prompts.updateSettings(body, body, function (err, prompts) {
    if (err) {
      // Handle error.
      console.log("Error changing Authentication Profile: ", err);
      res.status(500).send(err);
    }
    res.send(prompts);
  });
});

router.post('/setuporgs', async function(req,res){
  let orgA = {
    "name": process.env.ORG_A_NAME,
    "display_name": process.env.ORG_A_DISPLAY_NAME,
    "branding": {
      "logo_url": process.env.ORG_A_LOGO,
      "colors": {
        "primary": process.env.ORG_A_PRIMARY_COLOR,
        "page_background": process.env.ORG_A_PAGE_BACKGROUND_COLOR
      }
    }
  };
  let orgB = {
    "name": process.env.ORG_B_NAME,
    "display_name": process.env.ORG_B_DISPLAY_NAME,
    "branding": {
      "logo_url": process.env.ORG_B_LOGO,
      "colors": {
        "primary": process.env.ORG_B_PRIMARY_COLOR,
        "page_background": process.env.ORG_B_PAGE_BACKGROUND_COLOR
      }
    }
  };
  var orgids = {};

  var orgidA = await createOrgWrapper(orgA);
  var orgidB = await createOrgWrapper(orgB);
  
  if(orgidA && orgidB) orgids = {"orgidA": orgidA, "orgidB": orgidB};

  let data = { "connection_id" : process.env.CONNECTION_ID_DB, "assign_membership_on_login": true };
  let data2 = { "connection_id" : process.env.CONNECTION_ID_GOOGLE, "assign_membership_on_login": true };
  await assignConnectionToOrgWrapper({id: orgidA},data);
  await assignConnectionToOrgWrapper({id: orgidB},data);
  await assignConnectionToOrgWrapper({id: orgidB},data2);

  res.send(orgids);
});

router.post('/continue', function(req,res){
  let state = req.body.state;
  let demo_rating = req.body.rating;
  let redirecturl = process.env.ISSUER_BASE_URL+"/continue?state="+state+"&demo_rating="+demo_rating;
  console.log("redirecturl: ",redirecturl);
  res.redirect(redirecturl);
  res.end();
});


router.post('/newwords', function(req,res){
  res.send({words: randomWords(5)});
})

function sleep(ms) {
  console.log("taking a nap for "+ms+" miliseconds...");
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createOrg(org, successCallback, errorCallback){
  let orgid = null;
  auth0.organizations.create(org, function (err, response) {
    if (err) {
      // Handle error.
      console.log("Error creating Orgs: ", err);
      errorCallback(err);
    }
    orgid = response.id;
    console.log("orgid: ",orgid);
    successCallback(orgid);
  });
}

function createOrgWrapper(org){
  var orgid = null;
  return new Promise((resolve, reject) => {
    createOrg(org, (successResponse) => {
      resolve(successResponse);
    }, (errorResponse) => {
      reject(errorResponse);
    });
  });
}

function assignConnectionToOrg(org, connection, successCallback, errorCallback){
  auth0.organizations.addEnabledConnection(org, connection, function (err, response) {
    if (err) {
      // Handle error.
      console.log("Error assigning connection to Orgs: ", err);
      errorCallback(err);
    }
    successCallback(true);
  });
}

function assignConnectionToOrgWrapper(org, connection){
  return new Promise((resolve, reject) => {
    assignConnectionToOrg(org, connection, (successResponse) => {
      resolve(successResponse);
    }, (errorResponse) => {
      reject(errorResponse);
    });
  });
}


module.exports = router;
