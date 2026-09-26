from manim import *
import numpy as np
from manim_quantum import QuantumCircuit, CircuitEvaluationAnimation, StateVector, BlochSphere, BlochSphereStateTransition
from manim_dsa import MArray, MStack, MArrayStyle, MStackStyle
from manimtronics import Resistor, Capacitor, VoltageSource, Ground, wire, SignalFlow

class BellStatePortadoPT(Scene):
    def construct(self):
        title = Text('Estado de Bell: correlação entre dois qubits', font_size=31).to_edge(UP)
        circuit = QuantumCircuit(num_qubits=2)
        circuit.add_gate('H', [0])
        circuit.add_gate('CNOT', [0, 1])
        circuit.add_gate('Measure', [0])
        circuit.add_gate('Measure', [1])
        circuit.build().scale(0.9).shift(UP * 0.25)
        note = Text('H cria superposição; CNOT cria correlação', font_size=20, color='#ffd166').to_edge(DOWN)
        self.play(Write(title), Write(circuit), Write(note), run_time=1.8)
        self.play(CircuitEvaluationAnimation(circuit).create_shot_animation(run_time=1.6))
        self.wait(1)

class BlochPortadoPT(ThreeDScene):
    def construct(self):
        self.set_camera_orientation(phi=75 * DEGREES, theta=30 * DEGREES)
        title = Text('Esfera de Bloch: rotação do estado', font_size=25).to_corner(UL).shift(DOWN * 0.12)
        self.add_fixed_in_frame_mobjects(title)
        bloch = BlochSphere.basis_state('0', radius=2, arrow_thickness=0.04)
        bloch.add_labels_to_scene(self)
        self.play(Write(title), FadeIn(bloch), run_time=1.5)
        self.play(BlochSphereStateTransition(bloch, np.pi / 2, 0), run_time=1.5)
        self.play(BlochSphereStateTransition(bloch, np.pi, 0), run_time=1.5)
        self.wait(1)

class DNAStoragePortadoPT(Scene):
    def construct(self):
        title = Text('Armazenamento em DNA', font_size=34).to_edge(UP, buff=0.28)
        subtitle = Text('da mensagem digital à recuperação molecular', font_size=21, color='#b7c9d6').next_to(title, DOWN, buff=0.12)
        message_box = RoundedRectangle(width=3.25, height=2.05, corner_radius=0.16, stroke_color='#61d0c4', fill_color='#142b32', fill_opacity=1).move_to(LEFT * 4.35 + UP * 0.25)
        bases_box = RoundedRectangle(width=3.25, height=2.05, corner_radius=0.16, stroke_color='#ffd166', fill_color='#302914', fill_opacity=1).move_to(ORIGIN + UP * 0.25)
        read_box = RoundedRectangle(width=3.25, height=2.05, corner_radius=0.16, stroke_color='#b58cff', fill_color='#241d35', fill_opacity=1).move_to(RIGHT * 4.35 + UP * 0.25)
        message_label = Text('1. Mensagem digital', font_size=21, color='#61d0c4').next_to(message_box, UP, buff=0.16)
        bases_label = Text('2. Sequência de bases', font_size=21, color='#ffd166').next_to(bases_box, UP, buff=0.16)
        read_label = Text('3. Leitura e consenso', font_size=21, color='#b58cff').next_to(read_box, UP, buff=0.16)
        message = Text('BIBLIO', font_size=32, color='#e7fffb').move_to(message_box.get_center())
        bases = Text('ACGTACGTTGCA', font_size=27, color='#fff0b3').move_to(bases_box.get_center())
        recovered = Text('BIBLIO', font_size=32, color='#eee4ff').move_to(read_box.get_center())
        arrow_one = Arrow(message_box.get_right(), bases_box.get_left(), buff=0.2, stroke_width=7, max_tip_length_to_length_ratio=0.18, color='#ff8c69')
        arrow_two = Arrow(bases_box.get_right(), read_box.get_left(), buff=0.2, stroke_width=7, max_tip_length_to_length_ratio=0.18, color='#ff8c69')
        note = Text('índices e redundância ajudam a recuperar fragmentos com erros', font_size=20, color='#d8e6ef').to_edge(DOWN, buff=0.3)
        self.play(Write(title), FadeIn(subtitle), FadeIn(message_box), Write(message_label), Write(message), run_time=1.1)
        self.play(Create(arrow_one), FadeIn(bases_box), Write(bases_label), Write(bases), run_time=1.1)
        self.play(Create(arrow_two), FadeIn(read_box), Write(read_label), Write(recovered), run_time=1.1)
        self.play(Write(note), run_time=0.7)
        self.wait(2)

class EstruturasPortadasPT(Scene):
    def construct(self):
        title = Text('Estruturas de dados: array e pilha', font_size=32).to_edge(UP)
        array = MArray([1, 2, 3, 4], style=MArrayStyle.BLUE).scale(0.8).add_indexes().add_label(Text('array', font_size=20)).to_edge(LEFT, buff=0.7)
        stack = MStack([3, 7, 9], style=MStackStyle.GREEN).scale(0.8).add_label(Text('pilha', font_size=20)).to_edge(RIGHT, buff=0.7)
        note = Text('array: acesso por índice | pilha: último a entrar, primeiro a sair', font_size=19, color='#ffd166').to_edge(DOWN)
        self.play(Write(title), Create(array), Create(stack), Write(note), run_time=1.8)
        self.play(Indicate(array), Indicate(stack), run_time=1)
        self.wait(1)

class RCArduinoPortadoPT(Scene):
    def construct(self):
        title = Text('Arduino: carga de um capacitor RC', font_size=31).to_edge(UP)
        vs = VoltageSource(label='V_s').move_to(LEFT * 5 + DOWN * 0.2)
        resistor = Resistor(label='R').move_to(LEFT * 3 + UP * 1.1)
        capacitor = Capacitor(label='C').move_to(LEFT * 1 + UP * 1.1)
        ground = Ground().move_to(LEFT * 5 + DOWN * 2.3)
        wires = VGroup(wire(vs.get_terminal('positive'), LEFT * 5 + UP * 1.1, resistor.get_terminal('start')), wire(resistor.get_terminal('end'), capacitor.get_terminal('positive')), wire(capacitor.get_terminal('negative'), LEFT * 1 + DOWN * 1.6), wire(LEFT * 1 + DOWN * 1.6, LEFT * 5 + DOWN * 1.6, vs.get_terminal('negative')), wire(LEFT * 5 + DOWN * 1.6, ground.get_terminal('terminal')))
        formula = MathTex(r'V_C(t)=V_s(1-e^{-t/RC})', font_size=31, color='#ffd166').to_edge(RIGHT).shift(UP * 0.7)
        note = Text('o ADC pode ler V_C e comparar com um limiar', font_size=19, color='#d8e6ef').to_edge(DOWN)
        self.play(Write(title), FadeIn(vs), FadeIn(resistor), FadeIn(capacitor), FadeIn(ground), Create(wires), Write(formula), Write(note), run_time=2)
        self.wait(2)
