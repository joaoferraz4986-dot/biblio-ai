#include <iostream>
#include <random>
#include <string>
using namespace std;

int main() {
  cout << "-----------------------" << endl;
  cout << "| Jogo da adivinhacao |" << endl;
  cout << "-----------------------" << endl;

  cout << endl;
  cout << "Neste jogo, um numero aleatorio vai ser roletado, que voce vai "
          "escolher numeros"
       << endl;
  cout << "para tentar adivinhar, recebendo dicas no processo" << endl;

  cout << endl;
  cout << "Agora escolha a dificuldade: " << endl
       << "Hacker[1] - 1, Dificil[2] - 5, Normal[3] - 7 e Facil[4] - 10"
       << endl;
  cout << endl;

  int dificuldade;
  cin >> dificuldade;

  int n = 0;
  switch (dificuldade) {
  case 1:
    n = 1;
    break;
  case 2:
    n = 5;
    break;
  case 3:
    n = 7;
    break;
  case 4:
    n = 10;
    break;
  default:
    cout << endl << "[ERRO]: Formato de numero errado!" << endl;
    return -1;
    break;
  }

  random_device rd;

  mt19937 generator(rd());

  uniform_int_distribution<int> distribuition(0, 50);

  int numeroAleatorio = distribuition(generator);

  cout << endl;
  string contagem[10] = {"primeiro", "segundo", "terceiro", "quarto", "quinto",
                         "sexto",    "setimo",  "oitavo",   "nono",   "decimo"};
  int numeroAdivinhado;
  for (int i = 0; i < n; i++) {
    cout << "Digite seu " << contagem[i] << " numero:" << endl;
    cin >> numeroAdivinhado;

    if (numeroAdivinhado == numeroAleatorio) {
      cout << "Numero correto adivinhado! " << endl;
      cout << "Numero aleatorio encontrado: " << numeroAleatorio << endl;
      return 0;
    } else if (numeroAdivinhado > numeroAleatorio) {
      cout << "Numero adivinhado e maior do que o numero aleatorio!" << endl;
    } else {
      cout << "Numero adivinhado e menor do que o numero aleatorio!" << endl;
    }
  }
  cout << "Voce falhou da adivinhacao!";
  return 0;
}
