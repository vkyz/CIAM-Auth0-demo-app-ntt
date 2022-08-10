
var helper = {
/** ****************************************************** */
  /** decode token */
  /** ****************************************************** */
  decodeToken : function(token) {
    let base64Url = JSON.stringify(token).split('.')[1]; // token you get
    let base64 = base64Url.replace('-', '+').replace('_', '/');
    let decodedData = JSON.parse(
      Buffer.from(base64, 'base64').toString('binary')
    );
    return decodedData;
  }
}

  module.exports = helper;