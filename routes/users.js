const express = require('express');
const router = express.Router();
const Joi = require('joi');
const modelos = require('../modelos');
const criptografia = require('../helpers/criptografia');
const jwt = require('../helpers/jwt');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

function validacaoCadastro(request, response, next) {
  const schema = Joi.object({
    nome: Joi.string().min(1).max(200).required(),
    email: Joi.string().email({ tlds: { allow: false } }).max(200).required(),
    senha: Joi.string().min(6).max(80).required(),
  });
  const resultado = schema.validate(request.body);
  if (resultado.error) {
    response.status(400).json(resultado.error);
  } else {
    next();
  }
}

router.post('/', validacaoCadastro, async function (req, res, next) {
  try {
    // SELECT * FROM usuarios WHERE email = 'edvaldoszy@gmail.com'
    const usuarioExistente = await modelos.Usuario
      .where('EMAIL', '=', req.body.email)
      .fetch();
    if (usuarioExistente) {
      res.status(400).json({
        mensagem: 'O endereço de e-mail já está cadastrado'
      });
      return;
    }

    const usuario = new modelos.Usuario({
      NOME: req.body.nome,
      EMAIL: req.body.email,
      SENHA: criptografia.geraHash(req.body.senha),
    });

    const retorno = await usuario.save();
    res.status(201).json(retorno);
  } catch (err) {
    next(err);
  }
});

function validaLogin(req, res, next) {
  const schema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).max(200).required(),
    senha: Joi.string().min(6).max(80).required(),
  });
  const resultado = schema.validate(req.body);
  if (resultado.error) {
    res.status(400).json(resultado.error);
  } else {
    next();
  }
}

router.post('/login', validaLogin, async function (req, res) {
  const usuarioExistente = await modelos.Usuario
    .where('EMAIL', '=', req.body.email)
    .fetch();

  if (usuarioExistente) {
    const senhaEstaCorreta = criptografia.comparaHash(req.body.senha, usuarioExistente.get('SENHA'))
    if (senhaEstaCorreta) {
      const token = jwt.geraToken(usuarioExistente);
      res.json({
        token: token,
        usuario: usuarioExistente,
      });
    } else {
      res.status(401).json({
        mensagem: 'As credenciais são inválidas',
      });
    }
  } else {
    res.status(401).json({
      mensagem: 'As credenciais são inválidas',
    });
  }
});

module.exports = router;
