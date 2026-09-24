CREATE DATABASE IF NOT EXISTS cadastro;
USE cadastro;

CREATE TABLE aluno (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    nome               VARCHAR(100) NOT NULL,
    email              VARCHAR(100) NOT NULL,
    curso              VARCHAR(50),
    genero             VARCHAR(20),
    receberEmail       BOOLEAN,
    receberNotificacao BOOLEAN,
    rua                VARCHAR(100),
    cidade             VARCHAR(50)
);