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
        title = Text('Esfera de Bloch: rotação do estado', font_size=30).to_corner(UL)
        self.add_fixed_in_frame_mobjects(title)
        bloch = BlochSphere.basis_state('0', radius=2, arrow_thickness=0.04)
        bloch.add_labels_to_scene(self)
        self.play(Write(title), FadeIn(bloch), run_time=1.5)
        self.play(BlochSphereStateTransition(bloch, np.pi / 2, 0), run_time=1.5)
        self.play(BlochSphereStateTransition(bloch, np.pi, 0), run_time=1.5)
        self.wait(1)

class DNAStoragePortadoPT(Scene):
    def construct(self):
        title = Text('Armazenamento em DNA: codificar, guardar e ler', font_size=30).to_edge(UP)
        source = Text('mensagem: BIBLIO', font_size=28, color='#61d0c4').shift(LEFT * 4 + UP * 1.2)
        dna = Text('ACGTACGTTGCA', font_size=28, color='#ffd166').shift(RIGHT * 0.2 + UP * 1.2)
        decoded = Text('mensagem recuperada: BIBLIO', font_size=25, color='#9fe3c7').shift(DOWN * 1.35)
        arrows = VGroup(Arrow(source.get_right(), dna.get_left(), buff=0.25, color='#ff8c69'), Arrow(dna.get_bottom(), decoded.get_top(), buff=0.25, color='#ff8c69'))
        labels = VGroup(Text('codificação', font_size=20).next_to(arrows[0], UP, buff=0.08), Text('sequenciamento e decodificação', font_size=20).next_to(arrows[1], RIGHT, buff=0.08))
        box = SurroundingRectangle(dna, color='#ffd166', buff=0.18)
        note = Text('redundância ajuda a recuperar a mensagem após erros de leitura', font_size=19, color='#d8e6ef').to_edge(DOWN)
        self.play(Write(title), Write(source), Create(arrows[0]), Write(labels[0]), Create(box), Write(dna), Create(arrows[1]), Write(labels[1]), Write(decoded), Write(note), run_time=2.5)
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
