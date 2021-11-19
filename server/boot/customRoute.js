module.exports = (app) => {
  app.get('/helloworld', (req, res) => res.send('Hello world'));
};
