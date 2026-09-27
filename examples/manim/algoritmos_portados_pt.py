from manim import *
from manim_dsa import MGraph, MGraphStyle

class BFSDFSComparacaoPT(Scene):
    def construct(self):
        title = Text('BFS e DFS: o algoritmo se move pelo grafo', font_size=30).to_edge(UP)
        base = {
            'A': ['B', 'C'],
            'B': ['A', 'D', 'E'],
            'C': ['A', 'F'],
            'D': ['B'],
            'E': ['B', 'F'],
            'F': ['C', 'E'],
        }
        positions = {
            'A': UP * 1.45,
            'B': LEFT * 1.1 + UP * 0.45,
            'C': RIGHT * 1.1 + UP * 0.45,
            'D': LEFT * 1.8 + DOWN * 0.9,
            'E': LEFT * 0.35 + DOWN * 1.0,
            'F': RIGHT * 1.55 + DOWN * 0.9,
        }
        left = MGraph(base, {k: v + LEFT * 3.35 for k, v in positions.items()}, MGraphStyle.BLUE)
        right = MGraph(base, {k: v + RIGHT * 3.35 for k, v in positions.items()}, MGraphStyle.PURPLE)
        left_label = Text('BFS — fila', font_size=24, color='#61d0c4').next_to(left, UP, buff=0.22)
        right_label = Text('DFS — pilha/recursão', font_size=24, color='#b58cff').next_to(right, UP, buff=0.22)
        legend = Text('amarelo = processando    colorido = visitado    seta = aresta percorrida', font_size=17, color='#ffd166').to_edge(DOWN, buff=0.18)
        left_state = Text('fila: [A]', font_size=18, color='#61d0c4').next_to(left, DOWN, buff=0.2)
        right_state = Text('pilha: [A]', font_size=18, color='#b58cff').next_to(right, DOWN, buff=0.2)
        self.play(Write(title), Create(left), Create(right), Write(left_label), Write(right_label), Write(legend), Write(left_state), Write(right_state), run_time=1.7)
        self._run(left, left_state, ['A', 'B', 'C', 'D', 'E', 'F'], {'B': 'A', 'C': 'A', 'D': 'B', 'E': 'B', 'F': 'C'}, ['[B, C]', '[C, D, E]', '[D, E, F]', '[E, F]', '[F]', '[]'], '#61d0c4', 'fila')
        self._run(right, right_state, ['A', 'B', 'D', 'E', 'F', 'C'], {'B': 'A', 'D': 'B', 'E': 'B', 'F': 'E', 'C': 'A'}, ['[B, C]', '[D, E, C]', '[E, C]', '[F, C]', '[C]', '[]'], '#b58cff', 'pilha')
        self.wait(2)

    def _run(self, graph, state, order, parents, states, visited_color, structure):
        discovered = []
        for index, node_name in enumerate(order):
            parent = parents.get(node_name)
            current = graph.nodes[node_name]
            if parent:
                edge = graph.edges[(parent, node_name)]
                self.play(edge.animate.highlight('#ffd166', stroke_width=9), run_time=0.45)
                edge.unhighlight()
                edge.highlight(visited_color, stroke_width=6)
            self.play(current.animate.highlight('#ffd166', stroke_width=10), run_time=0.45)
            discovered.append(node_name)
            state_value = structure + ': ' + states[index]
            new_state = Text(state_value, font_size=18, color=visited_color).move_to(state)
            self.play(Transform(state, new_state), run_time=0.35)
            self.play(current.animate.unhighlight(), run_time=0.25)
            current.highlight(visited_color, stroke_width=7)
