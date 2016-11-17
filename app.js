var express 			= require('express');
var app 				= express();
var bodyParser 			= require('body-parser');
var mongoose 			= require('mongoose');
var secretKey 			= '52110000';		// secret key given to the admin only
var admin 				= 'chawkihassan'; 	// username of the admin
var password 			= '123';			// password of the admin
var clientname 			= 'clientname';		// client usename
var clientpassword 		= 'client123';		// client password
var path 				= require('path');
var multer 				= require('multer');// upload images using this tool npm install --save multer

//setting the parser + uploads and public directories
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(express.static('uploads'));
app.set('view engine', 'ejs');

//connecting the database to the server
mongoose.connect('mongodb://jadrehaoui:database123@ds151927.mlab.com:51927/jadrehaouidatabase',function(err, db){
	if(err){
		console.log('local6 database is disconnected');
	} else {
		console.log('local6 database is connected');
	}
});

//collections schemas
var allproducts = new mongoose.Schema({
	productname: String,
	productprice: Number,
	productid: Number,
	productsize: Number,
	setofprod: String,
	productgender: String,
	productspecial: String,
	quantity: Number,
	productimg: String
});
var carouselimages = new mongoose.Schema({
	image: String,
	imageid: String,
	first: String
});
var product = mongoose.model('product', allproducts);
var carouselimage = mongoose.model('carouselimage', carouselimages);

//home route
app.get('/', function(req, res){
	var products;
	product.find({'productspecial': 'yes'}, function(err, obj){
		if(err){
			console.log('ERROR !!');
		} else {
			products = obj;
		}
	});
	carouselimage.find({},function(err, obj){
		if(err){
			console.log('ERROR !!');
		} else {
			res.render('home', {
				prod: products,
				carousel: obj
			});
		}
	})
});

//section route : all, man, woman, search
app.get('/:section', function(req, res){
	if(req.params.section == 'about'){
		res.render('about');
	} else if(req.params.section == 'services'){
		res.render('services');
	} else if(req.params.section == 'contact') {
		res.render('contact');
	} else if(req.params.section == 'login'){
		res.render('login');
	} else if(req.params.section == 'all'){
		product.find({},function(err, obj){
			if(err){
				console.log('ERROR !!');
			} else {
				res.render('all', {prod: obj, name: 'Todos'});
			}
		})
	} else if(req.params.section == '/search'){
		var search = req.body.search;
		product.find({}, function(err, obj){
			if (err){
				console.log('ERROR !!');
			} else {
				res.render('section', {prod: obj})
			}
		})
	} else if(req.params.section == 'woman'){
		product.find({'productgender':'female'},function(err, obj){
			if(err){
				console.log('ERROR !!');
			} else {
				res.render('section', {prod: obj, name: 'Dama'});
			}
		});
	} else if (req.params.section == 'man'){
		product.find({'productgender':'male'},function(err, obj){
			if(err){
				console.log('ERROR !!');
			} else {
				res.render('section', {prod: obj, name: 'Hombre'});
			}
		});
	} else if(req.params.section == 'kids') {
		product.find({'productgender': 'kids'}, function(err, obj){
			if(err){
				console.log('ERROR !!');
			}else {
				res.render('section', {prod: obj , name : 'Niños'});
			}
		});
	} else if (req.params.section == 'admin'){
		res.render('adminlogin');
	} else {
		res.redirect('/');
	}
});

//client login
app.post('/client',function(req, res){
	if(req.body.username == clientname && req.body.password == clientpassword){
		var man;
		product.find({'productgender': 'male'},function(err, obj){
			if (err){
				console.log("ERROR !!");
			} else {
				man = obj;
			}
		});
		product.find({'productgender': 'female'},function(err, obj){
			if(err){
				console.log('ERROR !!');
			}else {
				res.render('priced', {prodman: man , prodwoman: obj});
			}
		})
		
	} else {
		res.redirect('/');
	}
});

//search post method 
app.post('/search', function(req, res){
	product.find({'productname': capitalize(req.body.search)}, function(err, obj){
		if(err){
			console.log('ERROR !!');
		} else {
			res.render('section', {prod: obj, name: capitalize(req.body.search)})
		}
	})
});

//admin login
app.post('/admin', function(req, res){
	if(req.body.sessionkey === secretKey && req.body.username == admin  && req.body.password == password ){
		res.render('control');
	} else {
		console.log(req.body)
		res.redirect('/');
	}
});
app.post('/seeproducttable', function(req, res){
	if(req.body.order == 'see'){
		product.find({}, function(err, db){
			if(err){
				console.log('ERROR !!');
			} else {
				res.render('products', {prod: db});		
			}
		})
	} else {
		res.render("control");
	}
})
//using multer to upload the photo
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
var upload = multer({ storage: storage });

//route to add/remove/modify a product
app.post('/addproduct', upload.single('image'), function(req, res){
	product.create({
		productname: capitalize(req.body.productname),
		productprice: req.body.productprice,
		productid: req.body.productId,
		productsize: req.body.size,
		setofprod: req.body.set,
		productgender: req.body.productgender,
		productspecial: req.body.special,
		quantity: req.body.quantity,
		productimg: 'https://storage.googleapis.com/jadrehaoui/'req.file.filename
	}, function(err, db){
		if(err){
			console.log('ERROR !!');
		} else {
			res.render('control');
		}
	});
});
app.post('/removeproduct', function(req, res){
	product.remove({
		'productid': req.body.productid
	}, function(err, db){
		if(err){
			console.log('ERROR !!');
		} else {
			res.render('control');
			console.log('removed');
		}
	})
});
app.post('/modifyproduct', function(req, res){
	product.update({
		'productid':req.body.tomodify
	},{$set: {
		'productid': req.body.productId,
		'productprice': req.body.productprice,
		'quantity': req.body.quantity
	}}, function(err, db){
		if(err){
			console.log('ERROR !!');
		} else {
			res.render('control');
		}
	} )
});

//post method to add/remove an image to the carousel
app.post('/removefromcarousel', function(req, res){
	carouselimage.remove({
		'imageid': req.body.imageid
	}, function(err, db){
		if(err){
			console.log('ERROR !!');
		} else {
			console.log(req.body.imageid)
			res.render('control');
		}
	})
})
app.post('/addtocarousel', upload.single('image'),function(req, res){
	carouselimage.create({
		image: req.file.filename,
		imageid: req.body.imageid,
		first: req.body.first
	}, function(err, db){
		if(err){
			console.log('ERROR !!');
		} else {
			console.log(db);
			res.render('control');
		}
	})
});


//listen on port 3000
app.listen(process.env.PORT || 3000);

//to capitalize the text in the search and to save in the db capitalized
function capitalize(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}