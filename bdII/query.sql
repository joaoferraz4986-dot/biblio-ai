--Esse primeiro comando seleciona o autor mais famoso em questao de livros--
--sendo pegados com emprestimos--

SELECT * FROM autores WHERE id_autor = ( 
SELECT id_autor FROM (
SELECT id_autor, COUNT(*) AS quant FROM livro_autor GROUP BY id_autor ORDER BY quant DESC limit 1
) AS maior_autor );

--fim do comando--


--O que foi adicionado a esse comando foi o IN, que vai buscar em um grupo de elementos, ou seja, nesses 3 resultados retornado vai selecionar individualmente mais de um--
--o que e claramente e melhor do que fazer 3 selects diferentes--
SELECT * FROM usuarios WHERE id_usuario IN ( (
SELECT id_usuario FROM (
SELECT id_usuario, COUNT(*) AS quant FROM emprestimos GROUP BY id_usuario ORDER BY quant DESC limit 3
) AS usuarios_mais_interessantos ) );

--fim do comando--


--O comando mais simples, ele simplesmente busca os emprestimos atrasados--
SELECT * FROM emprestimos WHERE status = "ATRASADO";


