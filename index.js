const fastify = require('fastify');
const pug = require('fastify-pug');
const path = require('path');
const fastifySession = require('fastify-session');
const fastifyCookie = require('fastify-cookie')
const fastifyFormbody = require('fastify-formbody')
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/currynation', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function() {
});

const recipeSchema = new mongoose.Schema({
  name: String,
  preference: String,
  type: String,
  cuisine: String,
  servings: Number,
  cookingTime: Number,
  difficulty: String,
  ingredients: String
});
const Recipe = mongoose.model('Recipe', recipeSchema);

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

app.post('/new', async (req, res) => {
  const recipe = new Recipe(req.body);

  try {
    await recipe.save();
    console.log('recipe created');
  } catch(err) {
    console.log(err);
  }

  res.redirect('/home');

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

app.get('/recipe/:id', async (req, res) => {
  const { id } = req.params;
  const recipe = await Recipe.findById(id);
  res.render('recipe', { recipe  });
});

app.get('/recipe/edit/:id', async (req, res) => {
  const { id } = req.params;
  const recipe = await Recipe.findById(id);
  res.render('edit-recipe', { recipe  });
});


const start = async () => {
  try {
    await app.listen(3000);
  } catch(err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

