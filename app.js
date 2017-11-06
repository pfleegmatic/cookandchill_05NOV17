var express          = require("express"),
    app              = express(),
    expressSanitizer = require("express-sanitizer"),
    methodOverride   = require("method-override"),
    bodyParser       = require("body-parser"),
    mongoose         = require("mongoose"),
    fileUpload       = require('express-fileupload'),
    PORT             = process.env.PORT || 8080;


// APP CONFIG
mongoose.connect("mongodb://localhost/food_world_app",{useMongoClient: true});

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(fileUpload());
app.use(methodOverride("_method"));

app.set("view engine", "ejs");


// MONGOOSE/MODEL CONFIG
var mealSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});

var Meal = mongoose.model("Meal", mealSchema);


app.get("/", function(req, res){
  res.redirect("/meals");
});

// INDEX ROUTE
app.get("/meals", function(req, res){
  // RETRIEVE ALL THE MEALS FROM THE DB
  Meal.find({}, function(err, meals){
    console.log('meals', meals);
    if(err){
      console.log("ERROR");
    } else{
      res.render("index", {meals: meals});
    }
  }); 
});

// NEW ROUTE
app.get("/meals/new", function(req,res){
  res.render("new");
});

// CREATE ROUTE
app.post("/meals", function(req, res){
  // create meal
  // req.body.meal.body = req.sanitizer(req.body.meal.body);
//  console.log('req.body.image', req.body.image);
  //console.log('req.body.meal', req.body.meal);
  console.log('req.files.image', req.files.image);
  let newpic = req.files.image;
  //console.log(newpic);
  let newpicName = '/public/images/uploaded/filename.jpg';
  // Use the mv() method to place the file somewhere on your server
  newpic.mv(__dirname + newpicName, function(err) {
    if (err)
      return res.status(500).send(err);
    //res.send('File uploaded!');
  });

  let picPathArray = newpicName.split('/');

  req.body.meal = {};
  req.body.meal.image = '/'+picPathArray[2]
                        +'/'+picPathArray[3]
                        +'/'+picPathArray[4];
  console.log('req.body.meal.image', req.body.meal.image);
  req.body.meal.title = req.body.title;
  req.body.meal.body = req.body.body;
  //req.body.meal.image = 'newpicName';

  Meal.create(req.body.meal, function(err, newMeal){
    if(err){
      console.log('app.post if');
      res.render("new");
    } else{
      console.log('app.post else');
       // then, redirect to the index
      res.redirect("/meals");
    }
  });
});



// SHOW ROUTE
app.get("/meals/:id", function(req, res){
  Meal.findById(req.params.id, function(err, foundMeal){
    if(err){
      res.redirect("/meals");
    } else {
      res.render("show", {meal: foundMeal});
    }
  });
});

// EDIT ROUTE
app.get("/meals/:id/edit", function(req, res){
   Meal.findById(req.params.id, function(err, foundMeal){
       if(err){
           console.log(err);
           res.redirect("/meals");
       } else {
           res.render("edit", {meal: foundMeal});
       }
   });
});

// UPDATE ROUTE
app.put("/meals/:id", function(req, res){
  req.body.meal.body = req.sanitize(req.body.meal.body);
  Meal.findByIdAndUpdate(req.params.id, req.body.meal, function(err, updtedMeal){
       if(err){
           res.redirect("/meals");
       } else {
         res.redirect("/meals/" + req.params.id);
         
       }
   });
});

// DELETE ROUTE
app.delete("/meals/:id", function(req, res){
  // DESTROY MEAL
   Meal.findByIdAndRemove(req.params.id, function(err, Meal){
       if(err){
           res.redirect("/meals");
       } else {
           res.redirect("/meals");
       }
   }); 
});


app.listen(PORT, function() {
  console.log("App listening on PORT: " + PORT);
});