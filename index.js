const fastify = require('fastify');
const pug = require('fastify-pug');
const path = require('path');
const fastifySession = require('fastify-session');
const fastifyCookie = require('fastify-cookie')
const fastifyFormbody = require('fastify-formbody')
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function() {
});


const Recipe = require('./models/recipe');
const recipeRoute = require('./routes/recipe');

const app = fastify({logger: true});

app.register(pug, { 
  views: 'views', 
  filename: path.join(__dirname, '/views/') 
});
app.register(fastifyFormbody)
app.register(fastifyCookie)
app.register(fastifySession, {
  cookieName: 'sessionId',
  secret: 'a secret with minimum length of 32 characters',
  cookie: { secure: false },
  expires: 1800000
})

app.get('/', async (req, res) => {
  res.render('index');
});


app.get('/new', async (req, res) => {
  //if(req.session.authenticated) {
    res.render('new-recipe');
  //} else {
    //res.redirect('/login');
  //}
});


app.get('/home', async (req, res) => {

  let recipes = [];
  recipes = await Recipe.find({});

  //if(req.session.authenticated) {
    res.render('home', { recipes });
  //} else {
    //res.redirect('/login');
  //}
});

app.get('/signup', async (req, res) => {
  res.render('signup');
});

app.get('/login', async (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (password === 'test') {
    req.session.authenticated = true
    res.redirect('/home')
  } else {
    res.redirect(401, '/login')
  }
});

app.get('/logout', (request, reply) => {
    if (request.session.authenticated) {
      request.destroySession((err) => {
        if (err) {
          reply.status(500)
          reply.send('Internal Server Error')
        } else {
          reply.redirect('/')
        }
      })
    } else {
      reply.redirect('/')
    }
  });

// Recipe routes
//
app.get('/recipe/:id', recipeRoute.show);
app.post('/recipe/new', recipeRoute.create);
app.get('/recipe/edit/:id',recipeRoute.edit);
app.post('/recipe/update/:id', recipeRoute.update);

app.get('/recipes', async (req, res) => {
  const recipes = await Recipe.find(req.query);
  if(Object.keys(req.query).length > 0) {
  const _query = JSON.stringify({ ...req.query });
  res.render('recipes', { recipes, query: _query   });
  } else {
  res.render('recipes', { recipes   });
  }
});


const start = async () => {
  try {
    await app.listen(process.env.PORT);
  } catch(err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

