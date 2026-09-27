from manim import *

class PotencialDeAcaoPT(Scene):
    def construct(self):
        self.camera.background_color = '#101820'
        title = Text('Potencial de ação', font_size=34).to_edge(UP)
        axes = Axes(x_range=[0, 8, 1], y_range=[-90, 45, 30], x_length=7.2, y_length=4.7, axis_config={'color': '#8fa6b8'}, tips=False).shift(LEFT * 1.25 + DOWN * 0.25)
        points = [(0, -70), (0.8, -70), (1.3, -55), (1.8, 35), (2.5, 20), (3.2, -70), (4.1, -82), (5.2, -70), (8, -70)]
        curve = VMobject(color='#61d0c4', stroke_width=5).set_points_smoothly([axes.c2p(x, y) for x, y in points])
        limiar = DashedLine(axes.c2p(0, -55), axes.c2p(8, -55), color='#ff8c69', stroke_width=2)
        repouso = DashedLine(axes.c2p(0, -70), axes.c2p(8, -70), color='#6e8da1', stroke_width=2)
        axis_labels = VGroup(Text('limiar', font_size=17, color='#ff8c69'), Text('repouso', font_size=17, color='#b7d2df')).arrange(DOWN, aligned_edge=LEFT, buff=0.12).next_to(axes, RIGHT, buff=0.18).shift(DOWN * 0.5)
        legend_box = RoundedRectangle(corner_radius=0.12, width=3.0, height=2.25, stroke_color='#6e8da1', fill_color='#142532', fill_opacity=1).to_corner(UR).shift(DOWN * 0.55)
        legend_title = Text('Fases', font_size=22, color='#ffd166').next_to(legend_box.get_top(), DOWN, buff=0.12)
        legend = VGroup(Text('despolarização', font_size=17, color='#ffd166'), Text('repolarização', font_size=17, color='#ff8c69'), Text('hiperpolarização', font_size=17, color='#b58cff')).arrange(DOWN, aligned_edge=LEFT, buff=0.12).move_to(legend_box.get_center() + DOWN * 0.14)
        caption = Text('Na⁺ entra → a voltagem sobe; K⁺ sai → a voltagem retorna', font_size=19, color='#d8e6ef').to_edge(DOWN)
        self.play(Write(title), Create(axes), Create(limiar), Create(repouso), Create(curve), Write(axis_labels), FadeIn(legend_box), Write(legend_title), Write(legend), Write(caption))
        self.wait(2)
        self.play(FadeOut(VGroup(title, axes, limiar, repouso, curve, axis_labels, legend_box, legend_title, legend, caption)), run_time=0.8)
