const security = require('../../libraries/security');
const express = require('express');
const router = express.Router();
const i18n = require("i18n");
const utils = require('../../libraries/utils');

router.get('/:locale/:type', function(req, res, next){

    // In construction... do not show for while...

    //console.log(req.params.locale);
    //console.log(req.params.type);

    security.render(req,res, next,'public/game/items', {});

});

module.exports = router;