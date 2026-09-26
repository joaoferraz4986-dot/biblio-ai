from manim import *

class RiemannIntegral(Scene):
    def construct(self):
        self.camera.background_color = '#101820'
        title = Text('Integral: acumulação por retângulos', font_size=32).to_edge(UP)
        axes = Axes(x_range=[0, 4, 1], y_range=[0, 5, 1], x_length=8, y_length=4.8, axis_config={'color': '#8fa6b8'}).shift(DOWN * 0.25)
        curve = axes.plot(lambda x: 0.35 * x * x + 0.5, x_range=[0, 3.4], color='#61d0c4')
        n = ValueTracker(4)
        rects = always_redraw(lambda: axes.get_riemann_rectangles(curve, x_range=[0.2, 3.2], dx=max(0.08, 3.0 / int(n.get_value())), input_sample_type='center', color='#ffd166', fill_opacity=0.45, stroke_width=1))
        formula = Text('n aumenta  →  soma se aproxima da área', font_size=22, color='#ffd166').to_edge(DOWN)
        self.play(Write(title), Create(axes), Create(curve), FadeIn(rects), Write(formula))
        self.play(n.animate.set_value(18), run_time=2)
        self.play(n.animate.set_value(42), run_time=2)
        self.play(Indicate(formula, color='#61d0c4'))
        self.wait(1)

class TaylorApproximation(Scene):
    def construct(self):
        self.camera.background_color = '#101820'
        title = Text('Taylor: aproximação local por polinômios', font_size=32).to_edge(UP)
        axes = Axes(x_range=[-3, 3, 1], y_range=[-1, 8, 1], x_length=8, y_length=5, axis_config={'color': '#8fa6b8'}).shift(DOWN * 0.25)
        f = axes.plot(lambda x: 2.3 * (x + 1) ** 2 + 1, x_range=[-1.2, 0.25], color='#61d0c4')
        p2 = axes.plot(lambda x: 2.3 * (x + 1) ** 2 + 1, x_range=[-1.2, 0.25], color='#ffd166')
        p1 = axes.plot(lambda x: 4.6 * (x + 1) + 1, x_range=[-1.2, 0.25], color='#ff8c69')
        labels = VGroup(Text('f(x)', font_size=22, color='#61d0c4'), Text('P₁(x)', font_size=22, color='#ff8c69'), Text('P₂(x)', font_size=22, color='#ffd166')).arrange(DOWN, aligned_edge=LEFT, buff=0.08).to_corner(UR)
        formula = Text('mais termos  →  melhor aproximação perto de a', font_size=21).to_edge(DOWN)
        self.play(Write(title), Create(axes), Create(f), Create(p1), Create(p2), Write(labels), Write(formula))
        self.play(Indicate(p1, color='#ff8c69'), Indicate(p2, color='#ffd166'))
        self.wait(1)

class ProjectionLeastSquares(Scene):
    def construct(self):
        self.camera.background_color = '#101820'
        title = Text('Mínimos quadrados: projeção e resíduo', font_size=32).to_edge(UP)
        axes = Axes(x_range=[-3, 3, 1], y_range=[-2, 4, 1], x_length=8, y_length=5, axis_config={'color': '#8fa6b8'}).shift(DOWN * 0.2)
        line = axes.plot(lambda x: 0.7 * x + 0.5, x_range=[-2.5, 2.5], color='#61d0c4')
        points = VGroup(*[Dot(axes.c2p(x, y), color='#ffd166') for x, y in [(-2, -0.2), (-1, 1.6), (0, 0.4), (1, 1.9), (2, 2.2)]])
        residuals = VGroup(*[DashedLine(dot.get_center(), axes.c2p((dot.get_center()[0] - axes.get_origin()[0]) / axes.x_axis.get_unit_size(), 0), color='#ff8c69') for dot in points])
        formula = Text('resíduo perpendicular ao espaço do modelo', font_size=21, color='#ff8c69').to_edge(DOWN)
        self.play(Write(title), Create(axes), Create(line), FadeIn(points), Create(residuals), Write(formula))
        self.play(Indicate(residuals, color='#ff8c69'))
        self.wait(1)

class SVDDecomposition(Scene):
    def construct(self):
        self.camera.background_color = '#101820'
        title = Text('SVD: rotação, escala e rotação', font_size=32).to_edge(UP)
        left = NumberPlane(x_range=[-2, 2, 1], y_range=[-2, 2, 1], background_line_style={'stroke_color': '#355268', 'stroke_opacity': 0.7}).shift(LEFT * 3.8 + DOWN * 0.2)
        mid = NumberPlane(x_range=[-2, 2, 1], y_range=[-2, 2, 1], background_line_style={'stroke_color': '#355268', 'stroke_opacity': 0.7}).shift(DOWN * 0.2)
        right = NumberPlane(x_range=[-2, 2, 1], y_range=[-2, 2, 1], background_line_style={'stroke_color': '#355268', 'stroke_opacity': 0.7}).shift(RIGHT * 3.8 + DOWN * 0.2)
        circle = Circle(radius=1.0, color='#61d0c4').move_to(left.get_center())
        ellipse = Ellipse(width=2.5, height=1.0, color='#ffd166').move_to(mid.get_center())
        out = Ellipse(width=1.6, height=2.2, color='#ff8c69').move_to(right.get_center())
        labels = VGroup(Text('Vᵀ', font_size=27).next_to(left, DOWN), Text('Σ', font_size=27).next_to(mid, DOWN), Text('U', font_size=27).next_to(right, DOWN), Text('A = UΣVᵀ', font_size=24, color='#ffffff').to_edge(DOWN)).arrange(RIGHT, buff=0.35)
        self.play(Write(title), Create(left), Create(mid), Create(right), Create(circle), Create(ellipse), Create(out), Write(labels))
        self.play(Indicate(ellipse, color='#ffd166'), Indicate(out, color='#ff8c69'))
        self.wait(1)

class BlochSphereIntro(ThreeDScene):
    def construct(self):
        self.set_camera_orientation(phi=65 * DEGREES, theta=-45 * DEGREES)
        title = Text('Qubit: estado na esfera de Bloch', font_size=30).to_corner(UL)
        sphere = Sphere(radius=2, resolution=(16, 32), fill_opacity=0.12, stroke_opacity=0.35, color='#6e8da1')
        z = Arrow3D(ORIGIN, 2.5 * OUT, color='#ff8c69')
        x = Arrow3D(ORIGIN, 2.5 * RIGHT, color='#61d0c4')
        state = Arrow3D(ORIGIN, 1.7 * UP + 1.1 * RIGHT + 0.8 * OUT, color='#ffd166')
        label = Text('α|0⟩ + β|1⟩', font_size=25, color='#ffd166').to_corner(DR)
        self.add_fixed_in_frame_mobjects(title, label)
        self.play(Create(sphere), Create(z), Create(x), Create(state), Write(title), Write(label))
        self.begin_ambient_camera_rotation(rate=0.15)
        self.wait(3)
        self.stop_ambient_camera_rotation()

class QuantumGateFlow(Scene):
    def construct(self):
        self.camera.background_color = '#101820'
        title = Text('Portas quânticas: transformação reversível', font_size=32).to_edge(UP)
        q0 = Circle(radius=0.45, color='#61d0c4').shift(LEFT * 4)
        q1 = Circle(radius=0.45, color='#ffd166').shift(RIGHT * 4)
        l0 = Text('|0⟩', font_size=28).move_to(q0)
        l1 = Text('|1⟩', font_size=28).move_to(q1)
        gate = RoundedRectangle(corner_radius=0.12, width=1.7, height=1.2, color='#ff8c69').move_to(ORIGIN)
        gtext = Text('H', font_size=34, color='#ff8c69').move_to(gate)
        wire = Arrow(q0.get_right(), gate.get_left(), buff=0.15, color='#8fa6b8')
        wire2 = Arrow(gate.get_right(), q1.get_left(), buff=0.15, color='#8fa6b8')
        note = Text('amplitude muda; a medição produz probabilidades', font_size=20, color='#d8e6ef').to_edge(DOWN)
        self.play(Write(title), Create(q0), Create(q1), Write(l0), Write(l1), Create(wire), Create(wire2), Create(gate), Write(gtext), Write(note))
        self.play(Indicate(gate, color='#ff8c69'), Indicate(note, color='#61d0c4'))
        self.wait(1)
