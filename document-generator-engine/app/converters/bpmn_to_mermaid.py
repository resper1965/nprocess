"""
BPMN to Mermaid Converter
Converts BPMN 2.0 XML to Mermaid flowchart syntax
"""

import logging
import xml.etree.ElementTree as ET
from typing import Dict, List, Tuple, Optional
import re

logger = logging.getLogger(__name__)


class BPMNToMermaidConverter:
    """
    Converts BPMN 2.0 XML to Mermaid flowchart

    Mermaid syntax reference:
    - flowchart TB (top to bottom)
    - A[Rectangle] - Task
    - B{Diamond} - Gateway
    - C([Rounded]) - Event
    - A --> B - Sequence flow
    """

    def __init__(self):
        self.namespaces = {
            'bpmn': 'http://www.omg.org/spec/BPMN/20100524/MODEL',
            'bpmndi': 'http://www.omg.org/spec/BPMN/20100524/DI',
            'dc': 'http://www.omg.org/spec/DD/20100524/DC',
            'di': 'http://www.omg.org/spec/DD/20100524/DI'
        }

        self.node_map = {}  # Maps BPMN IDs to sanitized Mermaid IDs
        self.node_labels = {}  # Maps BPMN IDs to labels
        self.sequence_flows = []  # List of (from, to, label) tuples

    def convert(self, bpmn_xml: str) -> str:
        """
        Convert BPMN XML to Mermaid flowchart

        Args:
            bpmn_xml: BPMN 2.0 XML string

        Returns:
            Mermaid flowchart syntax
        """
        try:
            # Parse XML
            root = ET.fromstring(bpmn_xml)

            # Find process element
            process = root.find('.//bpmn:process', self.namespaces)
            if process is None:
                raise ValueError("No process element found in BPMN XML")

            # Reset state
            self.node_map = {}
            self.node_labels = {}
            self.sequence_flows = []

            # Extract all elements
            self._extract_start_events(process)
            self._extract_end_events(process)
            self._extract_tasks(process)
            self._extract_gateways(process)
            self._extract_sequence_flows(process)

            # Generate Mermaid syntax
            mermaid = self._generate_mermaid()

            return mermaid

        except Exception as e:
            logger.error(f"Error converting BPMN to Mermaid: {str(e)}")
            raise

    def _extract_start_events(self, process):
        """Extract start events"""
        start_events = process.findall('.//bpmn:startEvent', self.namespaces)

        for event in start_events:
            event_id = event.get('id')
            event_name = event.get('name', 'Start')

            mermaid_id = self._sanitize_id(event_id)
            self.node_map[event_id] = mermaid_id
            self.node_labels[event_id] = (mermaid_id, event_name, 'start_event')

    def _extract_end_events(self, process):
        """Extract end events"""
        end_events = process.findall('.//bpmn:endEvent', self.namespaces)

        for event in end_events:
            event_id = event.get('id')
            event_name = event.get('name', 'End')

            mermaid_id = self._sanitize_id(event_id)
            self.node_map[event_id] = mermaid_id
            self.node_labels[event_id] = (mermaid_id, event_name, 'end_event')

    def _extract_tasks(self, process):
        """Extract tasks (all types: task, userTask, serviceTask, etc.)"""
        task_types = [
            'task',
            'userTask',
            'serviceTask',
            'scriptTask',
            'businessRuleTask',
            'sendTask',
            'receiveTask',
            'manualTask'
        ]

        for task_type in task_types:
            tasks = process.findall(f'.//bpmn:{task_type}', self.namespaces)

            for task in tasks:
                task_id = task.get('id')
                task_name = task.get('name', task_type)

                mermaid_id = self._sanitize_id(task_id)
                self.node_map[task_id] = mermaid_id
                self.node_labels[task_id] = (mermaid_id, task_name, 'task')

    def _extract_gateways(self, process):
        """Extract gateways (exclusive, parallel, inclusive)"""
        gateway_types = [
            'exclusiveGateway',
            'parallelGateway',
            'inclusiveGateway',
            'eventBasedGateway'
        ]

        for gateway_type in gateway_types:
            gateways = process.findall(f'.//bpmn:{gateway_type}', self.namespaces)

            for gateway in gateways:
                gateway_id = gateway.get('id')
                gateway_name = gateway.get('name', '')

                mermaid_id = self._sanitize_id(gateway_id)
                self.node_map[gateway_id] = mermaid_id

                # Determine gateway label
                if gateway_name:
                    label = gateway_name
                elif 'exclusive' in gateway_type.lower():
                    label = 'Decision'
                elif 'parallel' in gateway_type.lower():
                    label = 'Parallel'
                else:
                    label = 'Gateway'

                self.node_labels[gateway_id] = (mermaid_id, label, 'gateway')

    def _extract_sequence_flows(self, process):
        """Extract sequence flows (connections between nodes)"""
        flows = process.findall('.//bpmn:sequenceFlow', self.namespaces)

        for flow in flows:
            flow_id = flow.get('id')
            source_ref = flow.get('sourceRef')
            target_ref = flow.get('targetRef')
            flow_name = flow.get('name', '')

            if source_ref in self.node_map and target_ref in self.node_map:
                source_id = self.node_map[source_ref]
                target_id = self.node_map[target_ref]
                self.sequence_flows.append((source_id, target_id, flow_name))

    def _generate_mermaid(self) -> str:
        """Generate Mermaid flowchart syntax from extracted data"""
        lines = []

        # Header
        lines.append("```mermaid")
        lines.append("flowchart TD")
        lines.append("")

        # Node definitions
        lines.append("    %% Nodes")
        for bpmn_id, (mermaid_id, label, node_type) in self.node_labels.items():
            # Escape special characters in labels
            escaped_label = label.replace('"', '&quot;')

            if node_type == 'start_event':
                # Start events: (( ))
                lines.append(f'    {mermaid_id}(("{escaped_label}"))')
            elif node_type == 'end_event':
                # End events: (( ))
                lines.append(f'    {mermaid_id}(("{escaped_label}"))')
            elif node_type == 'gateway':
                # Gateways: { }
                lines.append(f'    {mermaid_id}{{{escaped_label}}}')
            else:
                # Tasks: [ ]
                lines.append(f'    {mermaid_id}["{escaped_label}"]')

        lines.append("")
        lines.append("    %% Flows")

        # Sequence flows
        for source, target, label in self.sequence_flows:
            if label:
                # Flow with label
                escaped_label = label.replace('"', '&quot;')
                lines.append(f'    {source} -->|"{escaped_label}"| {target}')
            else:
                # Flow without label
                lines.append(f'    {source} --> {target}')

        lines.append("```")

        return '\n'.join(lines)

    def _sanitize_id(self, bpmn_id: str) -> str:
        """
        Sanitize BPMN ID for use in Mermaid

        Mermaid IDs must:
        - Start with a letter
        - Contain only letters, numbers, underscores
        """
        # Remove namespace prefixes
        clean_id = bpmn_id.split(':')[-1]

        # Replace non-alphanumeric with underscore
        clean_id = re.sub(r'[^a-zA-Z0-9_]', '_', clean_id)

        # Ensure starts with letter
        if not clean_id[0].isalpha():
            clean_id = 'n_' + clean_id

        # Truncate if too long
        if len(clean_id) > 30:
            clean_id = clean_id[:30]

        return clean_id


def convert_bpmn_to_mermaid(bpmn_xml: str) -> str:
    """
    Convenience function to convert BPMN to Mermaid

    Args:
        bpmn_xml: BPMN 2.0 XML string

    Returns:
        Mermaid flowchart syntax
    """
    converter = BPMNToMermaidConverter()
    return converter.convert(bpmn_xml)
