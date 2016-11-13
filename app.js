var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cons = require('consolidate'),
    dust = require('dustjs-helpers'),
    pg = require('pg'),
    app = express();

//DB connect string
var connect = "postgres://Min:*******@localhost:5433/recipebookdb";

//assign dust engine to .dust files
app.engine('dust', cons.dust);

app.set('view engine', 'dust');
app.set('views', __dirname + '/views');

//set public folder
app.use(express.static(path.join(__dirname, 'public')));

//bodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res){
    res.render('home');
});

app.get('/myrecipe', function(req, res){
    //Postgres Connection
    pg.connect(connect, function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      //select all from recipes
      client.query('SELECT * FROM recipes', function(err, result) {

        if(err) {
          return console.error('error running query', err);
        }
        res.render('main', {recipes: result.rows});
        //call `done()` to release the client back to the pg
        done();
      });
    });
});




app.post('/add', function(req, res){
      
      pg.connect(connect, function(err, client, done) {
        if(err) {
          return console.error('error fetching client from pool', err);
        }
        client.query('INSERT INTO recipes(name, ingredients, directions) VALUES($1, $2, $3)', [req.body.name, req.body.ingredients, req.body.directions]);
          // this will replace the placeholders in value
          done();
          res.redirect('/myrecipe');
    });
});

app.delete('/delete/:id', function(req, res){
        pg.connect(connect, function(err, client, done) {
        if(err) {
          return console.error('error fetching client from pool', err);
        }
        client.query('DELETE FROM recipes WHERE id = $1', [req.params.id]);
          // this will replace the placeholders in value
          done();
          res.send(200);
          //200 means everything is okay
    });
});

app.post('/edit', function(req, res){
    pg.connect(connect, function(err, client, done) {
        if(err) {
          return console.error('error fetching client from pool', err);
        }
        client.query('UPDATE recipes SET name=$1, ingredients=$2, directions=$3 WHERE id=$4', [req.body.name, req.body.ingredients, req.body.directions, req.body.id]);
          // this will replace the placeholders in value
          done();
          res.redirect('/myrecipe');
    });
});

//server
app.listen(3000, function(){
    console.log('Go to localhost 3000');
});
