from manim import *

class SecanteTangente(Scene):
    def construct(self):
        self.camera.background_color = '#101820'
        title = Text('Derivada: da secante à tangente', font_size=32).to_edge(UP)
        axes = Axes(x_range=[-3, 3, 1], y_range=[-1, 8, 1], x_length=8, y_length=5, axis_config={'color': '#8fa6b8'}).shift(DOWN * 0.25)
        curve = axes.plot(lambda x: x * x + 1, x_range=[-2.5, 2.5], color='#61d0c4')
        x0 = ValueTracker(1.0)
        a = Dot(axes.c2p(1, 2), color='#ffd166')
        b = always_redraw(lambda: Dot(axes.c2p(x0.get_value(), x0.get_value() ** 2 + 1), color='#ff8c69'))
        secant = always_redraw(lambda: Line(a.get_center(), b.get_center(), color='#ffd166', stroke_width=4))
        tangent = always_redraw(lambda: Line(axes.c2p(-0.15, 1.0), axes.c2p(2.15, 5.6), color='#ff8c69', stroke_width=4))
        formula = Text("f'(a) = limite de [f(a+h)-f(a)] / h", font_size=22, color='#ffffff').to_edge(DOWN)
        label = always_redraw(lambda: Text(f'h = {x0.get_value() - 1:.2f}', font_size=22, color='#ffd166').next_to(b, RIGHT, buff=0.45))
        self.play(Write(title), Create(axes), Create(curve), FadeIn(a), FadeIn(b), Create(secant), Write(formula), FadeIn(label))
        self.play(x0.animate.set_value(1.5), run_time=1.3)
        self.play(x0.animate.set_value(1.08), run_time=1.6)
        self.play(Create(tangent), Indicate(formula, color='#61d0c4'), run_time=1.0)
        self.wait(1)

class TransformacaoLinear(Scene):
    def construct(self):
        self.camera.background_color = '#101820'
        title = Text('Álgebra Linear: uma matriz transforma a grade', font_size=32).to_edge(UP)
        plane = NumberPlane(x_range=[-4, 4, 1], y_range=[-3, 3, 1], background_line_style={'stroke_color': '#355268', 'stroke_opacity': 0.7}).shift(DOWN * 0.15)
        matrix = Text('A = [[2, 1], [1, 1]]', font_size=22, color='#ffd166').to_corner(DL)
        e1 = Arrow(ORIGIN, RIGHT, buff=0, color='#5ec6b0').shift(DOWN * 0.15)
        e2 = Arrow(ORIGIN, UP, buff=0, color='#ff8c69').shift(DOWN * 0.15)
        v = Arrow(ORIGIN, 1.4 * RIGHT + 1.0 * UP, buff=0, color='#ffffff').shift(DOWN * 0.15)
        labels = VGroup(Text('e₁', font_size=22, color='#5ec6b0').next_to(e1.get_end(), DOWN), Text('e₂', font_size=22, color='#ff8c69').next_to(e2.get_end(), LEFT), Text('v', font_size=22).next_to(v.get_end(), UR))
        self.play(Write(title), Create(plane), Write(matrix), Create(e1), Create(e2), Create(v), Write(labels))
        self.play(plane.animate.apply_matrix([[2, 1], [1, 1]]), e1.animate.put_start_and_end_on(ORIGIN, 2 * RIGHT + UP), e2.animate.put_start_and_end_on(ORIGIN, RIGHT + UP), v.animate.put_start_and_end_on(ORIGIN, 3.8 * RIGHT + 2.4 * UP), run_time=2)
        self.play(Indicate(matrix, color='#ffd166'))
        self.wait(1)

class DijkstraReferencia(Scene):
    def construct(self):
        self.camera.background_color = '#101820'
        title = Text('Dijkstra: relaxamento com pesos legíveis', font_size=32).to_edge(UP)
        subtitle = Text('a menor distância provisória é expandida primeiro', font_size=18, color='#a7bdca').next_to(title, DOWN, buff=0.1)
        self.play(Write(title), FadeIn(subtitle))
        p = {'S': LEFT * 4.2 + UP * 0.4, 'A': LEFT * 1.8 + UP * 1.45, 'B': RIGHT * 1.7 + UP * 1.45, 'C': LEFT * 1.8 + DOWN * 1.3, 'D': RIGHT * 1.7 + DOWN * 1.3}
        edge_specs = [('S','A','2',UP*0.22),('S','C','5',LEFT*0.30),('A','B','2',UP*0.25),('A','C','1',LEFT*0.30),('B','D','1',RIGHT*0.30),('C','D','2',DOWN*0.25),('A','D','6',RIGHT*0.32)]
        edges = VGroup(); weights = VGroup(); edge_map = {}
        for u,v,w,off in edge_specs:
            line = Arrow(p[u], p[v], buff=0.38, color='#526d83', stroke_width=3, max_tip_length_to_length_ratio=0.08)
            plate = RoundedRectangle(corner_radius=0.08, width=0.38, height=0.30, stroke_width=1.5, stroke_color='#ffd166', fill_color='#182b3a', fill_opacity=1).move_to(line.get_center()+off)
            txt = Text(w, font_size=19, color='#ffd166').move_to(plate.get_center())
            edges.add(line); weights.add(VGroup(plate,txt)); edge_map[(u,v)] = line
        nodes = VGroup(); labels = VGroup(); dist = {}
        for name, pos in p.items():
            node = Circle(radius=0.36, stroke_width=4, stroke_color='#5ec6b0', fill_color='#173545', fill_opacity=1).move_to(pos)
            lab = Text(name, font_size=24).move_to(pos)
            d = Text('∞' if name != 'S' else '0', font_size=19, color='#b7d2df').next_to(node, UP, buff=0.14)
            nodes.add(node); labels.add(lab); dist[name] = d
        panel = RoundedRectangle(corner_radius=0.14, width=3.1, height=1.48, stroke_color='#6e8da1', fill_color='#142532', fill_opacity=1).to_corner(DL)
        panel_title = Text('Legenda', font_size=20, color='#ffd166').next_to(panel.get_top(), DOWN, buff=0.12)
        panel_text = VGroup(Text('linha: aresta disponível', font_size=16), Text('verde: relaxamento ativo', font_size=16, color='#5ec6b0'), Text('placa: peso da aresta', font_size=16, color='#ffd166')).arrange(DOWN, aligned_edge=LEFT, buff=0.06).move_to(panel.get_center()+DOWN*0.20)
        queue = Text('fila: (0,S)', font_size=20, color='#d8e6ef').to_edge(DOWN)
        self.play(Create(edges), FadeIn(weights), Create(nodes), Write(labels), FadeIn(VGroup(*dist.values())), FadeIn(panel), Write(panel_title), Write(panel_text), Write(queue))
        for node, value, line_key, text in [(p['A'], '2', ('S','A'), 'fila: (2,A),(5,C)'), (p['C'], '3', ('A','C'), 'fila: (3,C),(4,B)'), (p['B'], '4', ('A','B'), 'fila: (4,B),(5,C)'), (p['D'], '5', ('B','D'), 'fila: (5,D)')]:
            line = edge_map[line_key]
            pulse = line.copy().set_color('#5ec6b0').set_stroke(width=8)
            newd = Text(value, font_size=19, color='#9fe3c7').next_to(Circle(radius=0.36).move_to(node), DOWN, buff=0.12)
            self.play(Create(pulse), Indicate(weights[edge_specs.index(next(x for x in edge_specs if x[0]==line_key[0] and x[1]==line_key[1]))], color='#ffd166'), run_time=0.6)
            self.play(Transform(dist[line_key[1]], newd), Transform(queue, Text(text, font_size=20, color='#d8e6ef').to_edge(DOWN)), FadeOut(pulse), run_time=0.7)
        final = Text('quando a menor distância sai da fila, ela fica definitiva', font_size=20, color='#9fe3c7').to_edge(DOWN)
        self.play(Transform(queue, final), Indicate(nodes[1], color='#5ec6b0'), Indicate(nodes[2], color='#5ec6b0'))
        self.wait(1)
