const express = require('express');
var request = require('request')
const bodyParser = require('body-parser');

const configval = require('./config/config');
var interfaces = require("./userInterfaces");
const apiRequests =require("./apijudge");
const tokenResp = require("./tokenResponse");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


function sendMessageToSlackResponseURL(responseURL, JSONmessage) {
    var postOptions = {
        uri: responseURL,
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        json: JSONmessage
    }
    request(postOptions, (error, response, body) => {
        if (error) {
            // handle errors as you see fit
        }
    })
}


//executed when user sends the code
app.post("/slack/events/compile", async (req, res)=>{
    res.status(200).end();
    var reqBody = req.body
    if(reqBody.username !=undefined)
        console.log(`Request from ${reqBody.username}`)
    if (reqBody.token != configval.token) {
        res.status(404).end("Access forbidden!")
    }
    else {
        var msg=interfaces.getLanguages(reqBody.text);
        sendMessageToSlackResponseURL(reqBody.response_url, msg)
    }
});


//user selects a programming language
app.post('/slack/actions', async (req, res) => {
    res.status(200).end()
    var button_payload = JSON.parse(req.body.payload);
    var button_code = button_payload.actions[0].value
    var lang_code=button_code.substring(0,2);
    var prog_code=button_code.substring(2,button_code.length);
    // console.log(button_payload)
    // console.log(`code is ${prog_code} , lang code is ${lang_code}`)

    var sdata = {
        "query": {
            "scode": JSON.parse(prog_code),
            "langid": lang_code
        }
    };
    // console.log(sdata)
    var token = JSON.parse(await apiRequests.getToken(sdata));
    console.log(`Token generated : ${JSON.stringify(token)}`);

    var response = await tokenResp.eval(token.token,button_payload.response_url,1);

    console.log(response);

})

app.get("/oauth/authorize",  (req, res) => {
    //console.log("Authorizing :\n"+JSON.stringify(req.query));
    var options = {
        uri: 'https://slack.com/api/oauth.v2.access?code='
            +req.query.code+
            '&client_id='+configval.clientid+
            '&client_secret='+configval.secret,
        method: 'POST'
    }
    request(options, (error, response, body) => {
        var JSONresponse = JSON.parse(body)
        if (!JSONresponse.ok){
            //console.log(JSONresponse)
            res.send("Error encountered: \n"+JSON.stringify(JSONresponse)).status(200).end()
        }else{
            //console.log(JSONresponse)
            res.send("Success! Check your app section in slack.")
        }
    })
});


app.post("/",  (req, res) => {
    console.log("Not allowed");
    //res.send("Srever up!");
    res.send(req.body.challenge);
});


var server = app.listen(configval.port, () => {
    console.log(`Started server on port :${configval.port}`);
});
