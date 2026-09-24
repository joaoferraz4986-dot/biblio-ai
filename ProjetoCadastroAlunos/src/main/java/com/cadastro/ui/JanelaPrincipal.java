package com.cadastro.ui;

import java.awt.BorderLayout;
import java.awt.GridLayout;

import javax.swing.ButtonGroup;
import javax.swing.JButton;
import javax.swing.JCheckBox;
import javax.swing.JComboBox;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JMenu;
import javax.swing.JMenuBar;
import javax.swing.JMenuItem;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JRadioButton;
import javax.swing.JScrollPane;
import javax.swing.JTabbedPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.table.DefaultTableModel;

import com.cadastro.db.AlunoDAO;
import com.cadastro.model.Aluno;

public class JanelaPrincipal extends JFrame {
    private JTextField campoNome, campoEmail, campoRua, campoCidade;
    private JComboBox<String> comboCurso;
    private JCheckBox checkEmail, checkNotificacao;
    private JRadioButton radioMasc, radioFem;
    private JButton btnCadastrar, btnLimpar, btnSair;

    private JTable tabela;

    private DefaultTableModel modeloTabela;

    public JanelaPrincipal() {
        setTitle("Sistema de Cadastro de Alunos");
        setSize(500, 400);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        JMenuBar barra = new JMenuBar();
        JMenu menuArquivo = new JMenu("Arquivo");
        JMenuItem itemSair = new JMenuItem("Sair");
        itemSair.addActionListener(e -> System.exit(0));
        menuArquivo.add(itemSair);

        JMenu menuAjuda = new JMenu("Ajuda");
        JMenuItem itemSobre = new JMenuItem("Sobre");
        itemSobre.addActionListener(e -> JOptionPane.showMessageDialog(this,
                "Sistema de Cadastro de Alunos\nVersão 1.0"));
        menuAjuda.add(itemSobre);

        barra.add(menuArquivo);
        barra.add(menuAjuda);
        setJMenuBar(barra);

        JTabbedPane abas = new JTabbedPane();

        JPanel painelDados = new JPanel(new GridLayout(6, 2));
        painelDados.add(new JLabel("Nome:"));
        campoNome = new JTextField(20);
        painelDados.add(campoNome);

        painelDados.add(new JLabel("Email:"));
        campoEmail = new JTextField(20);
        painelDados.add(campoEmail);

        painelDados.add(new JLabel("Curso:"));
        String[] cursos = { "Java", "Python", "C#", "JavaScript" };
        comboCurso = new JComboBox<>(cursos);
        painelDados.add(comboCurso);

        painelDados.add(new JLabel("Gênero:"));
        JPanel painelGenero = new JPanel();
        radioMasc = new JRadioButton("Masculino");
        radioFem = new JRadioButton("Feminino");
        ButtonGroup grupoGenero = new ButtonGroup();
        grupoGenero.add(radioMasc);
        grupoGenero.add(radioFem);
        painelGenero.add(radioMasc);
        painelGenero.add(radioFem);
        painelDados.add(painelGenero);

        checkEmail = new JCheckBox("Receber emails");
        checkNotificacao = new JCheckBox("Ativar notificações");
        painelDados.add(checkEmail);
        painelDados.add(checkNotificacao);

        abas.add("Dados Pessoais", painelDados);

        JPanel painelEndereco = new JPanel(new GridLayout(2, 2));
        painelEndereco.add(new JLabel("Rua:"));
        campoRua = new JTextField(20);
        painelEndereco.add(campoRua);

        painelEndereco.add(new JLabel("Cidade:"));
        campoCidade = new JTextField(20);
        painelEndereco.add(campoCidade);

        abas.add("Endereço", painelEndereco);

        JPanel painelBotoes = new JPanel();
        btnCadastrar = new JButton("Cadastrar");
        btnLimpar = new JButton("Limpar");
        btnSair = new JButton("Sair");
        painelBotoes.add(btnCadastrar);
        painelBotoes.add(btnLimpar);
        painelBotoes.add(btnSair);

        btnCadastrar.addActionListener(e -> cadastrarAluno());
        btnLimpar.addActionListener(e -> limparCampos());
        btnSair.addActionListener(e -> System.exit(0));

        getContentPane().setLayout(new BorderLayout());
        getContentPane().add(abas, BorderLayout.CENTER);
        getContentPane().add(painelBotoes, BorderLayout.SOUTH);

        setVisible(true);

        modeloTabela = new DefaultTableModel(new Object[] { "ID", "Nome", "Email", "Curso", "Cidade" }, 0);
        tabela = new JTable(modeloTabela);

        JButton btnAtualizar = new JButton("Atualizar");
        JButton btnExcluir = new JButton("Excluir");

        JPanel painelListaBotoes = new JPanel();

        painelListaBotoes.add(btnAtualizar);
        painelBotoes.add(btnExcluir);

        JPanel painelLista = new JPanel(new BorderLayout());
        painelLista.add(new JScrollPane(tabela), BorderLayout.CENTER);
        painelLista.add(painelListaBotoes, BorderLayout.SOUTH);
    }

    private void cadastrarAluno() {
        Aluno aluno = new Aluno();
        aluno.setNome(campoNome.getText());
        aluno.setEmail(campoEmail.getText());
        aluno.setCurso((String) comboCurso.getSelectedItem());
        aluno.setGenero(radioMasc.isSelected() ? "Masculino" : "Feminino");
        aluno.setReceberEmail(checkEmail.isSelected());
        aluno.setReceberNotificacao(checkNotificacao.isSelected());
        aluno.setRua(campoRua.getText());
        aluno.setCidade(campoCidade.getText());

        AlunoDAO dao = new AlunoDAO();
        dao.salvar(aluno);

        JOptionPane.showMessageDialog(this,
                "Aluno cadastrado com sucesso no banco de dados!");
        limparCampos();
    }

    private void limparCampos() {
        campoNome.setText("");
        campoEmail.setText("");
        comboCurso.setSelectedIndex(0);
        radioMasc.setSelected(false);
        radioFem.setSelected(false);
        checkEmail.setSelected(false);
        checkNotificacao.setSelected(false);
        campoRua.setText("");
        campoCidade.setText("");
    }

    public static void main(String[] args) {
        new JanelaPrincipal();
    }
}
