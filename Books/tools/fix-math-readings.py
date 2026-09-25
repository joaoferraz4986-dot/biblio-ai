#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
READINGS = {
    '(A B)_n = [x^n]A(x)B(x)=\\sum_{i=0}^{n}a_i b_{n-i}': 'Lê-se: o coeficiente de grau n do produto A(x)B(x) é a soma, para i de 0 a n, de a_i vezes b_{n-i}.',
    'C_n=\\frac{1}{n+1}\\binom{2n}{n}': 'Lê-se: C_n é 1 dividido por n mais 1, vezes o coeficiente binomial de 2n escolhe n; é a fórmula fechada dos números de Catalan.',
    '\\lvert A \\times B\\rvert = \\lvert A\\rvert\\,\\lvert B\\rvert': 'Lê-se: a cardinalidade de A cartesiano B é a cardinalidade de A multiplicada pela cardinalidade de B.',
    'n! = \\prod_{i=1}^{n} i': 'Lê-se: n fatorial é o produto dos inteiros i, para i de 1 até n; isto é, 1 vezes 2 até n.',
    '\\binom{n}{k}=\\frac{n!}{k!(n-k)!}': 'Lê-se: n escolhe k é n fatorial dividido por k fatorial vezes n menos k fatorial, para 0 menor ou igual a k menor ou igual a n.',
    '\\#\\{(x_1,\\ldots,x_k)\\in\\mathbb{Z}_{\\ge0}^k: \\sum x_i=n\\}=\\binom{n+k-1}{k-1}': 'Lê-se: o número de k-tuplas de inteiros não negativos cuja soma é n é n mais k menos 1 escolhe k menos 1.',
    'n! - 2(n-1)!': 'Lê-se: n fatorial menos duas vezes n menos 1 fatorial; conta as permutações em que dois objetos especificados não ficam adjacentes.',
    '\\mathbb{E}[X]=\\binom{m}{2}\\frac{1}{b}': 'Lê-se: a esperança de X é m escolhe 2, multiplicado por 1 dividido por b; X conta colisões esperadas sob o modelo uniforme assumido.',
    '\\sum_{k=0}^{n}\\binom{n}{k}=2^n': 'Lê-se: a soma de n escolhe k, para k de 0 a n, é 2 elevado a n; ambos os lados contam os subconjuntos de um conjunto com n elementos.',
    '\\#(X/G)=\\frac{1}{\\lvert G\\rvert}\\sum_{g\\in G}\\lvert Fix(g)\\rvert': 'Lê-se: o número de órbitas de X pela ação de G é 1 dividido pela ordem de G, vezes a soma, para g em G, do número de pontos fixos de g.',
    'O(\\sqrt{N})': 'Lê-se: ordem de raiz quadrada de N; é o número assintótico de consultas de Grover em busca não estruturada.',
    '(-1)^{f(x)}|x\\rangle| - \\rangle = (-1)^{f(x)}|x\\rangle| - \\rangle': 'Lê-se: o oráculo, aplicado a x tensor o estado menos, introduz a fase menos 1 elevada a f(x) no estado x; a igualdade escrita é a ação de fase global do oráculo.',
    'k \\approx \\frac{\\pi}{4}\\sqrt{N/M}': 'Lê-se: o número recomendado de iterações é aproximadamente pi dividido por 4, vezes a raiz de N dividido por M, quando M itens são soluções.',
    '\\Pr[\\text{aceitar}]\\ge 2/3 \\quad \\text{ou} \\quad \\Pr[\\text{aceitar}]\\le 1/3': 'Lê-se: a probabilidade de aceitar é pelo menos dois terços no caso positivo, ou no máximo um terço no caso negativo; a separação define uma margem de decisão.',
    '\\text{memória} \\approx 2^n \\times \\text{bytes por amplitude}': 'Lê-se: a memória de uma simulação vetorial cresce aproximadamente como 2 elevado a n vezes o número de bytes por amplitude.',
    '\\text{custo total}=\\text{execuções}\\times(\\text{profundidade}+\\text{leitura})': 'Lê-se: o custo total aproximado é o número de execuções vezes a soma da profundidade do circuito com o custo de leitura.',
    '|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}': 'Lê-se: o estado de Bell Phi mais é a soma dos estados 00 e 11, dividida pela raiz quadrada de 2.',
    '|00\\rangle = |0\\rangle \\otimes |0\\rangle': 'Lê-se: o estado de dois qubits 00 é o produto tensorial do estado 0 do primeiro qubit com o estado 0 do segundo.',
    '|\\Phi^+\\rangle = (|00\\rangle+|11\\rangle)/\\sqrt{2}': 'Lê-se: o estado de Bell Phi mais é a soma dos estados 00 e 11, dividida pela raiz de 2.',
    '|\\psi\\rangle|\\Phi^+\\rangle = \\frac{1}{2}\\sum_{m,n}|mn\\rangle X^n Z^m|\\psi\\rangle': 'Lê-se: o estado inicial do teletransporte se decompõe em quatro resultados mn, cada um acompanhado pela correção X elevado a n e Z elevado a m aplicada a psi, com fator 1 sobre 2.',
    '\\langle O\\rangle = \\operatorname{Tr}(\\rho O)': 'Lê-se: o valor esperado do observável O é o traço do produto da matriz densidade rho pelo observável O.',
    '\\mathcal{E}(\\rho)=\\sum_k E_k\\rho E_k^\\dagger,\\quad \\sum_k E_k^\\dagger E_k=I': 'Lê-se: o canal E transforma rho na soma de E_k rho E_k adjunto; a soma dos operadores E_k adjunto E_k deve ser a identidade para preservar o traço.',
    '\\rho(t)=\\begin{pmatrix}\\rho_{00}(t)&\\gamma(t)\\rho_{01}(0)\\\\\\overline{\\gamma(t)}\\rho_{10}(0)&\\rho_{11}(t)\\end{pmatrix}': 'Lê-se: rho em t é uma matriz cuja coerência 01 decai por gamma em t e cuja coerência 10 decai pelo conjugado de gamma; as populações ocupam a diagonal.',
    'H=\\frac{1}{\\sqrt{2}}\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix}': 'Lê-se: a porta de Hadamard H é 1 sobre a raiz de 2 vezes a matriz com linhas 1, 1 e 1, menos 1.',
    'H|0\\rangle = (|0\\rangle+|1\\rangle)/\\sqrt{2},\\qquad H^2|0\\rangle=|0\\rangle': 'Lê-se: Hadamard aplicado a 0 produz a superposição uniforme de 0 e 1; aplicar H duas vezes devolve 0.',
    'U = \\prod_{j=1}^{L} G_j': 'Lê-se: U é o produto ordenado das portas G_j, de j igual a 1 até L; a ordem deve ser declarada pela convenção do circuito.',
    '\\operatorname{CNOT}|a,b\\rangle = |a,b\\oplus a\\rangle': 'Lê-se: CNOT preserva o bit de controle a e substitui o alvo b por b ou exclusivo a.',
    'D = \\max_{q} \\text{número de camadas no caminho de }q': 'Lê-se: D é a profundidade máxima, obtida pelo maior número de camadas no caminho de qualquer qubit q.',
    '\\langle u,v\\rangle = \\sum_i \\overline{u_i}v_i': 'Lê-se: o produto interno de u e v é a soma, em i, do conjugado de u_i vezes v_i.',
    '|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle,\\quad |\\alpha|^2+|\\beta|^2=1': 'Lê-se: psi é alfa vezes 0 mais beta vezes 1; os módulos ao quadrado de alfa e beta somam 1.',
    'T(n) = O(\\text{portas}) + O(\\text{consultas})': 'Lê-se: o custo T de n é limitado assintoticamente pela soma do custo das portas com o custo das consultas.',
    '\\operatorname{QFT}_N|x\\rangle=\\frac{1}{\\sqrt{N}}\\sum_{y=0}^{N-1}e^{2\\pi ixy/N}|y\\rangle': 'Lê-se: a QFT de dimensão N aplicada a x produz 1 sobre a raiz de N vezes a soma, para y de 0 a N menos 1, de e elevado a 2 pi i x y sobre N vezes y.',
    'U|\\psi\\rangle=e^{2\\pi i\\theta}|\\psi\\rangle': 'Lê-se: psi é autovetor de U com autovalor e elevado a 2 pi i theta; a estimativa de fase procura theta.',
    'f(a)=a^x \\bmod N': 'Lê-se: f de a é a potência a elevado a x reduzida módulo N.',
    '|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle,\\qquad |\\alpha|^2 + |\\beta|^2 = 1': 'Lê-se: psi é alfa vezes 0 mais beta vezes 1; a soma dos módulos ao quadrado das amplitudes alfa e beta é 1.',
    'P(0)=|1/\\sqrt{2}|^2=1/2,\\qquad P(1)=|1/\\sqrt{2}|^2=1/2': 'Lê-se: a probabilidade de 0 e a probabilidade de 1 são o módulo ao quadrado de 1 sobre a raiz de 2, ambas iguais a 1 sobre 2.',
    'H|0\\rangle = (|0\\rangle+|1\\rangle)/\\sqrt{2}': 'Lê-se: H aplicado ao estado 0 produz a superposição de 0 e 1 com amplitudes iguais, cada uma igual a 1 sobre a raiz de 2.',
    'p(x)=|\\langle x|\\psi\\rangle|^2': 'Lê-se: a probabilidade de medir x é o módulo ao quadrado da amplitude de projeção de psi sobre x.',
    '\\rho_A = \\operatorname{Tr}_B(\\rho_{AB})': 'Lê-se: a matriz densidade do subsistema A é o traço parcial, sobre B, da matriz densidade conjunta AB.',
    '\\mathcal{E}(\\rho)=(1-p)\\rho+pX\\rho X': 'Lê-se: o canal bit-flip deixa rho inalterado com probabilidade 1 menos p e aplica X rho X com probabilidade p.',
    's = Hx^T \\bmod 2': 'Lê-se: a síndrome s é H vezes a transposta de x, calculada módulo 2.',
    'S_i|\\psi_L\\rangle=|\\psi_L\\rangle': 'Lê-se: o estabilizador S_i deixa o estado lógico codificado psi_L invariável.',
    '\\operatorname{CNOT}(X\\otimes I)=(X\\otimes X)\\operatorname{CNOT}': 'Lê-se: conjugando X no qubit de controle por CNOT, obtém-se X no controle e X no alvo.',
    'U_L\\,\\mathcal{C} \\subseteq \\mathcal{C}': 'Lê-se: a operação lógica U_L leva o espaço de código C em um subconjunto de C, preservando o subespaço codificado.',
    '\\langle O\\rangle_{mitigated} \\approx \\lim_{\\lambda\\to0} \\langle O\\rangle_{\\lambda}': 'Lê-se: o valor esperado mitigado é aproximado pelo limite do valor esperado quando a intensidade de ruído lambda tende a zero.',
    'T(n)=2T(n/2)+O(n)=O(n\\log n)': 'Lê-se: T de n é duas vezes T de n sobre 2 mais ordem de n, resultando em ordem de n vezes logaritmo de n pelo teorema mestre.',
    'dp[v][s] = menor custo para chegar a v usando s descontos,\\quad s\\in\\{0,1\\}': 'Lê-se: dp de v e s é o menor custo para chegar ao vértice v usando s descontos, com s igual a 0 ou 1.',
    'E[X+Y]=E[X]+E[Y]': 'Lê-se: a esperança da soma X mais Y é a esperança de X mais a esperança de Y, sem exigir independência.',
    'P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)}': 'Lê-se: a probabilidade de A condicionado a B é a probabilidade da interseção A com B dividida pela probabilidade de B, com P(B) positiva.',
    '\\Delta G = \\Delta H - T\\Delta S': 'Lê-se: a variação de energia livre de Gibbs é a variação de entalpia menos a temperatura vezes a variação de entropia.',
    'C_m\\frac{dV}{dt} = -I_{ion}(V,t) + I_{ext}(t)': 'Lê-se: a capacitância de membrana C_m vezes a derivada do potencial V é a corrente externa menos a corrente iônica.',
    'V = R I': 'Lê-se: a tensão V é a resistência R multiplicada pela corrente I, com unidades coerentes.',
    'P = V I = I^2 R = \\frac{V^2}{R}': 'Lê-se: a potência P é tensão vezes corrente, ou corrente ao quadrado vezes resistência, ou tensão ao quadrado dividida pela resistência.',
    'T_{resposta} = T_{latencia} + T_{ISR} + T_{processamento}': 'Lê-se: o tempo de resposta é a soma da latência, do tempo gasto na rotina de serviço de interrupção e do processamento restante.',
}

count = 0
unmapped = []
for file in sorted((ROOT / 'content' / 'packages').glob('*/sections/*.json')):
    doc = json.loads(file.read_text(encoding='utf-8'))
    changed = [False]
    def walk(value):
        nonlocal_dummy = None
        global count
        if isinstance(value, list):
            for item in value: walk(item)
        elif isinstance(value, dict):
            if value.get('type') == 'math':
                tex = value.get('tex', '')
                if tex in READINGS:
                    value['reading'] = READINGS[tex]
                    changed[0] = True
                else:
                    unmapped.append((str(file.relative_to(ROOT)), tex))
            for child in value.values(): walk(child)
    walk(doc)
    if changed[0]:
        file.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        count += 1
print(f'{count} arquivos atualizados')
if unmapped:
    print('Fórmulas sem mapeamento:')
    for file, tex in unmapped: print(file, tex)
