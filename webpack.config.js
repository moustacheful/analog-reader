var path = require("path");

module.exports = {
  entry: {
    app: ["./test/test.js"]
  },
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "/assets/",
    filename: "bundle.js"
  },
  resolve: {
  	alias:{
  		'onoff': './test/onoff.mock.js'
  	}
  }
};