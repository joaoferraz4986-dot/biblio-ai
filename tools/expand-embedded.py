#!/usr/bin/env python3
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
section_path = ROOT / 'content/packages/sistemas-embarcados-arduino/sections/projeto-profissional.json'
refs_path = ROOT / 'content/packages/sistemas-embarcados-arduino/sections/referencias.json'
section = json.loads(section_path.read_text(encoding='utf-8'))
refs = json.loads(refs_path.read_text(encoding='utf-8'))
new_id = 'sub-produto-observavel-e-seguro'
if any(block.get('id') == new_id for block in section['blocks'] if isinstance(block, dict)):
    raise SystemExit('subseção já existe; nada a fazer')
project = {
    'type': 'subsection', 'id': new_id, 'number': '10.4', 'tag': 'CAPSTONE', 'accent': 'teal',
    'title': 'Capstone: produto observável e seguro',
    'blocks': [
        {'type': 'paragraph', 'text': 'O capstone é um nó de sensoriamento que mede uma grandeza, aplica um filtro, controla um atuador e envia telemetria sem perder segurança quando o sensor, a rede ou a alimentação falham. O foco não é “fazer um Arduino funcionar”, mas demonstrar contratos entre hardware, HAL, scheduler, aplicação, armazenamento, atualização e bancada de teste.'},
        {'type': 'callout', 'variant': 'warning', 'title': 'Tempo real não é velocidade média', 'text': 'Um sistema só atende um deadline quando o pior caso do caminho relevante cabe no orçamento. Meça interrupção, fila, preempção, acesso a barramento, escrita em flash e retransmissão; uma média confortável não prova segurança temporal.'},
        {'type': 'mermaid', 'code': 'flowchart TD\n  ISR["ISR: captura mínima"] --> Q["fila bounded"]\n  Q --> CTRL["tarefa de controle"]\n  CTRL --> HAL["HAL: sensor e atuador"]\n  CTRL --> LOG["telemetria local"]\n  LOG --> NET["rede opcional"]\n  SAFE["watchdog + estado seguro"] --> CTRL\n  BOOT["bootloader + imagem assinada"] --> APP["aplicação"]\n  APP --> CTRL', 'caption': 'Separação entre interrupção, fila, controle, HAL, telemetria e atualização reduz acoplamento e facilita testes.'},
        {'type': 'table', 'header': ['Requisito', 'Orçamento inicial', 'Instrumentação', 'Falha segura'], 'rows': [
            ['Amostragem', 'período 2 ms; jitter <= 0,5 ms', 'timer capture + timestamp monotônico', 'degradar controle e registrar evento'],
            ['Controle', 'deadline 1 ms; WCET medido', 'GPIO de trace + cycle counter', 'atuador em estado conhecido'],
            ['Comunicação', 'fila de 32 mensagens; timeout 100 ms', 'contadores de drop e retransmissão', 'continuar modo local'],
            ['Energia', 'brownout detectado antes da escrita', 'ADC, reset cause e log circular', 'desligar saída e preservar estado mínimo'],
            ['Atualização', 'imagem verificada antes de boot', 'hash, versão e rollback', 'iniciar imagem anterior conhecida']
        ]},
        {'type': 'code', 'language': 'c', 'title': 'Fronteira ISR–tarefa e estado seguro', 'code': '''typedef enum { RUNNING, DEGRADED, SAFE } device_state_t;
static QueueHandle_t samples;
static volatile device_state_t state = RUNNING;

void ADC_IRQHandler(void) {
    sample_t s = adc_read_minimal();
    BaseType_t wake = pdFALSE;
    xQueueSendFromISR(samples, &s, &wake);
    portYIELD_FROM_ISR(wake);
}

void control_task(void *arg) {
    TickType_t deadline = xTaskGetTickCount();
    for (;;) {
        sample_t s;
        if (xQueueReceive(samples, &s, pdMS_TO_TICKS(1)) != pdPASS) {
            state = DEGRADED; actuator_safe_output(); continue;
        }
        if (!sensor_is_valid(s)) { state = SAFE; actuator_safe_output(); continue; }
        actuator_write(control_step(s));
        deadline += pdMS_TO_TICKS(2);
        vTaskDelayUntil(&deadline, pdMS_TO_TICKS(2));
    }
}''', 'lineNumbers': True},
        {'type': 'steps', 'items': [
            {'title': 'Especificar', 'text': 'Congele placa, periféricos, alimentação, deadlines, modos de falha, volume e requisitos legais.'},
            {'title': 'Isolar a HAL', 'text': 'Defina interfaces para sensor, clock, armazenamento e rede; mantenha uma implementação fake para testes no host.'},
            {'title': 'Medir o pior caso', 'text': 'Instrumente ISR, tarefas, filas, flash e comunicação; documente WCET observado e margem.'},
            {'title': 'Falhar deliberadamente', 'text': 'Desconecte sensor, injete pacote inválido, force timeout, brownout e imagem corrompida.'},
            {'title': 'Atualizar com rollback', 'text': 'Valide integridade e versão antes de ativar a imagem; preserve a última imagem inicializável.'},
            {'title': 'Liberar com evidência', 'text': 'Entregue firmware, esquemático, pinout, BOM, logs, testes, versão da toolchain e limitações conhecidas.'}
        ]},
        {'type': 'exercise', 'id': 'ex-produto-observavel-seguro', 'number': '10.4.1', 'difficulty': 'dificil', 'prompt': 'Transforme um protótipo que lê um sensor a cada 2 ms e envia dados por rádio em um produto testável. Entregue diagrama de tarefas, orçamento temporal, contrato de fila, estratégia de watchdog e plano de rollback.', 'hint': 'Separe ISR de processamento, trate filas cheias e prove o comportamento quando a rede desaparece.', 'solutionBlocks': [
            {'type': 'paragraph', 'text': 'A ISR deve capturar o mínimo e enfileirar uma amostra bounded; a tarefa de controle recebe com timeout e tem prioridade compatível com o deadline. Telemetria não pode bloquear o controle: deve perder ou agregar amostras com contador explícito. O watchdog é alimentado somente por uma supervisão que verifica progresso das tarefas, não por um loop cego. A atualização valida hash e versão, grava a nova imagem em slot separado e volta ao slot anterior quando o boot ou o self-test falha.'},
            {'type': 'table', 'header': ['Teste', 'Injeção', 'Resultado esperado'], 'rows': [['sensor ausente', 'remover leitura por 500 ms', 'atuador seguro, evento e recuperação'], ['fila cheia', 'aumentar taxa de ISR', 'contador de drop, sem corrupção'], ['rádio indisponível', 'bloquear ACK', 'controle local continua no deadline'], ['imagem inválida', 'alterar um byte', 'boot rejeita e faz rollback']]}
        ]}
    ]
}
section['blocks'].append(project)
section_path.write_text(json.dumps(section, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
items = refs['blocks'][1]['items']
for item in [
    'Arm, Cortex-M resources and Architecture Reference Manuals. https://developer.arm.com/community/arm-community-blogs/b/architectures-and-processors-blog/posts/cortex-m-resources',
    'FreeRTOS, RTOS Fundamentals. https://www.freertos.org/Documentation/01-FreeRTOS-quick-start/01-Beginners-guide/01-RTOS-fundamentals',
    'Zephyr Project, Introduction and kernel features. https://docs.zephyrproject.org/latest/introduction/index.html'
]:
    if item not in items: items.append(item)
refs_path.write_text(json.dumps(refs, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Capstone embarcado e referências adicionados.')
