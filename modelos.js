const createKnex = require('knex');
const oracledb = require('oracledb');
const crypto = require('crypto');

const NAME_ALREAD_USED_ERROR_CODE = 955;

const {
  DB_USER,
  DB_PASSWORD,
  DB_DATABASE,
  DB_CONNECT_STRING,
  NODE_ENV,
} = process.env;

const DEBUG = NODE_ENV === 'development';

console.log({
  DB_USER,
  DB_PASSWORD,
  DB_DATABASE,
  DB_CONNECT_STRING,
  NODE_ENV,
  DEBUG
})

oracledb.initOracleClient({ libDir: 'C:\\Users\\dougl\\Downloads\\instantclient-basic-windows.x64-21.3.0.0.0\\instantclient_21_3' });

const knex = createKnex({
  client: 'oracledb',
  debug: DEBUG,
  connection: {
    // host: string,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    // domain: string,
    // instanceName: 'DB202204222106',
    debug: DEBUG,
    // requestTimeout: number,
    connectString: DB_CONNECT_STRING,
    // expirationChecker(): boolean,
  },
  wrapIdentifier: (value, origImpl, queryContext) => value, // origImpl(convertToSnakeCase(value))
});
const bookshelf = require('bookshelf')(knex);

const Usuario = bookshelf.model('Usuario', {
  idAttribute: 'ID',
  tableName: 'usuarios',
  requireFetch: false,
  hidden: [
    'SENHA'
  ],
  initialize: function initialize() {
    this.constructor.__super__.initialize.apply(this, arguments);
    // Your initialization code ...

    this.on('saving', (model, attrs, options) => {
      if (!this.get('ID')) {
        this.set('ID', crypto.randomUUID());
      }
    });
  }
});

const Tarefa = bookshelf.model('Tarefa', {
  idAttribute: 'ID',
  tableName: 'tarefas',
  requireFetch: false,
  initialize: function initialize() {
    this.constructor.__super__.initialize.apply(this, arguments);
    // Your initialization code ...

    this.on('saving', (model, attrs, options) => {
      if (!this.get('ID')) {
        this.set('ID', crypto.randomUUID());
      }
    });
  }
});

exports.connectDatabase = async () => {
  try {
    // await knex.raw('DROP TABLE usuarios CASCADE CONSTRAINTS');
    await knex.raw(`
      CREATE TABLE usuarios (
        id    VARCHAR (40)    PRIMARY KEY NOT NULL,
        nome  VARCHAR (200)   NOT NULL,
        email VARCHAR (200)   NOT NULL,
        senha VARCHAR (80)    NOT NULL
      )
    `);
  } catch (err) {
    // ORA-00955: name is already used by an existing object
    if (err.errorNum !== NAME_ALREAD_USED_ERROR_CODE) {
      throw err;
    }
  }
  try {
    // await knex.raw('DROP TABLE tarefas CASCADE CONSTRAINTS');
    await knex.raw(`
      CREATE TABLE tarefas (
        id           VARCHAR (40)     PRIMARY KEY NOT NULL,
        titulo       VARCHAR (300)    NOT NULL,
        data_criacao TIMESTAMP        NOT NULL,
        concluida    char(1)          NOT NULL,
        usuario_id   VARCHAR (40)     NOT NULL,
        CONSTRAINT fk_usuario_id
          FOREIGN KEY (usuario_id)
          REFERENCES usuarios (id)
      )
    `);
  } catch (err) {
    // ORA-00955: name is already used by an existing object
    if (err.errorNum !== NAME_ALREAD_USED_ERROR_CODE) {
      throw err;
    }
  }

  const tables = await knex.raw('select table_name from user_tables order by 1');
  console.log({ tables })
};

exports.Usuario = Usuario;
exports.Tarefa = Tarefa;
