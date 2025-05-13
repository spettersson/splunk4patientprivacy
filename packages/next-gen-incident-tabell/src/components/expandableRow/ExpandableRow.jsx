import React from 'react';
import { ExpandableRowContainer } from './ExpandableRowStyles';

const ExpandableRow = ({ data, fieldMapping }) => {
    if (!data || !fieldMapping) return null;

    return (
        <ExpandableRowContainer>
            <h4>Ytterligare Information</h4>
            <p>
                <strong>Beskrivning:</strong> {data[fieldMapping.beskrivning]}
            </p>
            <p>
                <strong>Larm ID:</strong> {data[fieldMapping.incident_ID]}
            </p>
            <p>
                <strong>Personal ID:</strong> {data[fieldMapping.personal_ID]}
            </p>
            <p>
                <strong>Patient ID:</strong> {data[fieldMapping.patient_ID]}
            </p>
            <p>
                <strong>Status:</strong> {data[fieldMapping.status]}
            </p>
        </ExpandableRowContainer>
    );
};

export default ExpandableRow;
