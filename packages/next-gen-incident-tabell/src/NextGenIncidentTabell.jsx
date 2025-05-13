import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import Button from '@splunk/react-ui/Button';
import SearchJob from '@splunk/search-job';
import Tooltip from '@splunk/react-ui/Tooltip';
import Paginator from '@splunk/react-ui/Paginator';
import ModalUppdatera from './components/updateModal/ModalUppdateraIncident';
import ExpandableRow from './components/expandableRow/ExpandableRow';
import SplunkVisualization from '@splunk/visualizations/common/SplunkVisualization'; // Kept for future integration
import { cloneDeep } from 'lodash';
import Filter from '@splunk/react-icons/enterprise/Filter';
import QuestionCircle from '@splunk/react-icons/QuestionCircle';
import { FaClock } from 'react-icons/fa';
import { FaUserDoctor } from 'react-icons/fa6';
import { IoPerson } from 'react-icons/io5';
import {
    Table,
    Menu,
    GlobalStyles,
    StyledMenuHeading,
    QuestionIconWrapper,
    NextGenTableContainer,
} from './NextGenIncidentTabellStyles';
import { useDashboardCoreApi } from '@splunk/dashboard-context';

const filterableFields = ['Larm ID', 'Patient ID', 'Personal ID', 'Status']; // Replace with the fields you want to make filterable
const columnsTooltipDescription = {
    'Larm ID':
        'Välj en eller flera larm ID som filter för de incidenter som presenteras i tabellen. Notera att de alternativ som finns tillgängliga påverkas av andra filter som är satta, till exempel för personal ID.',
    'Patient ID':
        'Välj en eller flera patient ID som filter för de incidenter som presenteras i tabellen. Notera att de alternativ som finns tillgängliga påverkas av andra filter som är satta, till exempel för personal ID.',
    'Personal ID':
        'Välj en eller flera personal ID som filter för de incidenter som presenteras i tabellen. Notera att de alternativ som finns tillgängliga påverkas av andra filter som är satta, till exempel för patient ID.',
    SLA: 'De filter som är tillgängliga.',
    Status: 'Välj en eller flera statusar som filter för de incidenter som presenteras i tabellen. Notera att de alternativ som finns tillgängliga påverkas av andra filter som är satta, till exempel för larm ID.',
};

const formatData = (dataSources) => {
    if (!dataSources?.primary?.data) {
        return {
            fields: [],
            data: [],
        };
    }

    const fields = dataSources.primary.data.fields.map((f) => f.name);
    const data = [];

    dataSources.primary.data.columns.forEach((col, i) => {
        col.forEach((item, j) => {
            if (!data[j]) {
                data.push({});
            }
            data[j][fields[i]] = item;
        });
    });

    return { fields, data };
};

const NextGenIncidentTabell = ({ options, dataSources }) => {
    const dashboardCoreApi = useDashboardCoreApi();
    const [tableData, setTableData] = useState(formatData(dataSources));
    const [expandedRow, setExpandedRow] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [filters, setFilters] = useState({});
    const [tempFilters, setTempFilters] = useState({});

    const itemsPerPage = 6;
    const [currentPage, setCurrentPage] = useState(1);

    // Dynamic field mapping for flexibility with field names
    const fieldMapping = {
        titel: tableData.fields.find((field) => field === 'Titel'),
        incident_ID: tableData.fields.find((field) => field === 'Larm ID'),
        beskrivning: tableData.fields.find((field) => field === 'Beskrivning'),
        personal_ID: tableData.fields.find((field) => field === 'Personal ID'),
        patient_ID: tableData.fields.find((field) => field === 'Patient ID'),
        status: tableData.fields.find((field) => field === 'Status'),
        sla: tableData.fields.find((field) => field === 'SLA'),
    };

    useEffect(() => {
        if (!dataSources || Object.keys(dataSources).length === 0) {
            console.error('dataSources is not defined or empty.');
            return;
        }

        console.log('Available dataSources:', dataSources);

        if (dataSources.primary && dataSources.primary.data) {
            setTableData(formatData(dataSources));
        } else {
            console.error('Primary data source is empty or undefined.');
        }
    }, [dataSources]);

    const handleExpandRow = (row) => {
        setExpandedRow((prev) =>
            prev?.[fieldMapping.incident_ID] === row[fieldMapping.incident_ID] ? null : row
        );
    };

    const handleOpenModal = (row) => {
        const mappedIncident = Object.keys(fieldMapping).reduce((acc, key) => {
            acc[key] = row[fieldMapping[key]] || 'N/A';
            return acc;
        }, {});
        setSelectedIncident(mappedIncident);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedIncident(null);
    };

    const handleSave = async (tokens) => {
        console.log('Executing update incident search with dynamic tokens.');
        console.log('Received tokens:', tokens);

        if (!dashboardCoreApi) {
            console.error('DashboardCoreApi is not initialized.');
            return;
        }
        var realname = '';
        const userPromise = new Promise((resolve) => {
            const userSearchJob = SearchJob.create({
                search: `|rest /services/authentication/current-context |table realname`,
            });
            userSearchJob.getResults().subscribe((results) => {
                realname = results?.results[0]?.realname;
                resolve();
            });
        });
        await userPromise;

        const promise = new Promise((resolve) => {
            const mySearchJob = SearchJob.create({
                search: `| makeresults | eval incident_ID=\"${tokens.incident_ID}\" | eval updated_status=\"${tokens.status}\" | eval comment_made=\"${tokens.note}\" | eval user=\"${realname}\" | collect index=incidentuppdatering source=incidentuppdatering`,
            });
            mySearchJob.getProgress().subscribe({
                next: (searchState) => {
                    // Do something with the search state.
                },
                error: (err) => {
                    // The search failed. Do something with the err.
                },
                complete: () => {
                    console.log('Event generated:', tokens);
                    resolve();
                },
            });
        });
        await promise;
        await new Promise((resolve) => setTimeout(resolve, 1000));
        dashboardCoreApi.refreshVisualization('incident_table');
        await new Promise((resolve) => setTimeout(resolve, 300));
        console.log('Updated the visualisation');

        setModalOpen(false);
        setSelectedIncident(null);
    };

    const getFilteredData = () => {
        if (!Object.keys(filters).length) return tableData.data;

        return tableData.data.filter((row) =>
            Object.entries(filters).every(([key, values]) =>
                values.length ? values.includes(row[key]) : true
            )
        );
    };

    const getFilterValues = (field) => {
        return [...new Set(getFilteredData().map((row) => row[field]))];
    };

    const toggleTempFilterValue = (field, value) => {
        setTempFilters((prev) => {
            const newTemp = cloneDeep(prev);
            newTemp[field] = newTemp[field] || [];
            if (newTemp[field].includes(value)) {
                newTemp[field] = newTemp[field].filter((v) => v !== value);
            } else {
                newTemp[field].push(value);
            }
            return newTemp;
        });
    };

    const applyFilters = (field) => {
        setFilters((prev) => ({
            ...prev,
            [field]: tempFilters[field] || [],
        }));
    };

    const clearFilters = (field) => {
        setTempFilters((prev) => {
            const newTemp = cloneDeep(prev);
            delete newTemp[field];
            return newTemp;
        });
        setFilters((prev) => {
            const newFilters = cloneDeep(prev);
            delete newFilters[field];
            return newFilters;
        });
    };
    const filteredData = getFilteredData();
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <NextGenTableContainer>
            <GlobalStyles />
            <div>
                <Button
                    label="Refresh"
                    className="knapp-uppdatera"
                    onClick={() => dashboardCoreApi.refreshVisualization('incident_table')}
                />
            </div>

            <Table>
                <Table.Head>
                    {tableData.fields.map((field) => (
                        <Table.HeadDropdownCell
                            key={field}
                            className={`${filterableFields.includes(field) ? 'filterable' : ''}`}
                            label={
                                filterableFields.includes(field) ? (
                                    <>
                                        <Filter size={1} />
                                        {field}
                                        {filters[field]?.length > 0 && (
                                            <span
                                                style={{
                                                    marginLeft: '8px',
                                                    fontSize: '0.8em',
                                                    color: '#999',
                                                }}
                                            >
                                                ({filters[field].length}/
                                                {getFilterValues(field).length})
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    field
                                )
                            }
                        >
                            {filterableFields.includes(field) && (
                                <Menu>
                                    <StyledMenuHeading>
                                        Välj och applicera filter för "{field}"
                                        <Tooltip content={columnsTooltipDescription[field]}>
                                            <QuestionIconWrapper>
                                                <QuestionCircle size={1.5} />
                                            </QuestionIconWrapper>
                                        </Tooltip>
                                    </StyledMenuHeading>
                                    {getFilterValues(field).map((value) => (
                                        <Menu.Item
                                            key={value}
                                            selectable
                                            selected={tempFilters[field]?.includes(value)}
                                            onClick={(e) => {
                                                e.preventDefault(); // Prevent default menu-closing behavior
                                                e.stopPropagation(); // Stop click event propagation
                                                toggleTempFilterValue(field, value);
                                            }}
                                        >
                                            {value}
                                        </Menu.Item>
                                    ))}
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            padding: '8px',
                                        }}
                                    >
                                        <Button
                                            className="knapp-uppdatera"
                                            label="Applicera"
                                            onClick={() => applyFilters(field)}
                                        />
                                        <Button
                                            className="knapp-uppdatera"
                                            label="Återställ"
                                            onClick={() => clearFilters(field)}
                                        />
                                    </div>
                                </Menu>
                            )}
                        </Table.HeadDropdownCell>
                    ))}
                    <Table.HeadCell>Hantera</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                    {paginatedData.map((row, index) => (
                        <React.Fragment key={index}>
                            <Table.Row
                                onClick={() => handleExpandRow(row)}
                                style={{ cursor: 'pointer' }}
                            >
                                {tableData.fields.map((field) => (
                                    <Table.Cell key={field}>
                                        {field === fieldMapping.sla && row[field] ? (
                                            <>
                                                <FaClock style={{ marginRight: '8px' }} />
                                                {row[field]}
                                            </>
                                        ) : field === fieldMapping.personal_ID && row[field] ? (
                                            <>
                                                <FaUserDoctor style={{ marginRight: '8px' }} />
                                                {row[field]}
                                            </>
                                        ) : field === fieldMapping.patient_ID && row[field] ? (
                                            <>
                                                <IoPerson style={{ marginRight: '8px' }} />
                                                {row[field]}
                                            </>
                                        ) : (
                                            row[field]
                                        )}
                                    </Table.Cell>
                                ))}
                                <Table.Cell>
                                    <Button
                                        label="Hantera"
                                        className="knapp-uppdatera"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenModal(row);
                                        }}
                                    />
                                </Table.Cell>
                            </Table.Row>
                            {expandedRow?.[fieldMapping.incident_ID] ===
                                row[fieldMapping.incident_ID] && (
                                <Table.Row>
                                    <Table.Cell colSpan={tableData.fields.length + 1}>
                                        <ExpandableRow data={row} fieldMapping={fieldMapping} />
                                    </Table.Cell>
                                </Table.Row>
                            )}
                        </React.Fragment>
                    ))}
                </Table.Body>
            </Table>
            <Paginator
                current={currentPage}
                onChange={(event, { page }) => setCurrentPage(page)}
                totalPages={Math.ceil(filteredData?.length / itemsPerPage)}
            />

            <ModalUppdatera
                isOpen={isModalOpen}
                incident={selectedIncident}
                onClose={handleCloseModal}
                onSave={handleSave}
                dataSources={dataSources}
            />
        </NextGenTableContainer>
    );
};

NextGenIncidentTabell.config = {
    dataContract: {},
    optionsSchema: {},
    key: 'splunk.NextGenIncidentTabell',
    name: 'NextGenIncidentTabell',
};

NextGenIncidentTabell.propTypes = {
    ...SplunkVisualization.propTypes,
};

NextGenIncidentTabell.defaultProps = {
    ...SplunkVisualization.defaultProps,
};

export default NextGenIncidentTabell;
