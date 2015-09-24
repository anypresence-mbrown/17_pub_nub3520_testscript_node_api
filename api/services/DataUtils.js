module.exports = {
    toBoolean: function (value) {
        var result = value;
        if (typeof value == 'string') {
            switch (value.toLowerCase()) {
                case 'true':
                case '1':
                case 'yes':
                case 'on':
                case 1:
                case true:
                    result = true;
                    break;
                default:
                    result = false;
                    break;
            }
        }
        return result;
    }
};