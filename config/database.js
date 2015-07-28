module.exports = {
  development: {
    'url': 'mongodb://localhost/memorymatrix'
  },
  production: {
    'url': process.env.MONGOLAB_URI
  }
};