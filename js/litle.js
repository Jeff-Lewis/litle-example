// Litle PayPage Stuff

var litleFunctions = {
    convertHexUUIDToB64: function (UUID) {
        function packHStar (bytes) {
            var word, result = '';

            for (i = 0; i < bytes.length; i += 2) {
                word = bytes[i];
                if (((i + 1) >= bytes.length) || typeof bytes[i + 1] === 'undefined') {
                    word += '0';
                } else {
                    word += bytes[i + 1];
                }
                result += String.fromCharCode(parseInt(word, 16));
            }

            return result;
        }

        return $.base64.encode(
            packHStar(UUID.replace(/-/g, "").toLowerCase())
        );
    },

    setLitleResponseFields: function (response) {
        document.getElementById('response__code').value = response.response;
        document.getElementById('response__message').value = response.message;
        document.getElementById('response__responseTime').value = response.responseTime;
        document.getElementById('response__reportGroup').value = response.reportGroup;
        document.getElementById('response__merchantTxnId').value = response.id;
        document.getElementById('response__orderId').value = response.orderId;
        document.getElementById('response__litleTxnId').value = response.litleTxnId;
        document.getElementById('response__type').value = response.type;
        document.getElementById('response__rawJSON').value = JSON.stringify(response, undefined, 1);
    },

    // This is a random GUID. Same format as the basket ID we use on the real checkout - which is generated by the API
    generateOrderID: function () {
        var r4 = function() {
           return (((1+Math.random())*0x10000)|0).toString(16).substring(1).toUpperCase();
        };

        var UUID = (r4()+r4()+"-"+r4()+"-"+r4()+"-"+r4()+"-"+r4()+r4()+r4());

        return litleFunctions.convertHexUUIDToB64(UUID);
    },

    timeoutOnLitle: function () {
        litleFunctions.setLitleResponseFields(response);

        return false;
    },

    submitAfterLitle: function (response) {
        litleFunctions.setLitleResponseFields(response);

        return false;
    },

    onErrorAfterLitle: function (response) {
        litleFunctions.setLitleResponseFields(response);

        return false;
    }
}


$(document).ready(function() {
    $("#submit-payment").click(function() {
        if (typeof new LitlePayPage() !== "object") {
            alert("API Unavailable, unable to load Litle JavaScript");

            return false;
        }

        // Normally this data is provided by our API, generate random GUIDs for this minimal testcase
        $("#request__orderId").val( litleFunctions.generateOrderID() );
        $("#request__merchantTxnId").val( litleFunctions.generateOrderID() );

        // Clear anything that may be in the form fields
        litleFunctions.setLitleResponseFields({
            "response": "",
            "message": ""
        });

        // Get the data from the form fields. Note we are using browser native selectors
        // Litle API requires the element directly, not the value, and not a jQuery object
        var formFields = {
            "accountNum": document.getElementById('ccNum'),
            "cvv2": document.getElementById('cvv2'),
            "paypageRegistrationId": document.getElementById('paypageRegistrationId'),
            "bin": document.getElementById('bin')
        };

        // Setup the request
        var litleRequest = {
            "paypageId": document.getElementById("request__paypageId").value,
            "id": document.getElementById("request__merchantTxnId").value,
            "orderId": document.getElementById("request__orderId").value,
            "reportGroup": document.getElementById("request__reportGroup").value,
            "url": 'https://request-prelive.np-securepaypage-litle.com'
        };

        new LitlePayPage().sendToLitle(
            litleRequest, formFields, litleFunctions.submitAfterLitle, litleFunctions.onErrorAfterLitle, litleFunctions.timeoutOnLitle, 5000
        );

        return false;
    });
});
