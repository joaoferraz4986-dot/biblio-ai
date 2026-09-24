package com.cadastro.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Aluno {
    private int id;
    private String nome;
    private String email;
    private String curso;
    private String genero;
    private boolean receberEmail;
    private boolean receberNotificacao;
    private String rua;
    private String cidade;

}
