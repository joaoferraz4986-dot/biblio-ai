#include <iostream>
#include <vector>
using namespace std;

int verificarMagicidade(vector<vector<int>> matriz, int n) {
  int xLoc, yLoc;
  int somaAnterior = 0;
  int soma = 0;
  bool permanece =
      ((somaAnterior + soma) / soma == 2 || (somaAnterior + soma) / soma == 1);

  xLoc = 0;
  for (int i = 0; i < n; i++) {
    while (xLoc < n) {
      soma += matriz[i][xLoc];
      xLoc++;
    }

    if (permanece) {
      somaAnterior = soma;
      soma = 0;
    } else {
      return -1;
    }
  }

  yLoc = 0;
  for (int i = 0; i < n; i++) {
    while (yLoc < n) {
      soma += matriz[yLoc][i];
      yLoc++;
    }

    if (permanece) {
      somaAnterior = soma;
      soma = 0;
    } else {
      return -1;
    }
  }

  xLoc = 0;
  yLoc = 0;
  while (xLoc < n && yLoc < n) {
    soma += matriz[yLoc][xLoc];
    yLoc++;
    xLoc++;
  }

  if (permanece) {
    somaAnterior = soma;
    soma = 0;
  } else {
    return -1;
  }

  xLoc = n;
  yLoc = 0;
  while (xLoc >= 0 && yLoc < n) {
    soma += matriz[yLoc][xLoc];
    yLoc++;
    xLoc--;
  }

  if (permanece) {
    somaAnterior = soma;
    soma = 0;
  } else {
    return -1;
  }

  return somaAnterior;
}

int main() {

  int n;
  cin >> n;

  vector<vector<int>> matriz(n, vector<int>(n));

  for (int i = 0; i < n; i++) {
    for (int j = 0; j < n; j++) {
      int valorAtual;
      cin >> valorAtual;

      matriz[i][j] = valorAtual;
    }
  }

  cout << verificarMagicidade(matriz, n) << endl;

  return 0;
}
