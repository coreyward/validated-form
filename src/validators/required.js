export default (value, callback) =>
  value.length > 0 ? (callback ? callback(value) : [true]) : [false, "Required"]
