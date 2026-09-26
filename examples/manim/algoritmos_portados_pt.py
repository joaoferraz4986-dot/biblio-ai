from manim import *
from manim_dsa import MGraph, MGraphStyle

class BFSDFSComparacaoPT(Scene):
    def construct(self):
        title = Text('BFS e DFS: a estrutura muda a ordem da visita', font_size=30).to_edge(UP)
        base = {
            'A': ['B', 'C'],
            'B': ['A', 'D', 'E'],
            'C': ['A', 'F'],
            'D': ['B'],
            'E': ['B', 'F'],
            'F': ['C', 'E'],
        }
        positions = {
            'A': UP * 1.55,
            'B': LEFT * 1.1 + UP * 0.55,
            'C': RIGHT * 1.1 + UP * 0.55,
            'D': LEFT * 1.8 + DOWN * 0.8,
            'E': LEFT * 0.35 + DOWN * 0.95,
            'F': RIGHT * 1.55 + DOWN * 0.85,
        }
        left = MGraph(base, {k: v + LEFT * 3.35 for k, v in positions.items()}, MGraphStyle.BLUE)
        right = MGraph(base, {k: v + RIGHT * 3.35 for k, v in positions.items()}, MGraphStyle.PURPLE)
        left_label = Text('BFS — fila', font_size=24, color='#61d0c4').next_to(left, UP, buff=0.25)
        right_label = Text('DFS — pilha/recursão', font_size=24, color='#b58cff').next_to(right, UP, buff=0.25)
        legend = Text('BFS visita por níveis; DFS aprofunda antes de voltar', font_size=19, color='#ffd166').to_edge(DOWN)
        self.play(Write(title), Create(left), Create(right), Write(left_label), Write(right_label), Write(legend), run_time=1.8)
        bfs_order = ['A', 'B', 'C', 'D', 'E', 'F']
        dfs_order = ['A', 'B', 'D', 'E', 'F', 'C']
        bfs_note = Text('fila: A → B,C → D,E,F', font_size=18, color='#61d0c4').next_to(left, DOWN, buff=0.22)
        dfs_note = Text('pilha: A → B → D → E → F → C', font_size=18, color='#b58cff').next_to(right, DOWN, buff=0.22)
        for node in bfs_order:
            self.play(left.nodes[node].animate.highlight('#61d0c4', stroke_width=8), run_time=0.35)
        for node in dfs_order:
            self.play(right.nodes[node].animate.highlight('#b58cff', stroke_width=8), run_time=0.35)
        self.play(Write(bfs_note), Write(dfs_note), run_time=0.8)
        self.wait(2)
