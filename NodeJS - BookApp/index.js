//import express module 
var express = require('express');
//create an express app
var app = express();
//require express middleware body-parser
var bodyParser = require('body-parser');
//require express session
var session = require('express-session');
var cookieParser = require('cookie-parser');

//set the view engine to ejs
app.set('view engine', 'ejs');
//set the directory of views
app.set('views', './views');
//specify the path of static directory
app.use(express.static(__dirname + '/public'));

//use body parser to parse JSON and urlencoded request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//use cookie parser to parse request headers
app.use(cookieParser());
//use session to store user data between HTTP requests
app.use(session({
    secret: 'cmpe_273_secure_string',
    resave: false,
    saveUninitialized: true
}));

//Only user allowed is admin
var Users = [{
    "username": "admin",
    "password": "admin"
}];
//By Default we have 3 books
var books = [
    { "BookID": "1", "Title": "Book 1", "Author": "Author 1" },
    { "BookID": "2", "Title": "Book 2", "Author": "Author 2" },
    { "BookID": "3", "Title": "Book 3", "Author": "Author 3" }
]
//route to root
app.get('/', function (req, res) {
    //check if user session exits
    if (req.session.user) {
        res.render('home',{
            books: books
        });
    } else
        // res.render('login');
        res.render('login',{displayUserBlock:'none',displayPwdBlock:'none',username:req.body.username,password:req.body.password});
});

app.get('/login', function (req, res) {
    //check if user session exits
    if (req.session.user) {
        res.render('home',{
            books: books
        });
    } else
        // res.render('login');
        res.redirect('/');
});

app.post('/login', function (req, res) {
    if (req.session.user) {
        res.render('home');
    } else {
        console.log("Req Body : ", req.body);
        Users.filter(user => {
            if (user.username === req.body.username && user.password === req.body.password) {
                req.session.user = user;
                res.redirect('/home');
            } else if(user.username !== req.body.username) {
                res.render('login',{displayUserBlock:'block',displayPwdBlock:'none',username:req.body.username,password:req.body.password});
            } else if(user.password !== req.body.password) {
                res.render('login',{displayUserBlock:'none',displayPwdBlock:'block',username:req.body.username,password:req.body.password});
            }
        });
    }

});

app.get('/home', function (req, res) {
    if (!req.session.user) {
        res.redirect('/');
    } else {
        console.log("Session data : ", req.session);
        res.render('home', {
            books: books
        });
    }
});

app.get('/create', function (req, res) {
    if (!req.session.user) {
        res.redirect('/');
    } else {
        res.render('create',{bookid:'',booktitle:'',bookauthor:'',msg:'',display:'none'});
    }
});

app.post('/create', function (req, res) {
    if (!req.session.user) {
        res.redirect('/');
    } else {
        let bookid = req.body.bookid;
        let booktitle = req.body.booktitle;
        let bookauthor = req.body.bookauthor;
        let bookArr = books.filter(book => book['BookID'] === bookid);
        if(bookArr.length == 0) {
            let book = {
                "BookID":bookid,
                "Title":booktitle,
                "Author":bookauthor
            };
            books.push(book);
            return res.redirect('/home');

        } else {
            console.log("booktitle: ", booktitle);
            return res.render('create',{bookid:bookid,booktitle:booktitle,bookauthor:bookauthor,msg:'Book Id already exists',display:'block'});
        }
        
    }
});

app.get('/delete', function (req, res) {
    console.log("Session Data : ", req.session.user);
    if (!req.session.user) {
        res.redirect('/');
    } else {
        res.render('delete',{bookid:'',msg:'',display:'none'});
    }
});

app.post('/delete', function (req, res) {
    let bookid = req.body.bookid;
    console.log('You entered:'+bookid);
    let bookArr = books.filter(book => book['BookID'] !== bookid);
    console.log('bookArr size is:'+bookArr.length+' books actual size is:'+books.length);
    if(bookArr.length == books.length) {
        res.render('delete',{bookid:bookid,msg:'Book id is not present.',display:'block'});
    } else {
        books = bookArr.slice();
        return res.redirect('/home');
    }
});

app.get('/logout', function (req, res) {
    if (!req.session.user) {
        res.redirect('/');
    } else {
        req.session.destroy();
        res.redirect('/');
    }
});

var server = app.listen(3000, function () {
    console.log("Server listening on port 3000");
});