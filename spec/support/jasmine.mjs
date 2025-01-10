export default {
  spec_dir: "",
  spec_files: [
    "!node_modules/*",
    "*[sS]pec.?(m)js"
  ],
  env: {
    stopSpecOnExpectationFailure: false,
    random: true,
    forbidDuplicateNames: true
  }
}
