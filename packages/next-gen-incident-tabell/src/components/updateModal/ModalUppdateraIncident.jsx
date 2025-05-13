import React, { useState, useEffect } from 'react';
import Modal from '@splunk/react-ui/Modal';
import ControlGroup from '@splunk/react-ui/ControlGroup';
import Select from '@splunk/react-ui/Select';
import QuestionCircle from '@splunk/react-icons/QuestionCircle';
import TextArea from '@splunk/react-ui/TextArea';
import {
    GlobalStyles,
    ResizableTextAreaWrapper,
    StyledButton,
    StyledParagraph,
} from './ModalUppdateraIncidentStyles';
import Tooltip from '@splunk/react-ui/Tooltip';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import IncidentTimeline from './IncidentTimeline';

const defaultIncident = {
    titel: 'Ingen titel',
    beskrivning: 'Ingen beskrivning',
    personal_ID: 'N/A',
    patient_ID: 'N/A',
    incident_ID: 'N/A',
};

const ModalUppdatera = ({ isOpen, incident, onClose, onSave }) => {
    const [status, setStatus] = useState('Ej utredd');
    const [note, setNote] = useState('');
    const [currentStatus, setCurrentStatus] = useState('Ej utredd');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (incident) {
            const incidentStatus = incident.status || 'Ej utredd';
            setCurrentStatus(incidentStatus);
            setStatus(incidentStatus);
            setNote('');
        }
    }, [incident]);

    const handleSave = async () => {
        setIsLoading(true);
        const updatedIncident = {
            incident_ID: displayIncident.incident_ID,
            status,
            note,
        };
        const tokens = {
            incident_ID: updatedIncident.incident_ID,
            status: updatedIncident.status,
            note: updatedIncident.note,
        };
        await onSave(tokens);
        setCurrentStatus(status);
        setIsLoading(false);
    };

    const displayIncident = { ...defaultIncident, ...incident };

    const statusOptions = [
        { label: 'Ej utredd', value: 'Ej utredd' },
        { label: 'Under utredning', value: 'Under utredning' },
        { label: 'Godkänd hantering av journal', value: 'Godkänd hantering av journal' },
        { label: 'Icke godkänd hantering av journal', value: 'Icke godkänd hantering av journal' },
    ].map((option) => ({
        ...option,
        label: option.value === currentStatus ? `${option.label} (nuvarande)` : option.label,
    }));

    if (!isOpen) return null;

    return (
        <>
            <GlobalStyles />
            <Modal onRequestClose={onClose} open={isOpen}>
                <Modal.Header
                    onRequestClose={onClose}
                    title="Hantering av incident"
                    subtitle={`Incident ID: ${displayIncident.incident_ID}`}
                    className="modal-header"
                    style={{ backgroundColor: '#002C5A' }}
                />
                <Modal.Body>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div>
                            <h3 style={{ color: '#0F2C57', fontSize: '20px' }}>Information</h3>
                            <StyledParagraph>
                                <strong>Titel:</strong> {displayIncident.titel}
                            </StyledParagraph>
                            <StyledParagraph>
                                <strong>Beskrivning:</strong> {displayIncident.beskrivning}
                            </StyledParagraph>
                            <StyledParagraph>
                                <strong>Personal ID:</strong> {displayIncident.personal_ID}
                            </StyledParagraph>
                            <StyledParagraph>
                                <strong>Patient ID:</strong> {displayIncident.patient_ID}
                            </StyledParagraph>
                            <div>
                                <h3 style={{ color: '#0F2C57', fontSize: '20px' }}>Uppdatera</h3>
                                <ControlGroup
                                    label={
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                fontSize: '16px',
                                                color: '#0F2C57',
                                            }}
                                        >
                                            Status
                                            <Tooltip
                                                content={
                                                    <div>
                                                        Välj en ny status för incidenten.
                                                        <br />
                                                        <br />
                                                        Alternativ och innebörd:
                                                        <ul
                                                            style={{
                                                                paddingLeft: '20px',
                                                                margin: 0,
                                                            }}
                                                        >
                                                            <li>
                                                                Ej utredd = en utredning av
                                                                incidenten har inte påbörjats.
                                                            </li>
                                                            <li>
                                                                Under utredning = en utredning av
                                                                incident har påbörjat, men några
                                                                slutsatser har inte dragits.
                                                            </li>
                                                            <li>
                                                                Godkänd hantering av journal =
                                                                slutsatsen har dragits att det är en
                                                                godkänd hantering av journal.
                                                            </li>
                                                            <li>
                                                                Icke godkänd hantering av journal =
                                                                slutsatsen har dragits att det är en
                                                                icke godkänd hantering av journal.
                                                            </li>
                                                        </ul>
                                                    </div>
                                                }
                                            >
                                                <QuestionCircle
                                                    size={1}
                                                    style={{
                                                        marginLeft: '5px',
                                                        cursor: 'pointer',
                                                        fill: '#49A2F6',
                                                    }}
                                                />
                                            </Tooltip>
                                        </div>
                                    }
                                    htmlFor="status-select"
                                >
                                    <Select
                                        id="status-select"
                                        value={status}
                                        onChange={(e, { value }) => setStatus(value)}
                                        style={{
                                            color: 'black',
                                            border: 'solid 1px lightgray',
                                            minWidth: '300px',
                                        }}
                                    >
                                        {statusOptions.map((option) => (
                                            <Select.Option
                                                key={option.value}
                                                label={option.label}
                                                value={option.value}
                                            />
                                        ))}
                                    </Select>
                                </ControlGroup>

                                <ControlGroup
                                    label={
                                        <div
                                            style={{
                                                fontSize: '16px',
                                                color: '#0F2C57',
                                            }}
                                        >
                                            Lägg till en kommentar
                                        </div>
                                    }
                                    htmlFor="note-textarea"
                                >
                                    <ResizableTextAreaWrapper>
                                        <TextArea
                                            id="note-textarea"
                                            value={note}
                                            onChange={(e, { value }) => setNote(value)}
                                            placeholder="Skriv en kommentar..."
                                        />
                                    </ResizableTextAreaWrapper>
                                </ControlGroup>
                            </div>
                        </div>
                        <div>
                            <IncidentTimeline incident={displayIncident} />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ backgroundColor: 'white' }}>
                    <StyledButton
                        label={
                            isLoading ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    Spara <WaitSpinner size="medium" />
                                </div>
                            ) : (
                                'Spara'
                            )
                        }
                        disabled={isLoading}
                        onClick={handleSave}
                    />
                    <StyledButton label="Avbryt" onClick={onClose} />
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ModalUppdatera;
