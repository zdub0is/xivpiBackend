const { connect } = require('../controllers/connection')
// const db = require('../database/dbms')
// const DB = new db(dbms) //instantiate the db connection

// Helper function to build filter
function buildFilter(query, id) {
  const filter = {};
  const conditions = [
    { key: 'noRecipe', path: 'Recipes', op: '$eq', type: 'string' },
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



module.exports = function(app) {

  app.route('/api/:id')
    .get(async (req, res) => {
      console.log(req.path)

      if (Object.entries(req.query).length < 1) res.json({ error: "One or more parameters are required." })
      const db = await connect()
      const filter = buildFilter(req.query)
      console.log(filter)
      const proj = { projection :{
        Name : 1,
        Recipes : 1,
        shopPrice : 1,
        shopSellPrice : 1,
        [`marketboard.${req.params.id}`] : 1
      }}
      const results = await db.find(filter, proj).toArray();
      console.log(results)
      res.json(results);
    })


}