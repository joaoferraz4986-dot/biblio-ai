package com.example.sharedpreferences;

import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.RenderEffect;
import android.graphics.Shader;
import android.graphics.drawable.Drawable;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.ImageButton;

import androidx.appcompat.app.AppCompatActivity;

import eightbitlab.com.blurview.BlurView;
import eightbitlab.com.blurview.RenderScriptBlur;

public class MainActivity extends AppCompatActivity {

    private static final String ARQUIVO_PREFS = "app_prefs";
    private static final String CHAVE_NOME = "nome";
    private static final String CHAVE_EMAIL = "email";
    private static final String CHAVE_SENHA = "senha";

    Button botaoLogin;
    EditText campoEmail, campoSenha;
    CheckBox caixaSalvar;
    SharedPreferences preferencias;

    @Override
    protected void onCreate( Bundle estadoSalvo ) {

        super.onCreate( estadoSalvo );
        setContentView( R.layout.activity_main );

        botaoLogin = findViewById( R.id.btnLogin );
        campoEmail = findViewById( R.id.edtEmail );
        campoSenha = findViewById( R.id.edtSenha );
        caixaSalvar = findViewById( R.id.checkBoxSalvar );

        preferencias = getSharedPreferences( ARQUIVO_PREFS, MODE_PRIVATE );

        configurarBarraNavegacao();

        botaoLogin.setOnClickListener( v -> {

            String email = campoEmail.getText().toString().trim();
            String senha = campoSenha.getText().toString().trim();

            if ( email.isEmpty() || senha.isEmpty() ) {
                return;
            }

            if ( caixaSalvar.isChecked() ) {

                SharedPreferences.Editor editor = preferencias.edit();

                editor.putString( CHAVE_EMAIL, email );
                editor.putString( CHAVE_SENHA, senha );

                editor.apply();

            }

            Intent intencao = new Intent( MainActivity.this, HomeActivity.class );
            startActivity( intencao );

        });

        configurarEfeitoBlur();

    }

    private void configurarEfeitoBlur() {

        BlurView vistaBlur = findViewById( R.id.blurViewLogin );
        View decorView = getWindow().getDecorView();
        ViewGroup viewRaiz = decorView.findViewById( android.R.id.content );
        Drawable fundoJanela = decorView.getBackground();

        vistaBlur.setupWith( viewRaiz, new RenderScriptBlur( this ) )
                .setFrameClearDrawable( fundoJanela )
                .setBlurRadius( 20f );

    }

    private void configurarBarraNavegacao() {

        ImageButton botaoHome = findViewById( R.id.btnNavHome );
        ImageButton botaoNavLogin = findViewById( R.id.btnNavLogin );
        ImageButton botaoNavCadastro = findViewById( R.id.btnNavCadastro );
        ImageButton botaoNavLogout = findViewById( R.id.btnNavLogout );

        boolean logado = preferencias.contains( CHAVE_NOME ) || preferencias.contains( CHAVE_EMAIL );

        if ( logado ) {
            botaoNavLogin.setVisibility( View.GONE );
            botaoNavCadastro.setVisibility( View.GONE );
            botaoNavLogout.setVisibility( View.VISIBLE );
        } else {
            botaoNavLogin.setVisibility( View.VISIBLE );
            botaoNavCadastro.setVisibility( View.VISIBLE );
            botaoNavLogout.setVisibility( View.GONE );
        }

        botaoHome.setOnClickListener( v -> {
            startActivity( new Intent( MainActivity.this, HomeActivity.class ) );
        });

        botaoNavLogout.setOnClickListener( v -> {
            preferencias.edit().clear().apply();
            recreate();
        });

        botaoNavCadastro.setOnClickListener( v -> {
            startActivity( new Intent( MainActivity.this, CadastroActivity.class ) );
        });

        botaoNavLogin.setOnClickListener( v -> {
        });

    }
}
