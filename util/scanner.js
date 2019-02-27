const fs = require('fs');

// scanner reads data and returns nextLine
module.exports = function () {
    let myData = null;
    let myIndex = null;
 
    // return public functions to read stored data
    return {
        hasNext: function () {
            if (!myData) {
                return false;
            } else {
                return (myIndex < myData.length - 1);
            }
        },

        open: function (filename) {
            myData = fs.readFileSync(filename, {encoding: 'utf-8'});
            myIndex = -1;
        },

        nextLine: function() {
            result = '';
            
            while (this.hasNext()) {
                myIndex++;

                let nextValue = myData.charAt(myIndex);

                if (nextValue == '\n') {
                    break;
                } else {
                    result = result + nextValue;
                }
            }

            return result;
        },

        close: function () {
            myData = null;
        }
    };
} ();