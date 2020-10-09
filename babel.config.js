module.exports = {
  "presets": ["@babel/preset-env"],
  "plugins": [
    "@babel/plugin-transform-react-jsx",
	["@babel/plugin-transform-runtime", {
		"regenerator": true
	}]
  ]
}
