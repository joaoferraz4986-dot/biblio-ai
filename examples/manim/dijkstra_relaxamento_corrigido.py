from manim import *

class DijkstraRelaxamentoCorrigido(Scene):
    def construct(self):
        self.camera.background_color = "#101820"
        title = Text("Dijkstra: relaxamento e pesos", font_size=34, color=WHITE).to_edge(UP)
        subtitle = Text("pesos não negativos · menor distância provisória", font_size=18, color="#9fb3c8").next_to(title, DOWN, buff=0.12)
        self.play(Write(title), FadeIn(subtitle))

        points = {
            "S": LEFT * 4.2 + UP * 1.0,
            "A": LEFT * 1.8 + UP * 1.0,
            "B": RIGHT * 1.8 + UP * 1.0,
            "C": LEFT * 1.8 + DOWN * 1.35,
            "D": RIGHT * 1.8 + DOWN * 1.35,
        }
        edges = [
            ("S", "A", "1", UP * 0.22),
            ("S", "B", "4", UP * 0.22),
            ("A", "B", "2", RIGHT * 0.34),
            ("A", "C", "2", UP * 0.22),
            ("B", "D", "1", UP * 0.22),
            ("C", "D", "3", UP * 0.22),
        ]
        lines = VGroup()
        weights = VGroup()
        edge_map = {}
        for u, v, weight, offset in edges:
            line = Line(points[u], points[v], color="#52718d", stroke_width=4)
            label = Text(weight, font_size=25, color="#ffd166").move_to(line.get_center() + offset)
            lines.add(line)
            weights.add(label)
            edge_map[(u, v)] = (line, label)

        nodes = VGroup()
        labels = VGroup()
        for name, point in points.items():
            node = Circle(radius=0.34, stroke_width=4, color="#5ec6b0", fill_color="#193242", fill_opacity=1).move_to(point)
            label = Text(name, font_size=25, color=WHITE).move_to(point)
            nodes.add(node)
            labels.add(label)

        distances = {name: Text("∞", font_size=22, color="#9fb3c8").next_to(points[name], DOWN, buff=0.18) for name in points}
        distances["S"].become(Text("0", font_size=22, color="#9fe3c7").next_to(points["S"], DOWN, buff=0.18))
        graph = VGroup(lines, weights, nodes, labels, *distances.values())
        self.play(Create(lines), FadeIn(weights), Create(nodes), Write(labels), FadeIn(VGroup(*distances.values())))

        queue = Text("fila de prioridade: (0, S)", font_size=21, color="#c9d7e5").to_edge(DOWN)
        self.play(Write(queue))

        def relax(u, v, value, queue_text):
            line, label = edge_map[(u, v)]
            new_distance = Text(str(value), font_size=22, color="#9fe3c7").next_to(points[v], DOWN, buff=0.18)
            pulse = line.copy().set_color("#5ec6b0").set_stroke(width=8)
            new_queue = Text(queue_text, font_size=21, color="#c9d7e5").to_edge(DOWN)
            self.play(Indicate(label, color="#ffd166"), Create(pulse), run_time=0.55)
            self.play(Transform(distances[v], new_distance), Transform(queue, new_queue), FadeOut(pulse), run_time=0.7)

        relax("S", "A", 1, "fila de prioridade: (1, A), (4, B)")
        relax("A", "B", 3, "fila de prioridade: (3, B), (4, B)")
        relax("A", "C", 3, "fila de prioridade: (3, B), (3, C), (4, B)")
        relax("B", "D", 4, "fila de prioridade: (3, C), (4, D)")
        final = Text("quando a menor distância sai da fila, ela é finalizada", font_size=21, color="#9fe3c7").to_edge(DOWN)
        self.play(Transform(queue, final))
        self.play(Circumscribe(nodes[0], color="#5ec6b0"), Circumscribe(nodes[1], color="#5ec6b0"), Circumscribe(nodes[2], color="#5ec6b0"), run_time=1.2)
        self.wait(1.2)
