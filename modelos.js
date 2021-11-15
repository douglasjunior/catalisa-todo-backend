const createKnex = require('knex');

const knex = createKnex({
  client: 'sqlite3',
  debug: true,
  useNullAsDefault: true,
  connection: {
    filename: './database/catalisa-todo.sqlite3',
  }
});
const bookshelf = require('bookshelf')(knex);

const Usuario = bookshelf.model('Usuario', {
  tableName: 'usuarios',
  requireFetch: false,
  hidden: [
    'senha'
  ],
});

const Tarefa = bookshelf.model('Tarefa', {
  tableName: 'tarefas',
  requireFetch: false,
});

exports.connectDatabase = async () => {
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id    INTEGER       PRIMARY KEY AUTOINCREMENT NOT NULL,
      nome  VARCHAR (200) NOT NULL,
      email VARCHAR (200) NOT NULL,
      senha VARCHAR (80)  NOT NULL
    );
  `);
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS tarefas (
      id           INTEGER        PRIMARY KEY autoincrement NOT NULL,
      titulo       VARCHAR (300)  NOT NULL,
      data_criacao DATETIME       NOT NULL,
      concluida    BOOLEAN        NOT NULL,
      usuario_id   INTEGER        REFERENCES usuarios (id) NOT NULL
    );
  `);
};

exports.Usuario = Usuario;
exports.Tarefa = Tarefa;
