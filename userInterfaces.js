var uiinterfaces = {
    getLanguages(code) {
        org_code = code
        if(code.trim().substring(0,3)==="```")
            code=code.trim().substring(3,code.length-3)
        else
            code=code.trim()
        // console.log(code+"\nCodede : "+JSON.stringify(code))
        code =JSON.stringify(code)
        var message = {
            "text":org_code,
            "attachments": [
                {
                    "text": "Please choose the language to compile the code:",
                    "fallback": "Currently we support 3 languages",
                    "callback_id": "button_tutorial",
                    "color": "#3AA3E3",
                    "attachment_type": "default",
                    "actions": [
                        {
                            "name": "Bash",
                            "text": "Bash",
                            "type": "button",
                            "value": `46${code}`
                        },
                        {
                            "name": "C",
                            "text": "C",
                            "type": "button",
                            "value": `50${code}`
                        },
                        {
                            "name": "C++",
                            "text": "C++",
                            "type": "button",
                            "value": `54${code}`
                        },
                        {
                            "name": "Python",
                            "text": "Python 3",
                            "type": "button",
                            "value": `71${code}`
                        },
                        {
                            "name": "JavaScript",
                            "text": "Java Script",
                            "type": "button",
                            "value":`63${code}`
                        },
                        {
                            "name": "Go",
                            "text": "Go",
                            "type": "button",
                            "value":`60${code}`
                        },
                        {
                            "name": "Ruby",
                            "text": "Ruby",
                            "type": "button",
                            "value":`72${code}`
                        }
                    ]
                }
            ]
        }
        return message;
    }

}

module.exports = uiinterfaces;