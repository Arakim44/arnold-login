// app/routes.js
var db = require("../model");
var bcrypt = require('bcrypt-nodejs');
var request = require('request-promise');
module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index'); // load the index.handlebar file
        //
    });


    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login', {
            message: req.flash('loginMessage')
        });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
            successRedirect: '/dashboard', // redirect to the secure profile section
            failureRedirect: '/login', // redirect back to the signup page if there is an error
            failureFlash: true // allow flash messages
        }),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
                req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
                req.session.cookie.expires = false;
            }
            res.redirect('/');
        });

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup', {
            message: req.flash('signupMessage')
        });
    });

    // process the signup form
    app.post('/signup', function(req, res) {
			console.log(req.body);
        db.User.findAll({
            where: {
                user_name: req.body.username
            }
        }).then(function(rows) {
            if (rows.length) {
                // return done(null, false,
								req.flash('signupMessage', 'That username is already taken.');
								res.redirect("/signup");
            } else {
                // if there is no user with that username
                // create the user
                var newUserMysql = {
                    user_name: req.body.username,
                    user_password: bcrypt.hashSync(req.body.password, null, null), // use the generateHash function in our user model
										first_name: req.body.firstname,
										last_name: req.body.lastname,
										user_gender: req.body.gender,
										user_age: req.body.age,
										user_weight: req.body.weight,
										fitness_goals: req.body.goals

                };
                db.User.create(newUserMysql).then(function(createdUser) {
                    // return done(null, createdUser);
										req.flash('success_msg', 'You are registered and can now login');
										res.redirect(307, '/login');
									});

								}
							})


    });

// =====================================
// DASHBAROD SECTION =========================
// =====================================
// we will want this protected so you have to be logged in to visit
// we will use route middleware to verify this (the isLoggedIn function)
app.get('/dashboard', isLoggedIn, function(req, res) {
    res.render('dashboard', {
        user: req.user // get the user out of session and pass to template
    });
});


//==================================================
//PROFILE SECTION=================================
//==========================================
app.get('/profile', function(req, res) {
		res.render('profile',{
			user: req.user
		});
});

//=========================
//Edit profile
//====================

  app.get('/editProfile', function(req, res) {
  		res.render('editProfile',{
				user:req.user
			});

		});


 app.post('/editProfile',function(req,res){
	 console.log("********",req.body);
	 var editedUser = {
		 first_name: req.body.firstname,
		 last_name: req.body.lastname,
		 user_gender: req.body.gender,
		 user_age: req.body.age,
		 user_weight: req.body.weight,
		 fitness_goals:req.body.goals
	 }
	 db.User.update(
		 editedUser,
		 {
			where: {
				id: req.user.id
			}
		}).then(function(dbUser){
      res.redirect('/profile')
			});
 });

 app.get('/workout', function(req,res) {
 	res.render('workout')
  });

  //  app.get('/workout', function(req, res){
  //  	request({
  //  		uri: 'http://wger.de/api/v2/exercise',
  //  		qs: {
  //  			apiKey: 'b40df930ca66b964789c1671fac9d48ddee236ba'
  //  		},
  //  		json: true
  //  	})
  //  		.then((data) => {
  //  			console.log(data);
  //  			res.send(data)
  //  		})
  //  		.catch((err) => {
  //  			console.log(err)
  //  			res.send(err)
  //  		})
  //  });


  // =====================================
  // LOGOUT ==============================
  // =====================================
  app.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
  });
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
