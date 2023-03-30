const { connect } = require('../controllers/connection')
// const db = require('../database/dbms')
// const DB = new db(dbms) //instantiate the db connection

// Helper function to build filter
function buildFilter(query, id) {
  console.log(query)
  const filter = {};
  const conditions = [
    { key: 'noRecipe', path: 'Recipes', op: '$eq', type: 'string' },
    { key: 'recipe', path: 'Recipes', op: '$ne', type: 'string' },
    { key: 'id', path: '_id', op: '$eq', type: 'string' },
    { key: 'name', path: 'Name', op: "$regex", type: 'int' },
    { key: 'splt', path: 'shopPrice', op: '$lt', type: 'int' },
    { key: 'spgt', path: 'shopPrice', op: '$gt', type: 'int' },
    { key: 'slt', path: 'shopSellPrice', op: '$lt', type: 'int' },
    { key: 'sgt', path: 'shopSellPrice', op: '$gt', type: 'int' },
    { key: 'slt', path: `marketboard.${id}.saleVelocity`, op: '$lt', type: 'int' },
    { key: 'sgt', path: `marketboard.${id}.saleVelocity`, op: '$gt', type: 'int' },
  ]
  for (const condition of conditions) {
    const { key, op, type } = condition;
    const value = query[key];
    if (value !== undefined) {
      const convertedValue = type === 'int' ? parseInt(value) : type === 'float' ? parseFloat(value) : value;
      filter[condition.path] = { [op]: convertedValue };
    }
  }

  return filter;
}

const typesOfFuel = {
  2: "Fire Shard",
  3: "Ice Shard",
  4: "Wind Shard",
  5: "Earth Shard",
  6: "Lightning Shard",
  7: "Water Shard",
  8: "Fire Crystal",
  9: "Ice Crystal",
  10: "Wind Crystal",
  11: "Earth Crystal",
  12: "Lightning Crystal",
  13: "Water Crystal",
  14: "Fire Cluster",
  15: "Ice Cluster",
  16: "Wind Cluster",
  17: "Earth Cluster",
  18: "Lightning Cluster",
  19: "Water Cluster"
}

async function getRecipeTree(item, db) {
  console.log(item._id)

  let recipeTree = {}
  let recipe;
  if (item.Recipes === "No recipes") {
    item.Recipes = null;
    return item  //return the item since we don't need to go deeper on it
  }
  recipeTree = item //easier to access
  recipe = item.Recipes //easier to access
  let ing = {} //this is an object that will hold the list of recipes
  let subrecipes = [];
  let temp;
  for (let [k, v] of Object.entries(recipe)) { // looping if theres multiple recipes
    for (let [k1, v1] of Object.entries(v.ingredients)) { //looping through the ingredients
      if (k1 == -1) {
        continue
      }
      if (k1 > 2 && k1 < 19) { //if the ingredient is a fuel
        subrecipes.push({ quantity: v1, name: typesOfFuel[k1], hasRecipe: false, recipe: null })
        continue
      }
      temp = await getRecipeTree(await db.findOne({ _id: k1 }), db) //get the recipe tree of the ingredient
      if (temp.Recipes == null) { //if the ingredient has no recipe
        subrecipes.push({ quantity: v1, name: temp.Name, hasRecipe: false, recipe: null })
      } else { //if the ingredient has a recipe
        subrecipes.push({ quantity: v1, name: temp.Name, hasRecipe: true, recipe: temp.Recipes })
      }

    }
    ing[k] = { job: v.job, lvl: v.lvl, ingredients: subrecipes } //push the recipe to the list of recipes
    subrecipes = [] //reset the subrecipes

  }
  recipeTree.Recipes = ing //set the recipe tree to the list of recipes
  return recipeTree //return the recipe tree
}



module.exports = function(app) {

  app.route('/api/:id')
    .get(async (req, res) => {
      console.log(req.path)
      console.log(req.query)
      // if (Object.entries(req.query).length < 1) res.json({ error: "One or more parameters are required." })
      if ("noRecipe" in req.query) {
        if (req.query.noRecipe === 'true') req.query.noRecipe = "No recipes"
        else {
          delete req.query.noRecipe
          req.query.recipe = "No recipes"
        }
      }
      else if ("hasRecipe" in req.query) {
        delete req.query.noRecipe
        req.query.recipe = "No recipes"
      }
      const db = await connect()
      const filter = buildFilter(req.query)
      console.log(filter)
      const proj = {
        projection: {
          Name: 1,
          Recipes: 1,
          shopPrice: 1,
          shopSellPrice: 1,
          [`marketboard.${req.params.id}`]: 1
        }
      }
      const results = await db.find(filter, proj).toArray();
      console.log("results received, sending...")
      res.json(results);
    })

  app.route('/api/recipetree/:id')
    .get(async (req, res) => {
      console.log("received recipetree request")
      let id = req.params.id;
      console.log(id)
      const db = await connect()
      const item = await db.findOne({ _id: id })
      console.log(item)
      let results = await getRecipeTree(item, db)
      res.json(results)
    })
}