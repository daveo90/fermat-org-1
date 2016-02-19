var winston = require('winston');
var express = require('express');
var router = express.Router();
var repMod = require('../../../../modules/repository');
var security = require('../../../../lib/utils/security');
/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
var lock = function (req, res, next) {
    try {
        if (req.params.comp_id) {
            req.body.item_id = req.params.comp_id;
            req.body.item_type = 'comp';
            req.body.priority = 5;
            repMod.doLock(req, function (error, result) {
                if (error) {
                    res.status(200).send(error);
                } else {
                    next();
                }
            });
        } else {
            next();
        }
    } catch (err) {
        next(err);
    }
};
/**
 * [release description]
 *
 * @method release
 *
 * @param  {[type]} req [description]
 *
 * @return {[type]} [description]
 */
var release = function (req) {
    try {
        repMod.doRelease(req, function (error, result) {
            if (error) {
                winston.log('error', 'Error releasing comp lock', error);
            }
        });
    } catch (err) {
        winston.log('error', 'Error releasing comp lock', err);
    }
};
/**
 * using lock for comp routes
 */
router.use(lock);
/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.post('/', function (req, res, next) {
    'use strict';
    try {
        if (!security.isValidData(req.body.layer_id) || // required
            !security.isValidData(req.body.name) || // required
            !security.isValidTypeComp(req.body.type) || // required
            !security.isValidDifficulty(req.body.difficulty) || // required
            !security.isValidLifeCicle(req.body.code_level) || // required
            (!(typeof req.body.platfrm_id != "undefined" && security.isValidData(req.body.platfrm_id)) &&
            !(typeof req.body.suprlay_id != "undefined" && security.isValidData(req.body.suprlay_id))) ||
            !security.ifExistIsValidData(req.body.description) ||
            !security.ifExistIsValidData(req.body.repo_dir)) {
                res.status(412).send({
                    "message": "missing or invalid data"
                });
        } else {
            repMod.addComp(req, function (error, result) {
                if (error) {
                    res.status(200).send(error);
                } else {
                    res.status(201).send(result);
                }
                release(req);
            });
        }
    } catch (err) {
        next(err);
    }
});
/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.get('/', function (req, res, next) {
    'use strict';
    try {
        repMod.listComps(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});
/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.put('/:comp_id/life-cicles/:life_cicle_id', function (req, res, next) {
    'use strict';
    try {
        if (!security.isValidData(req.params.comp_id) || // required
            !security.isValidData(req.params.life_cicle_id) || // required
            !(typeof req.body.target == "undefined" ||
             (typeof req.body.target != "undefined" && security.isValidData(req.body.target))) ||
            !(typeof req.body.reached == "undefined" ||
             (typeof req.body.reached != "undefined" && security.isValidData(req.body.reached)))) {
            res.status(412).send({
                "message": "missing or invalid data"
            });
        } else {
            repMod.uptLifeCiclesToComp(req, function (error, result) {

                if (error) {
                    res.status(200).send(error);
                } else {
                    if (result) {
                        res.status(200).send(result);
                    } else {
                        res.status(404).send({
                            message: "NOT FOUND"
                        });
                    }
                }
                release(req);
            });
        }
    } catch (err) {
        next(err);
    }
});
/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.post('/:comp_id/comp-devs', function (req, res, next) {
    'use strict';
    try {
        if (!security.isValidData(req.params.comp_id) || //
            !security.isValidData(req.body.dev_id) || //
            !security.isValidData(req.body.role) || //
            !security.isValidData(req.body.scope) || //
            !security.isValidData(req.body.percnt)) {
            res.status(412).send({
                "message": "missing or invalid data"
            });
        } else {
            repMod.addCompDev(req, function (error, result) {
               /*
                if (error) {
                    res.status(200).send(error);
                } else {
                    res.status(201).send(result);
                }
                release(req);
                    */
                  if (error) {
                    res.status(200).send(error);
                  } else {
                     if (result) {
                        res.status(201).send(result);
                     } else {
                        res.status(404).send({
                            message: "NOT FOUND"
                        });
                     }
                }
                release(req);


            });
        }
    } catch (err) {
        next(err);
    }
});
/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.put('/:comp_id/comp-devs/:comp_dev_id', function (req, res, next) {
    'use strict';
    try {
        if (!security.isValidData(req.params.comp_id) || // required
            !security.isValidData(req.params.comp_dev_id) || // required
            !(typeof req.body.dev_id == "undefined" ||
             (typeof req.body.dev_id != "undefined" && security.isValidData(req.body.dev_id))) ||
            !(typeof req.body.role == "undefined" ||
             (typeof req.body.role != "undefined" && security.isValidData(req.body.role))) ||
            !(typeof req.body.scope == "undefined" ||
             (typeof req.body.scope != "undefined" && security.isValidData(req.body.scope))) ||
            !(typeof req.body.percnt == "undefined" ||
             (typeof req.body.percnt != "undefined" && security.isValidData(req.body.percnt)))) {
            res.status(412).send({
                "message": "missing or invalid data"
            });
        } else {
            repMod.uptCompDev(req, function (error, result) {

                if (error) {
                    res.status(200).send(error);
                } else {
                    if (result) {
                        res.status(200).send(result);
                    } else {
                        res.status(404).send({
                            message: "NOT FOUND"
                        });
                    }
                }
                release(req);

            });
        }
    } catch (err) {
        next(err);
    }
});
/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.delete('/:comp_id/comp-devs/:comp_dev_id', function (req, res, next) {
    'use strict';
    try {
        if (!security.isValidData(req.params.comp_id) || //
            !security.isValidData(req.params.comp_dev_id) //
        ) {
            res.status(412).send({
                "message": "missing or invalid data"
            });
        } else {
            repMod.delCompDev(req, function (error, result) {
                if (error) {
                    res.status(200).send(error);
                } else {
                    if (result) {
                        res.status(204).send();
                    } else {
                        res.status(404).send({
                            message: "NOT FOUND"
                        });
                    }
                }
                release(req);
            });
        }
    } catch (err) {
        next(err);
    }
});
/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.get('/:comp_id', function (req, res, next) {
    'use strict';
    try {
        repMod.getComp(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                if (result) {
                    res.status(200).send(result);
                } else {
                    res.status(404).send({
                        message: "NOT FOUND"
                    });
                }
                release(req);
            }
        });
    } catch (err) {
        next(err);
    }
});
/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.put('/:comp_id', function (req, res, next) {
    'use strict';
    try {
        if (!security.isValidData(req.params.comp_id) ||
            !security.ifExistIsValidData(req.body.layer_id) ||
            !security.ifExistIsValidData(req.body.name) ||
            !security.ifExistIsValidData(req.body.type) ||
            !security.ifExistIsValidDifficulty(req.body.difficulty) ||
            !(typeof req.body.code_level == "undefined" ||
            (typeof req.body.code_level != "undefined" && security.isValidLifeCicle(req.body.code_level))) ||
            !(typeof req.body.description == "undefined" ||
            (typeof req.body.description != "undefined" && security.isValidData(req.body.description))) ||
            !(typeof req.body.repo_dir == "undefined" ||
            (typeof req.body.repo_dir != "undefined" && security.isValidData(req.body.repo_dir)))) {
             res.status(412).send({"message": "missing or invalid data"});
        } else {
            repMod.uptComp(req, function (error, result) {
                if (error) {
                        res.status(200).send(error);
                } else {
                    if (result) {
                        res.status(200).send(result);
                    } else {
                        res.status(404).send({
                            message: "NOT FOUND"
                        });
                    }
                }
                release(req);

            });
        }
    } catch (err) {
        next(err);
    }
});
/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.delete('/:comp_id', function (req, res, next) {
    'use strict';
    try {
        repMod.delComp(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                if (result) {
                    res.status(204).send();
                } else {
                    res.status(404).send({
                        message: "NOT FOUND"
                    });
                }
            }
            release(req);
        });
    } catch (err) {
        next(err);
    }
});
// comp router export
module.exports = router;
