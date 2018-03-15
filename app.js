const express = require("express");
const bodyParser = require("body-parser");
const path = require("path"); //core module
const expressValidator = require("express-validator");
const mongojs = require("mongojs");
const db = mongojs("customerapp", ["users"]);
const ObjectId = mongojs.ObjectId;

const app = express();
const port = 3000;

/*
const logger = function (request, response, next){
	console.log("Logging...");
	next();
}

//order is important!
app.use(logger); //middleware logger отвечает за логирование HTTP запросов,
*/
/*  parse array
const people = [
	{
		name:'Jeff',
		age: 30
	},
	{
		name:'Serif',
		age: 28
	},
	{
		name:'Spagett',
		age: 40
	}
]
*/
//Middleware functions are executed sequentially, therefore the order of middleware inclusion is important!
//add Middleware for Embedded JS
app.set ('view engine', 'ejs'); //View Engine
app.set('views', path.join(__dirname, 'views')); //specify folder for views

//add Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//set Middleware for Static Folder to put static resources(css, json)
app.use(express.static(path.join(__dirname, 'public'))); //со статическим контентом (css, javascript, картинки)

//Set Global Vars
app.use((req,res,next)=>{
	res.locals.errors = null; //add errors to global vars
	next();
})

// Express-validator middleware for forms in html
app.use(expressValidator({
   errorFormatter: function(param, msg, value) {
       var   namespace = param.split('.'),
             root      = namespace.shift(),
             formParam = root;

     while(namespace.length) {
       formParam += '[' + namespace.shift() + ']';
     }
     return {
       param : formParam,
       msg   : msg,
       value : value
     };
   }
 }));
/*
const users = [
	{
		id: 1,
		fname:'Tor',
		lname:'Jagger',
		email:'sj@maill'
	},
	{
		id: 2,
		fname:'Fer',
		lname:'Johnson',
		email:'gj@maill'
	},
	{
		id: 3,
		fname:'Vas',
		lname:'Dogg',
		email:'md@maill'
	}
]
*/
//request to homepage '/'
app.get('/', (request, response) => {  //POST is submitting data to server
	//response.send("Hello there");
	//response.json(people); //parse array
	db.users.find(function (err, docs) {
		// docs is an array of all the documents in mycollection
		response.render('index', {
			title:'Customers',
			users: docs //mb changed to users
		}); //ejs parsing string and array	
	})	
});

app.post("/users/add", (request, response) => {
	
	//rules for form fields
	request.checkBody("fname", "First name is required").notEmpty();
	request.checkBody("lname", "Last name is required").notEmpty();
	request.checkBody("email", "E-mail is required").notEmpty();

	const errors = request.validationErrors();

	if(errors){  //rerender the form
		db.users.find(function (err, docs) {
			// docs is an array of all the documents in mycollection
			response.render('index', {
				title:'Customers',
				users: docs, //mb changed to users,
				errors: errors
			}); //ejs parsing string and array	
		})
	} else {
		let newUser = {
			fname: request.body.fname,
			lname: request.body.lname,
			email: request.body.email,
		}
		//add new record to DB
		db.users.insert(newUser, (err, result)=>{
			if(err)
				console.log(err);
			else
				response.redirect('/');
		});
	}	
});

app.delete("/users/delete/:id", (req,res)=>{
	db.users.remove({_id: ObjectId(req.params.id)}, (err)=>{
		if(err) console.log(err);
		res.redirect('/');
	}); 
});

app.listen(3000, () => console.log(`Server has started on port ${port}...`));
