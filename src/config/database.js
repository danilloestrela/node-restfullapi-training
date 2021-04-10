module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: 'your-pass',
  database: 'your-database',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
