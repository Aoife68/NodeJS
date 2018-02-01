const express = require('express');
const router = express.Router();

//Import Models
let ArticleModel = require('../models/article');//.. to bring to root folder
let UserModel = require('../models/user');

//Add route
router.get('/add',ensureAuthenticated, (req, res)=>{
  //render add_article view
  res.render('add_article', {
    title:'Add Articles'
  });
});

//Get Single Article - Single Article Route
router.get('/:id', (req, res)=>{
  ArticleModel.findById(req.params.id, (err, article)=>{
    UserModel.findById(article.author, (err, user)=>{
      if(err){
        console.log(err);
        return;
      }  else{
        //render article view
        res.render('article', {
          article: article,
          author: user.name
        });
      }
    });
  });
});

//Add Submit POST route for Add Article
router.post('/add', (req, res)=>{
      //Set Validation Rules
      req.checkBody('title', 'Title is required').notEmpty();
    	//req.checkBody('author', 'Author is required').notEmpty();
    	req.checkBody('body', 'Body is required').notEmpty();

      //Get errors
      let errors = req.validationErrors();

      if(errors){
        res.render('add_article', {
          title: 'Add Article',
          errors: errors
        })
      } else{
        //article model will offer structure to the request
        let article = new ArticleModel();
        //body refers to body parser, which parses the request
        article.title = req.body.title;
        //article.author = req.body.author;
        article.author = req.user._id;//user global variable
        article.body = req.body.body;

        //saves to the database
        article.save((err)=>{
          if(err){
            console.log(err);
            return;
          }
          else{
            //Display success message to user
            req.flash('success', 'Article Added');
            //Redirect back to home page
            res.redirect('/');
          }
        });//end article save
      }
});//end app post

//Load Edit Form
router.get('/edit/:id',ensureAuthenticated, (req, res)=>{
  ArticleModel.findById(req.params.id, (err, article)=>{
    //This is to prevent users being able to edit other authors articles
    if(article.author != req.user._id){
      req.flash('danger','Not Authorised');
      res.redirect('/');
    }
    //render edit_article view
    res.render('edit_article', {
      title:'Edit Article',
      article: article
    });
  });
});

//Update Submit POST route for Edit Article
router.post('/edit/:id', (req, res)=>{
  	  //set variable to empty object
      let article ={};

      //get attributes to be added from request
      article.title = req.body.title;
      article.author = req.body.author;
      article.body = req.body.body;

      //query to find id where id equal request id
      let query ={_id:req.params.id}

      //updates instance in the database using model
      //takes query and article object
      ArticleModel.update(query, article, (err)=>{
        if(err){
          console.log(err);
          return;
        }
        else{
          //Display success message to user
          req.flash('success', 'Article Updated');
          //if there's no error redirect back to home page
          res.redirect('/');
        }
      });//end article save
});//end app post

//Delete Article Route
router.delete('/:id', (req, res)=>{
  if(!req.user._id){
    res.status(500).send();
  }
  //req.params.id coming from URL
  let query = {_id:req.params.id}

  ArticleModel.findById(req.params.id, (err, article)=>{
    if(article.author != req.user._id){
      res.status(500).send();
    } else{
      ArticleModel.remove(query, (err)=>{
        if(err){
          console.log(err);
        }
        //Display success message to user
        req.flash('danger', 'Article Deleted');
        res.send('Success');
      });//end ArticleModel
    }
  });
});//end delete


//Access Control
function ensureAuthenticated(req, res, next){
  //isAuthenticated passport function
  if(req.isAuthenticated()){
    return next();
  } else{
    req.flash('danger', 'Please Login');
    //Redirect back to home page
    res.redirect('/users/login');
  }
}


module.exports = router;
