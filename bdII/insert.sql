-- ============================================================
-- BANCO DE DADOS: BIBLIOTECA DE MANGÁS, MANHWAS E LIVROS
-- SGBD: MySQL 8+
-- ============================================================

-- ------------------------------------------------------------
-- LIMPEZA DAS TABELAS
-- ------------------------------------------------------------

DROP TABLE IF EXISTS emprestimos;
DROP TABLE IF EXISTS exemplares;
DROP TABLE IF EXISTS livro_autor;
DROP TABLE IF EXISTS livros;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS autores;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS editoras;


-- ============================================================
-- 1. AUTORES
-- ============================================================

CREATE TABLE autores (
    id_autor INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    nacionalidade VARCHAR(50)
);


-- ============================================================
-- 2. CATEGORIAS / GÊNEROS
-- ============================================================

CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT
);


-- ============================================================
-- 3. EDITORAS
-- ============================================================

CREATE TABLE editoras (
    id_editora INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL UNIQUE,
    cidade VARCHAR(100)
);


-- ============================================================
-- 4. LIVROS / OBRAS
-- ============================================================

CREATE TABLE livros (
    id_livro INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE NOT NULL,
    ano_publicacao INT,
    tipo_obra VARCHAR(30) NOT NULL,
    id_categoria INT NOT NULL,
    id_editora INT NOT NULL,

    CONSTRAINT fk_livro_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categorias(id_categoria),

    CONSTRAINT fk_livro_editora
        FOREIGN KEY (id_editora)
        REFERENCES editoras(id_editora),

    CONSTRAINT chk_tipo_obra
        CHECK (tipo_obra IN (
            'MANGA',
            'MANHWA',
            'MANHUA',
            'LIGHT_NOVEL',
            'WEB_NOVEL',
            'NOVEL',
            'HQ',
            'ROMANCE',
            'CONTO',
            'GRAFICO'
        ))
);


-- ============================================================
-- 5. RELACIONAMENTO LIVRO <-> AUTOR
-- ============================================================

CREATE TABLE livro_autor (
    id_livro INT NOT NULL,
    id_autor INT NOT NULL,

    PRIMARY KEY (id_livro, id_autor),

    CONSTRAINT fk_la_livro
        FOREIGN KEY (id_livro)
        REFERENCES livros(id_livro)
        ON DELETE CASCADE,

    CONSTRAINT fk_la_autor
        FOREIGN KEY (id_autor)
        REFERENCES autores(id_autor)
        ON DELETE CASCADE
);


-- ============================================================
-- 6. EXEMPLARES FÍSICOS
-- ============================================================

CREATE TABLE exemplares (
    id_exemplar INT AUTO_INCREMENT PRIMARY KEY,
    id_livro INT NOT NULL,
    codigo_patrimonio VARCHAR(50) UNIQUE NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'DISPONIVEL',

    CONSTRAINT chk_status_exemplar
        CHECK (status IN (
            'DISPONIVEL',
            'EMPRESTADO',
            'EM_MANUTENCAO',
            'PERDIDO'
        )),

    CONSTRAINT fk_exemplar_livro
        FOREIGN KEY (id_livro)
        REFERENCES livros(id_livro)
        ON DELETE CASCADE
);


-- ============================================================
-- 7. USUÁRIOS
-- ============================================================

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    data_cadastro DATE NOT NULL DEFAULT (CURRENT_DATE)
);


-- ============================================================
-- 8. EMPRÉSTIMOS
-- ============================================================

CREATE TABLE emprestimos (
    id_emprestimo INT AUTO_INCREMENT PRIMARY KEY,
    id_exemplar INT NOT NULL,
    id_usuario INT NOT NULL,

    data_emprestimo DATE NOT NULL DEFAULT (CURRENT_DATE),
    data_prevista_devolucao DATE NOT NULL,
    data_devolucao_real DATE,

    valor_multa DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',

    CONSTRAINT chk_status_emprestimo
        CHECK (status IN (
            'ATIVO',
            'CONCLUIDO',
            'ATRASADO'
        )),

    CONSTRAINT fk_emprestimo_exemplar
        FOREIGN KEY (id_exemplar)
        REFERENCES exemplares(id_exemplar),

    CONSTRAINT fk_emprestimo_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
);


-- ============================================================
-- INSERTS
-- ============================================================


-- ============================================================
-- AUTORES
-- ============================================================

INSERT INTO autores (nome, nacionalidade) VALUES
('Eiichiro Oda', 'Japonesa'),
('Hajime Isayama', 'Japonesa'),
('Naoki Urasawa', 'Japonesa'),
('Makoto Yukimura', 'Japonesa'),
('Hiromu Arakawa', 'Japonesa'),
('Tite Kubo', 'Japonesa'),
('Gege Akutami', 'Japonesa'),
('CLAMP', 'Japonesa'),
('Tatsuki Fujimoto', 'Japonesa'),
('Koyoharu Gotouge', 'Japonesa'),
('Hirohiko Araki', 'Japonesa'),
('Kentaro Miura', 'Japonesa'),
('Sui Ishida', 'Japonesa'),
('Junji Ito', 'Japonesa'),
('Rumiko Takahashi', 'Japonesa'),

('SIU', 'Sul-coreana'),
('Jung Ji-Hoon', 'Sul-coreana'),
('Kim Carnby', 'Sul-coreana'),
('Hwang Young-chan', 'Sul-coreana'),
('SIAN', 'Sul-coreana'),
('Yoon Tae-ho', 'Sul-coreana'),
('Sing N Song', 'Sul-coreana'),

('Mo Xiang Tong Xiu', 'Chinesa'),
('Tian Can Tu Dou', 'Chinesa'),
('Tang Jia San Shao', 'Chinesa'),

('Reki Kawahara', 'Japonesa'),
('Nisio Isin', 'Japonesa'),
('Keiichi Sigsawa', 'Japonesa'),
('Yuyuko Takemiya', 'Japonesa'),
('Kana Akatsuki', 'Japonesa'),

('TurtleMe', 'Estadunidense'),
('Brandon Sanderson', 'Estadunidense'),
('Neil Gaiman', 'Britânica'),
('Ursula K. Le Guin', 'Estadunidense'),
('Andrzej Sapkowski', 'Polonesa'),
('J. R. R. Tolkien', 'Britânica'),
('Agatha Christie', 'Britânica'),
('George Orwell', 'Britânica'),
('Frank Herbert', 'Estadunidense'),
('William Gibson', 'Estadunidense');


-- ============================================================
-- CATEGORIAS
-- ============================================================

INSERT INTO categorias (nome, descricao) VALUES
('Ação', 'Obras com foco em combates e confrontos'),
('Aventura', 'Histórias centradas em viagens, exploração e descobertas'),
('Fantasia', 'Mundos mágicos e elementos fantásticos'),
('Fantasia Sombria', 'Fantasia com temas sombrios e atmosferas pesadas'),
('Romance', 'Histórias centradas em relacionamentos amorosos'),
('Comédia', 'Obras focadas em humor'),
('Drama', 'Narrativas com forte desenvolvimento emocional'),
('Horror', 'Obras voltadas para terror e medo'),
('Mistério', 'Histórias envolvendo enigmas e investigações'),
('Ficção Científica', 'Obras envolvendo ciência, tecnologia e futuros alternativos'),
('Seinen', 'Obras voltadas principalmente ao público adulto'),
('Shoujo', 'Obras voltadas principalmente ao público feminino jovem'),
('Shounen', 'Obras voltadas principalmente ao público masculino jovem'),
('Isekai', 'Personagens transportados ou reencarnados em outros mundos'),
('Slice of Life', 'Histórias sobre situações cotidianas'),
('Artes Marciais', 'Obras centradas em técnicas e combates marciais'),
('Thriller', 'Narrativas com suspense e tensão'),
('Psicológico', 'Histórias focadas na mente e comportamento'),
('Sobrenatural', 'Fenômenos e entidades sobrenaturais'),
('Cyberpunk', 'Alta tecnologia combinada com sociedades distópicas'),
('Histórico', 'Obras ambientadas em períodos históricos'),
('Policial', 'Investigações e crimes'),
('Distopia', 'Sociedades futuras opressivas ou decadentes'),
('Escolar', 'Histórias ambientadas principalmente em escolas'),
('Tragédia', 'Narrativas marcadas por perdas e acontecimentos trágicos'),
("Machado de Assis", "Brasileiro");


-- ============================================================
-- EDITORAS
-- ============================================================

INSERT INTO editoras (nome, cidade) VALUES
('Panini', 'São Paulo'),
('JBC', 'São Paulo'),
('NewPOP', 'São Paulo'),
('Devir', 'São Paulo'),
('Pipoca & Nanquim', 'São Paulo'),
('Intrínseca', 'Rio de Janeiro'),
('DarkSide Books', 'Rio de Janeiro'),
('Aleph', 'São Paulo'),
('HarperCollins Brasil', 'São Paulo'),
('Rocco', 'Rio de Janeiro'),
('Companhia das Letras', 'São Paulo'),
('Todavia', 'São Paulo'),
('Editora Draco', 'São Paulo'),
('Galera Record', 'Rio de Janeiro'),
('Record', 'Rio de Janeiro');


-- ============================================================
-- LIVROS / OBRAS
-- ============================================================

INSERT INTO livros
(titulo, isbn, ano_publicacao, tipo_obra, id_categoria, id_editora)
VALUES

-- ==========================================================
-- MANGÁS
-- ==========================================================

('One Piece - Volume 1',
 '9780000000001', 1997, 'MANGA', 13, 1),

('Attack on Titan - Volume 1',
 '9780000000002', 2009, 'MANGA', 4, 1),

('Monster - Volume 1',
 '9780000000003', 1994, 'MANGA', 17, 5),

('Vinland Saga - Volume 1',
 '9780000000004', 2005, 'MANGA', 21, 4),

('Fullmetal Alchemist - Volume 1',
 '9780000000005', 2001, 'MANGA', 3, 1),

('Bleach - Volume 1',
 '9780000000006', 2001, 'MANGA', 1, 1),

('Jujutsu Kaisen - Volume 1',
 '9780000000007', 2018, 'MANGA', 19, 1),

('Chainsaw Man - Volume 1',
 '9780000000008', 2018, 'MANGA', 4, 1),

('Demon Slayer - Volume 1',
 '9780000000009', 2016, 'MANGA', 1, 2),

('Cardcaptor Sakura - Volume 1',
 '9780000000010', 1996, 'MANGA', 12, 2),

('JoJo''s Bizarre Adventure - Volume 1',
 '9780000000011', 1987, 'MANGA', 1, 1),

('Berserk - Volume 1',
 '9780000000012', 1989, 'MANGA', 4, 5),

('Tokyo Ghoul - Volume 1',
 '9780000000013', 2011, 'MANGA', 18, 1),

('Uzumaki',
 '9780000000014', 1998, 'MANGA', 8, 5),

('Inuyasha - Volume 1',
 '9780000000015', 1996, 'MANGA', 3, 2),


-- ==========================================================
-- MANHWAS
-- ==========================================================

('Tower of God - Volume 1',
 '9780000000016', 2010, 'MANHWA', 2, 3),

('The Boxer - Volume 1',
 '9780000000017', 2019, 'MANHWA', 16, 3),

('Sweet Home - Volume 1',
 '9780000000018', 2017, 'MANHWA', 8, 3),

('Bastard - Volume 1',
 '9780000000019', 2014, 'MANHWA', 17, 3),

('Misaeng - Volume 1',
 '9780000000020', 2012, 'MANHWA', 15, 3),

('Lookism - Volume 1',
 '9780000000021', 2014, 'MANHWA', 15, 3),

('Noblesse - Volume 1',
 '9780000000022', 2007, 'MANHWA', 19, 3),


-- ==========================================================
-- MANHUAS
-- ==========================================================

('Tales of Demons and Gods - Volume 1',
 '9780000000023', 2015, 'MANHUA', 14, 3),

('Soul Land - Volume 1',
 '9780000000024', 2008, 'MANHUA', 3, 3),

('Battle Through the Heavens - Volume 1',
 '9780000000025', 2009, 'MANHUA', 3, 3),


-- ==========================================================
-- LIGHT NOVELS
-- ==========================================================

('Sword Art Online - Volume 1',
 '9780000000026', 2009, 'LIGHT_NOVEL', 14, 2),

('Kino no Tabi - Volume 1',
 '9780000000027', 2000, 'LIGHT_NOVEL', 2, 2),

('Toradora! - Volume 1',
 '9780000000028', 2006, 'LIGHT_NOVEL', 5, 2),

('Violet Evergarden - Volume 1',
 '9780000000029', 2015, 'LIGHT_NOVEL', 7, 2),

('Monogatari - Volume 1',
 '9780000000030', 2006, 'LIGHT_NOVEL', 18, 2),


-- ==========================================================
-- WEB NOVELS
-- ==========================================================

('The Beginning After the End - Volume 1',
 '9780000000031', 2016, 'WEB_NOVEL', 14, 6),

('Omniscient Reader''s Viewpoint - Volume 1',
 '9780000000032', 2018, 'WEB_NOVEL', 14, 3),

('The Legendary Moonlight Sculptor - Volume 1',
 '9780000000033', 2007, 'WEB_NOVEL', 14, 3),


-- ==========================================================
-- NOVELS DE FANTASIA
-- ==========================================================

('O Nome do Vento',
 '9780000000034', 2007, 'NOVEL', 3, 9),

('Mistborn: O Império Final',
 '9780000000035', 2006, 'NOVEL', 3, 6),

('Deuses Americanos',
 '9780000000036', 2001, 'NOVEL', 19, 10),

('A Mão Esquerda da Escuridão',
 '9780000000037', 1969, 'NOVEL', 10, 8),

('O Último Desejo',
 '9780000000038', 1993, 'NOVEL', 3, 9),

('O Senhor dos Anéis: A Sociedade do Anel',
 '9780000000039', 1954, 'NOVEL', 3, 10),

('Duna',
 '9780000000040', 1965, 'NOVEL', 10, 8),

('Neuromancer',
 '9780000000041', 1984, 'NOVEL', 20, 8),


-- ==========================================================
-- MISTÉRIO / POLICIAL
-- ==========================================================

('Assassinato no Expresso do Oriente',
 '9780000000042', 1934, 'NOVEL', 22, 11),

('E Não Sobrou Nenhum',
 '9780000000043', 1939, 'NOVEL', 9, 11),


-- ==========================================================
-- DISTOPIA
-- ==========================================================

('1984',
 '9780000000044', 1949, 'NOVEL', 23, 12),

('Admirável Mundo Novo',
 '9780000000045', 1932, 'NOVEL', 23, 12),


-- ==========================================================
-- ROMANCE / DRAMA
-- ==========================================================

('Orgulho e Preconceito',
 '9780000000046', 1813, 'ROMANCE', 5, 12),

('Flores para Algernon',
 '9780000000047', 1959, 'NOVEL', 7, 8),


-- ==========================================================
-- HQ / GRAPHIC NOVEL
-- ==========================================================

('Sandman - Prelúdios e Noturnos',
 '9780000000048', 1989, 'GRAFICO', 19, 5),

('Watchmen',
 '9780000000049', 1986, 'HQ', 17, 4),

-- ==========================================================
-- REALISMO
-- ==========================================================

("Memorias Postumas de Bras Cubas", "978542221084", "2004", "LIVRO", 26, 12);

-- ============================================================
-- LIVRO <-> AUTOR
-- ============================================================

INSERT INTO livro_autor (id_livro, id_autor) VALUES

-- Mangás
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(7, 7),
(8, 9),
(9, 10),
(10, 8),
(11, 11),
(12, 12),
(13, 13),
(14, 14),
(15, 15),

-- Manhwas
(16, 16),
(17, 17),
(18, 18),
(19, 18),
(20, 21),
(21, 19),
(22, 20),

-- Manhuas
(23, 24),
(24, 25),
(25, 26),

-- Light novels
(26, 27),
(27, 28),
(28, 29),
(29, 30),
(30, 28),

-- Web novels
(31, 31),
(32, 22),
(33, 20),

-- Fantasia
(34, 32),
(35, 33),
(36, 34),
(37, 35),
(38, 36),
(39, 37),
(40, 39),
(41, 40),

-- Mistério
(42, 38),
(43, 38),

-- Distopia
(44, 38),
(45, 34),

-- Romance / drama
(46, 38),
(47, 34),

-- Graphic novel / HQ
(48, 34),
(49, 34),


-- Realismo
(50, 41);

-- ============================================================
-- EXEMPLARES
-- ============================================================

INSERT INTO exemplares
(id_livro, codigo_patrimonio, status)
VALUES

-- One Piece
(1, 'MANGA-0001', 'DISPONIVEL'),
(1, 'MANGA-0002', 'EMPRESTADO'),
(1, 'MANGA-0003', 'DISPONIVEL'),

-- Attack on Titan
(2, 'MANGA-0004', 'EMPRESTADO'),
(2, 'MANGA-0005', 'EM_MANUTENCAO'),

-- Monster
(3, 'MANGA-0006', 'DISPONIVEL'),
(3, 'MANGA-0007', 'PERDIDO'),

-- Vinland Saga
(4, 'MANGA-0008', 'DISPONIVEL'),
(4, 'MANGA-0009', 'EMPRESTADO'),

-- Fullmetal Alchemist
(5, 'MANGA-0010', 'DISPONIVEL'),
(5, 'MANGA-0011', 'DISPONIVEL'),

-- Bleach
(6, 'MANGA-0012', 'EMPRESTADO'),

-- Jujutsu Kaisen
(7, 'MANGA-0013', 'DISPONIVEL'),
(7, 'MANGA-0014', 'EMPRESTADO'),

-- Chainsaw Man
(8, 'MANGA-0015', 'DISPONIVEL'),

-- Demon Slayer
(9, 'MANGA-0016', 'EM_MANUTENCAO'),

-- Cardcaptor Sakura
(10, 'MANGA-0017', 'DISPONIVEL'),

-- JoJo
(11, 'MANGA-0018', 'EMPRESTADO'),

-- Berserk
(12, 'MANGA-0019', 'DISPONIVEL'),
(12, 'MANGA-0020', 'PERDIDO'),

-- Tokyo Ghoul
(13, 'MANGA-0021', 'DISPONIVEL'),

-- Uzumaki
(14, 'MANGA-0022', 'EMPRESTADO'),

-- Inuyasha
(15, 'MANGA-0023', 'DISPONIVEL'),


-- Manhwa
(16, 'MANHWA-0001', 'DISPONIVEL'),
(16, 'MANHWA-0002', 'EMPRESTADO'),

(17, 'MANHWA-0003', 'DISPONIVEL'),

(18, 'MANHWA-0004', 'EMPRESTADO'),

(19, 'MANHWA-0005', 'PERDIDO'),

(20, 'MANHWA-0006', 'DISPONIVEL'),

(21, 'MANHWA-0007', 'EMPRESTADO'),

(22, 'MANHWA-0008', 'DISPONIVEL'),


-- Manhua
(23, 'MANHUA-0001', 'DISPONIVEL'),
(24, 'MANHUA-0002', 'EMPRESTADO'),
(25, 'MANHUA-0003', 'DISPONIVEL'),


-- Light novels
(26, 'LN-0001', 'EMPRESTADO'),
(26, 'LN-0002', 'DISPONIVEL'),

(27, 'LN-0003', 'DISPONIVEL'),

(28, 'LN-0004', 'EMPRESTADO'),

(29, 'LN-0005', 'DISPONIVEL'),

(30, 'LN-0006', 'EM_MANUTENCAO'),


-- Web novels
(31, 'WEB-0001', 'DISPONIVEL'),
(31, 'WEB-0002', 'EMPRESTADO'),

(32, 'WEB-0003', 'DISPONIVEL'),

(33, 'WEB-0004', 'EMPRESTADO'),


-- Novels
(34, 'NOVEL-0001', 'DISPONIVEL'),
(34, 'NOVEL-0002', 'EMPRESTADO'),

(35, 'NOVEL-0003', 'DISPONIVEL'),

(36, 'NOVEL-0004', 'DISPONIVEL'),

(37, 'NOVEL-0005', 'EM_MANUTENCAO'),

(38, 'NOVEL-0006', 'EMPRESTADO'),

(39, 'NOVEL-0007', 'DISPONIVEL'),

(40, 'NOVEL-0008', 'EMPRESTADO'),

(41, 'NOVEL-0009', 'DISPONIVEL'),

-- Mistério
(42, 'MISTERIO-0001', 'EMPRESTADO'),
(43, 'MISTERIO-0002', 'DISPONIVEL'),

-- Distopia
(44, 'DISTOPIA-0001', 'DISPONIVEL'),
(45, 'DISTOPIA-0002', 'EMPRESTADO'),

-- Romance / drama
(46, 'ROMANCE-0001', 'DISPONIVEL'),
(47, 'DRAMA-0001', 'PERDIDO'),

-- HQ
(48, 'HQ-0001', 'DISPONIVEL'),
(49, 'HQ-0002', 'EMPRESTADO'),

-- Realismo
(50, 'REALISMO-0001', 'EMPRESTADO');

-- ============================================================
-- USUÁRIOS
-- ============================================================

INSERT INTO usuarios
(nome, email, telefone, data_cadastro)
VALUES

('Lucas Almeida',
 'lucas.almeida@email.com',
 '11987654321',
 '2026-01-10'),

('Mariana Souza',
 'mariana.souza@email.com',
 '11981234567',
 '2026-01-15'),

('Gabriel Oliveira',
 'gabriel.oliveira@email.com',
 '11976543210',
 '2026-02-03'),

('Ana Beatriz Costa',
 'ana.costa@email.com',
 '11992345678',
 '2026-02-14'),

('Rafael Martins',
 'rafael.martins@email.com',
 '11993456789',
 '2026-03-01'),

('Juliana Ferreira',
 'juliana.ferreira@email.com',
 '11984561234',
 '2026-03-12'),

('Pedro Henrique Lima',
 'pedro.lima@email.com',
 '11995678123',
 '2026-04-05'),

('Camila Rodrigues',
 'camila.rodrigues@email.com',
 '11986753421',
 '2026-04-20'),

('Bruno Carvalho',
 'bruno.carvalho@email.com',
 '11997861234',
 '2026-05-02'),

('Larissa Mendes',
 'larissa.mendes@email.com',
 '11982345671',
 '2026-05-18'),

('Thiago Nascimento',
 'thiago.nascimento@email.com',
 '11993451278',
 '2026-06-07'),

('Beatriz Ramos',
 'beatriz.ramos@email.com',
 '11985671234',
 '2026-07-11');


-- ============================================================
-- EMPRÉSTIMOS
-- ============================================================

INSERT INTO emprestimos
(
    id_exemplar,
    id_usuario,
    data_emprestimo,
    data_prevista_devolucao,
    data_devolucao_real,
    valor_multa,
    status
)
VALUES

-- Empréstimos ativos
(2, 1, '2026-08-20', '2026-09-03', NULL, 0.00, 'ATRASADO'),

(4, 2, '2026-09-01', '2026-09-15', NULL, 0.00, 'ATIVO'),

(9, 3, '2026-08-25', '2026-09-08', NULL, 0.00, 'ATRASADO'),

(13, 4, '2026-09-02', '2026-09-16', NULL, 0.00, 'ATIVO'),

(18, 5, '2026-08-25', '2026-09-08', NULL, 3.50, 'ATRASADO'),

(21, 6, '2026-08-28', '2026-09-11', NULL, 0.00, 'ATIVO'),

(26, 7, '2026-09-03', '2026-09-17', NULL, 0.00, 'ATIVO'),

(31, 8, '2026-08-29', '2026-09-12', NULL, 0.00, 'ATIVO'),

(34, 9, '2026-09-04', '2026-09-18', NULL, 0.00, 'ATIVO'),

(38, 10, '2026-08-20', '2026-09-03', NULL, 5.00, 'ATRASADO'),


-- Empréstimos concluídos
(6, 11, '2026-07-01', '2026-07-15', '2026-07-14', 0.00, 'CONCLUIDO'),

(16, 12, '2026-07-10', '2026-07-24', '2026-07-29', 7.50, 'CONCLUIDO'),

(20, 3, '2026-06-15', '2026-06-29', '2026-06-28', 0.00, 'CONCLUIDO'),

(23, 4, '2026-06-20', '2026-07-04', '2026-07-04', 0.00, 'CONCLUIDO'),

(28, 5, '2026-07-15', '2026-07-29', '2026-07-27', 0.00, 'CONCLUIDO'),

(40, 6, '2026-08-01', '2026-08-15', '2026-08-18', 4.50, 'CONCLUIDO'),

(43, 7, '2026-07-20', '2026-08-03', '2026-08-02', 0.00, 'CONCLUIDO'),

(46, 8, '2026-08-05', '2026-08-19', '2026-08-19', 0.00, 'CONCLUIDO');


