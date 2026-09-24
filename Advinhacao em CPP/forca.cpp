#include <chrono>
#include <cstdlib>
#include <iostream>
#include <random>
#include <string>
#include <thread>

using namespace std;

void desenharforca(int erros) {
  system("clear");

  switch (erros) {
  case 0:
    cout << "  +---+" << endl;
    cout << "  |   |" << endl;
    cout << "      |" << endl;
    cout << "      |" << endl;
    cout << "      |" << endl;
    cout << "=======" << endl;
    break;

  case 1:
    cout << "  +---+" << endl;
    cout << "  |   |" << endl;
    cout << "  o   |" << endl;
    cout << "      |" << endl;
    cout << "      |" << endl;
    cout << "=======" << endl;
    break;

  case 2:
    cout << "  +---+" << endl;
    cout << "  |   |" << endl;
    cout << "  o   |" << endl;
    cout << "  |   |" << endl;
    cout << "      |" << endl;
    cout << "=======" << endl;
    break;

  case 3:
    cout << "  +---+" << endl;
    cout << "  |   |" << endl;
    cout << "  o   |" << endl;
    cout << " /|   |" << endl;
    cout << "      |" << endl;
    cout << "=======" << endl;
    break;

  case 4:
    cout << "  +---+" << endl;
    cout << "  |   |" << endl;
    cout << "  o   |" << endl;
    cout << " /|\\  |" << endl;
    cout << "      |" << endl;
    cout << "=======" << endl;
    break;

  case 5:
    cout << "  +---+" << endl;
    cout << "  |   |" << endl;
    cout << "  o   |" << endl;
    cout << " /|\\  |" << endl;
    cout << " /    |" << endl;
    cout << "=======" << endl;
    break;

  case 6:
    cout << "  +---+" << endl;
    cout << "  |   |" << endl;
    cout << "  o   |" << endl;
    cout << " /|\\  |" << endl;
    cout << " / \\  |" << endl;
    cout << "========" << endl;
    break;
  }
}

string letra_posicoes(string palavraexibidas, string listadeletras,
                      string encaixe) {
  string letrastratadas = palavraexibidas;
  for (int i = 0; i < listadeletras.size(); i++) {
    int contador = 0;
    bool mapeamentocompleto = false;
    while (contador < encaixe.size()) {
      mapeamentocompleto = listadeletras.size() == contador + i + 1;
      if (mapeamentocompleto) {
        return palavraexibidas;
      }
      if (encaixe[contador] == listadeletras[i + contador]) {
        letrastratadas[contador + i] = encaixe[contador];
        contador++;
      } else {
        letrastratadas = palavraexibidas;
        contador = 0;
        break;
      }
    }
  }
  return letrastratadas;
}

int main() {

  cout << "┌─────────────────────┐" << endl;
  cout << "│    jogo da forca    │" << endl;
  cout << "└─────────────────────┘" << endl;

  cout << endl;

  cout << "iniciando o jogo..." << endl;

  string palavras[10] = {"caju",           "pinto",   "linux", "acido",
                         "faixa",          "carne",   "chave", "gato",
                         "dessoxirribose", "emplasto"};

  random_device rd;
  mt19937 generator(rd());
  uniform_int_distribution<int> distribuition(0, 9);

  int randomnumber = distribuition(generator);

  string palavragerada = palavras[randomnumber];

  cout << "palavra sorteada!" << endl;

  this_thread::sleep_for(chrono::seconds(2));

  system("clear");

  string palavrachutada;
  cin >> palavrachutada;

  string palavraexibida(palavrachutada.size(), ' ');

  letra_posicoes(palavraexibida, palavragerada, palavrachutada);

  while ()
}
