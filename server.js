const express = require('express')
const cors = require('cors')
const api = require('./routes/api')

const app = express();
const PORT = 3000;

app.use(cors())

app.route('/')
  .get((req, res) => {
    res.send("You have tried to access the backend of the XIV Profit Index App. Please access it from zdub0is.github.io/xivpi") //placeholder
  })

//api routing
api(app)

//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

app.listen(PORT || 3000, () => {
  console.log(`Listening on Port ${PORT || 3000}`)
})