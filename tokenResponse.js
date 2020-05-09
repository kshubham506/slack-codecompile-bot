const request = require('request');
const judgeApi = require('./apijudge');

function sendMessageToSlackResponseURL(responseURL, msg) {
    var postOptions = {
        uri: responseURL,
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        json: {
            "text": msg,
            "replace_original": false
        }
    }
    request(postOptions, (error, response, body) => {
        if (error) {
            // handle errors as you see fit
        }
    })
}

var checkTokenResponse = {
    async eval(token, responseUrl, times) {
        try {
            // console.log("Times : " + times)
            var resp = JSON.parse(await judgeApi.getResult(token));

            if (resp.toString().startsWith("\/Error")) {
                console.log("Error eval func : " + resp);
                sendMessageToSlackResponseURL(responseUrl, `❌  *${resp}*`);
                return JSON.stringify({ 'code': 402, 'msg': 'Error in eval : '+resp });
            }
            else {
                //if thers' no error in the response , then parse it
                var status = resp.status.id
                // console.log("status : " + status)

                if (status == 1) {
                    sendMessageToSlackResponseURL(responseUrl, "`🔷 Waiting In queue... Please wait`");
                    if (times < 5)
                        setTimeout(this.eval, 1000, token, responseUrl, times + 1);
                    else if (times < 10) {
                        sendMessageToSlackResponseURL(responseUrl, "`⚠️ High Traffic.. Kindly Wait`");
                        setTimeout(this.eval, 3000, token, responseUrl, times + 1);
                    } else {
                        sendMessageToSlackResponseURL(responseUrl, "`⚠️ Unable to service your request.Try again after some time or contact admin`");
                        return JSON.stringify({ 'code': 404, 'msg': '⚠️ Unable to service your request.Try again after some time or contact admin' });
                    }
                }
                else if (status == 2) {
                    sendMessageToSlackResponseURL(responseUrl, "`⚙️ Compiling... Please wait`");
                    if (times < 5)
                        setTimeout(this.eval, 1000, token, responseUrl, times + 1);
                    else if (time < 10) {
                        sendMessageToSlackResponseURL(responseUrl, "`⚠️ Taking longer time than usual... kindly Wait`");
                        setTimeout(this.eval, 3000, token, responseUrl, times + 1);
                    } else {
                        sendMessageToSlackResponseURL(responseUrl, "`⚠️ Unable to service your request.Try again after some time or contact admin`");
                        return JSON.stringify({ 'code': 404, 'msg': '⚠️ Unable to service your request.Try again after some time or contact admin' });
                    }
                }
                else if (status == 3) {
                    if (resp.stdout == null || resp.stdout == undefined) {
                        sendMessageToSlackResponseURL(responseUrl, "`Output:`\n\nundefined/null");
                    } else {
                        const output = Buffer.from(resp.stdout, 'base64').toString("ascii");
                        sendMessageToSlackResponseURL(responseUrl, "```✅ Output:\n\n" + output + "\n\nTime :  "
                            + resp.time + "\nMemory :  " + resp.memory + " KB```");
                    }
                    return JSON.stringify({ 'code': 200, 'msg': 'Output done' });
                }
                else if (status == 6) {
                    const errmsg = Buffer.from(resp.compile_output, 'base64').toString("ascii")
                    sendMessageToSlackResponseURL(responseUrl, "```❌*Compilation Error:*\n\n" + errmsg + "```");
                    return JSON.stringify({ 'code': 204, 'msg': 'Compilation error' });
                }
                else if (status >= 7 && status <= 12) {
                    var err = "",
                        errmsg = "",
                        compilemsg = ""
                    if (resp.stderr != null)
                        err = Buffer.from(resp.stderr, 'base64').toString("ascii")
                    if (resp.message != null)
                        errmsg = Buffer.from(resp.message, 'base64').toString("ascii")
                    if (resp.compile_output != null)
                        compilemsg = Buffer.from(resp.compile_output, 'base64').toString("ascii")

                    sendMessageToSlackResponseURL(responseUrl, "```❌ *Runtime Error:*\n\n" + compilemsg + "\n\n" + err + "\n\n" + errmsg + "```");

                    return JSON.stringify({ 'code': 206, 'msg': 'Runtime error' });
                }
                else if (status == 13) {

                    sendMessageToSlackResponseURL(responseUrl, "```❌ *Internal Error:*\n\nContact admin```");

                    return JSON.stringify({ 'code': 208, 'msg': 'Internal error' });
                }
                else {
                    var err = "",
                        errmsg = "",
                        compilemsg = ""
                    if (resp.stderr != null)
                        err = Buffer.from(resp.stderr, 'base64').toString("ascii")
                    if (resp.message != null)
                        errmsg = Buffer.from(resp.message, 'base64').toString("ascii")
                    if (resp.compile_output != null)
                        compilemsg = Buffer.from(resp.compile_output, 'base64').toString("ascii")

                    sendMessageToSlackResponseURL(responseUrl, "```❌ *Misc Error:*\n\n" + compilemsg + "\n\n" + err + "\n\n" + errmsg + "```");

                    return JSON.stringify({ 'code': 210, 'msg': 'Misc Error' });
                }
            }
        }
        catch (err) {
            console.log("Error in eval method :" + err);
            sendMessageToSlackResponseURL(responseUrl, '`⚠️ Unable to service your request.Try again after some time or contact admin`');
            return JSON.stringify({ 'code': 404, 'msg': '⚠️ Unable to service your request.Try again after some time or contact admin' });
        }


    }
}
module.exports = checkTokenResponse;