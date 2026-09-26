from manim import *

class PotencialDeAcaoPT(Scene):
    def construct(self):
        self.camera.background_color = '#101820'
        title = Text('Potencial de ação: fases da membrana', font_size=32).to_edge(UP)
        axes = Axes(x_range=[0, 8, 1], y_range=[-90, 45, 30], x_length=9, y_length=4.8, axis_config={'color': '#8fa6b8'}, tips=False).shift(DOWN * 0.15)
        curve = VMobject(color='#61d0c4', stroke_width=5)
        samples = [(0, -70), (0.8, -70), (1.3, -55), (1.8, 35), (2.5, 20), (3.2, -70), (4.1, -82), (5.2, -70), (8, -70)]
        curve.set_points_smoothly([axes.c2p(x, y) for x, y in samples])
        limiar = DashedLine(axes.c2p(0, -55), axes.c2p(8, -55), color='#ff8c69', stroke_width=2)
        repouso = DashedLine(axes.c2p(0, -70), axes.c2p(8, -70), color='#6e8da1', stroke_width=2)
        labels = VGroup(
            Text('repouso', font_size=18, color='#b7d2df').next_to(axes.c2p(7.4, -70), RIGHT, buff=0.08),
            Text('limiar', font_size=18, color='#ff8c69').next_to(axes.c2p(7.4, -55), RIGHT, buff=0.08),
            Text('despolarização', font_size=19, color='#ffd166').move_to(axes.c2p(1.35, 47)),
            Text('repolarização', font_size=19, color='#ff8c69').move_to(axes.c2p(2.75, 38)),
            Text('hiperpolarização', font_size=18, color='#b58cff').move_to(axes.c2p(4.2, -88)),
        )
        phase_arrows = VGroup(
            Arrow(axes.c2p(1.25, -50), axes.c2p(1.75, 20), buff=0.05, color='#ffd166'),
            Arrow(axes.c2p(2.45, 20), axes.c2p(3.1, -55), buff=0.05, color='#ff8c69'),
        )
        caption = Text('Na⁺ entra → a voltagem sobe; K⁺ sai → a voltagem retorna', font_size=20, color='#d8e6ef').to_edge(DOWN)
        self.play(Write(title), Create(axes), Create(limiar), Create(repouso), Create(curve), Write(labels), Create(phase_arrows), Write(caption))
        self.wait(2)
        self.play(FadeOut(VGroup(*labels, *phase_arrows, caption, curve, limiar, repouso, axes, title)), run_time=0.8)
