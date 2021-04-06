const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

//packages for sessions
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express() ;
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


app.use(session({
    secret : "this is a strong secret",
    resave : false,
    saveUninitialized :false
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  mongoose.connect("mongodb://localhost:27017/vannaDB",  {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
mongoose.set("useCreateIndex",true);


const userSchema = new mongoose.Schema({
   username : String  ,
    password: String
  });
  
  userSchema.plugin(passportLocalMongoose);
  
  const User = mongoose.model("User", userSchema);
  
  passport.use(User.createStrategy());
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  

  const detailSchema = new mongoose.Schema({
    name : String  ,
    email : String,
    phone : String,
    address : String
   });
const Detail = mongoose.model("Detail", detailSchema);


  app.get("/",function(req,res){
      res.render("login");
  })


  app.get("/register",function(req,res){
    res.render("register");
});

  app.post("/register", function(req, res) { 
      if(req.body.password == req.body.copassword)
      {

        const newDeatil= new Detail({
            name : req.body.name ,
            email : req.body.username,
            phone : req.body.phone,
            address : req.body.address
        });
      
        newDeatil.save();

    User.register({username:req.body.username}, req.body.password, function(err, user) {
      if (err) 
      {
           res.send("error, try again.");
      }
    
      else{
        passport.authenticate("local")(req,res,function(){
         res.redirect("/details");
           });
         }
      
        });
     }    

     else
     {
        res.send("password do not match . try again!");
     }
    
 });




 app.post("/login", function(req, res) {
   const user = new User({
          username : req.body.username,
           password : req.body.password
        });
        req.login(user,function(err)
        {
          if(err)
          {
            Console.log(err);
          }
          else
          {
            passport.authenticate("local")(req,res,function(){
              res.redirect("/details");
            });
          }
      
        });
      });
    


      
 app.get("/details",function(req,res){
    if(req.isAuthenticated())
    {
     Detail.find({email:req.user.username},function(err,found)
     {
       if(err)
       {
           console.log(err);
       }

       else{
        res.render("details", {foundDetailsInejs : found});
        // res.send(found);
       }
     });
     
   
 }

 else
 {
   res.redirect("/");
 }

 });




 app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
    });
    
  app.listen(process.env.PORT || 3000, function(){
    console.log("Server started at port 3000.")
  });