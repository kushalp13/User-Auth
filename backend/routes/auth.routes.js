// routes/auth.routes.js

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const path = require('path');
const userSchema = require("../models/User");
const authorize = require("../middlewares/auth");
const { check, validationResult } = require('express-validator');
const _ = require("lodash");
let multer = require("multer");

//Multer file upload configuration
const DIR = './public';

const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,DIR);
    },
    filename: (req,file,cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null,fileName);
    }
});

var upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: (req,file,cb) => {
        if(file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null,true);
        }else{
            console.log("file format error! \n");
            cb(null,false);
            return cb(new Error("only .png, .jpg and .jpeg format is allowed!"));
        }
    }
});

//Multer Config. ends










//Nodemailar config
var  hbs = require('nodemailer-express-handlebars'),

//email password are not set
  email = 'your_email@service.com', 
  pass = 'password'
  nodemailer = require('nodemailer');

var smtpTransport = nodemailer.createTransport({
  service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
  auth: {
    user: email,
    pass: pass
  },
  from: email, 
});


var handlebarsOptions = {
//   viewEngine: 'handlebars',
viewEngine: {
    extName: '.html',
    // partialsDir: 'views',//your path, views is a folder inside the source folder
    // layoutsDir: 'views',
    defaultLayout: ''//set this one empty and provide your template below,
  },
  viewPath: path.join(__dirname,'/templates'),
  extName: '.html',
};

smtpTransport.use('compile', hbs(handlebarsOptions));
//Nodemailar Config. ends


// Sign-up
router.post("/register-user",upload.single('avatar'),
    [
        check('name')
            .not()
            .isEmpty()
            .isLength({ min: 3 })
            .withMessage('Name must be atleast 3 characters long'),
        check('email', 'Email is required')
            .not()
            .isEmpty(),
        check('password', 'Password should be between 5 to 8 characters long')
            .not()
            .isEmpty()
            .isLength({ min: 5, max: 8 })
    ],(req, res, next) => {
        const errors = validationResult(req);
        const url = req.protocol + '://' + req.get('host')
        if (!errors.isEmpty()) {
            return res.status(422).jsonp(errors.array());
        }
        else {
            bcrypt.hash(req.body.password, 10).then((hash) => {
                const user = new userSchema({
                    name: req.body.name,
                    email: req.body.email,
                    password: hash,
                    age: req.body.age,
                    gender: req.body.gender,
                    avatar: url + '/public/' + req.file.filename
                });
                user.save().then((response) => {
                    console.log("User " + user.email + " just registered! \n");
                    res.status(201).json({
                        message: "User successfully created!",
                        result: response
                    });
                }).catch(error => {
                    res.status(500).json({
                        error: error
                    });
                });
            });
        }
    });


// Sign-in
router.post("/signin", (req, res, next) => {
    let getUser;
    userSchema.findOne({
        email: req.body.email
    }).then(user => {
        console.log(user);
        if (!user) {
            return res.status(401).json({
                message: "Authentication failed"
            });
        }
        getUser = user;
        return bcrypt.compare(req.body.password, user.password);
    }).then(response => {
        if (!response) {
            return res.status(401).json({
                message: "Authentication failed"
            });
        }
        console.log("ok giving you jwt token ok!");
        let jwtToken = jwt.sign({
            email: getUser.email,
            userId: getUser._id
        }, "longer-secret-is-better", {
            expiresIn: "1h"
        }, (err,data) => {
            if(err) {
                console.log(err);
            }else{
                console.log(data);
            }
        });
        res.status(200).json({
            token: jwtToken,
            expiresIn: 3600,
            msg: getUser
        });
    }).catch(err => {
        return res.status(401).json({
            message: "Authentication failed"
        });
    });
});

// Get Users
router.route('/').get(authorize, (req, res) => {
    userSchema.find((error, response) => {
        if (error) {
            return next(error)
        } else {
            res.status(200).json(response)
        }
    })
})

// Get Single User
router.route('/user-profile/:id').get((req, res, next) => {
    userSchema.findById(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                msg: data
            })
        }
    })
})

// Update User
router.route('/update-user/:id').put((req, res, next) => {
    userSchema.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.json(data)
        }
    })
})


// Delete User
router.route('/delete-user/:id').delete((req, res, next) => {
    userSchema.findByIdAndRemove(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                msg: data
            })
        }
    })
})


//Forgot password
router.route('/forgot-password').post((req,res) => {
    userSchema.findOne({
        email: req.body.email
    }).then(user => {
        if(!user) {
            return res.status(401).json("User does not exist!! \n");
        }
        var token = jwt.sign({_id: user.id},"longer-secret-is-better", {expiresIn: "20m"});

        userSchema.findByIdAndUpdate(user._id, {resetToken: token}, (err,data) => {
            if(err) {
                res.status(400).json(err);
            }
        })


        var data = {
            to: user.email,
            from: email,
            template: 'forgot-password-email',
            subject: 'Password help has arrived!',
            context: {
              url: 'http://localhost:4200/reset-password?token=' + token,
              name: user.name
            }
        }

        smtpTransport.sendMail(data, function(err) {
            if (!err) {
                console.log("Password update email sent to " + user.email + "\n");
              return res.json({ message: 'Kindly check your email for further instructions' });
            }else{
                return res.json(err);
            }
        });
    }).catch(err => {
        return res.status(401).json({
            message: "Authentication failed"
        });
    });
})


//Reset Password
router.route('/reset-password').post((req,res) => {
    let newpass = req.body.newpass;
    let repass = req.body.repass;
    const gettoken = req.body.token;
    if(repass == newpass) {
        if(gettoken) {
            jwt.verify(gettoken,"longer-secret-is-better", (err,data) => {
                if(err) {
                    res.status(401).json({
                        error: "Incorrect token or token expired!"
                    })
                }
                userSchema.findOne({resetToken: gettoken},(err,user) => {
                    if(err || !user) {
                        return res.status(400).json({
                            error: "User with this token does not exist!"
                        })
                    }
                    bcrypt.hash(newpass, 10, (err,hash) => {
                        const obj = {
                            password: hash,
                            resetToken: ''
                        }
                        user = _.extend(user,obj);
                        user.save((err,result) => {
                            if(err) {
                                return res.status(400).json({
                                    error: "reset password error!!"
                                })
                            }else{
                                var data = {
                                    to: user.email,
                                    from: email,
                                    template: 'reser-password-email',
                                    subject: 'Password updated!',
                                    context: {
                                      name: user.name
                                    }
                                }
                                smtpTransport.sendMail(data, function(err) {
                                });
                                
                                console.log("password updated! \n")
                                return res.status(200).json({
                                    msg: "Your password is successfully changed!"
                                })
                            }
                        })
                    });
                })
            });
        }
    }
});

module.exports = router;