const express = require("express");
const {getPackageOfUser , LimitRequest} = require("../controller/userController");
const router = express.Router();


router.route("/limit").get(LimitRequest);

module.exports = router;
