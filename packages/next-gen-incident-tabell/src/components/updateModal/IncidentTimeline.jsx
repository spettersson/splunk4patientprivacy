import React, { useState, useEffect } from 'react';
import SearchJob from '@splunk/search-job';
import {
    IncidentTimelineContainer,
    IncidentTimelineHeader,
    StatusUpdateComment,
    StatusUpdateContainer,
    StatusUpdateHeader,
    StatusUpdateStatus,
} from './IncidentTimelineStyles';
import { FaUserCircle } from 'react-icons/fa';

const IncidentTimeline = ({ incident }) => {
    const [events, setEvents] = useState([]);
    useEffect(() => {
        const mySearchJob = SearchJob.create({
            search: `index=incidentuppdatering incident_ID=${incident?.incident_ID} user | sort by info_search_time | reverse | table updated_status, comment_made, info_search_time, user`,
        });
        mySearchJob.getResults().subscribe((results) => {
            setEvents(results?.results);
        });
    }, [incident]);
    return (
        <>
            <IncidentTimelineHeader>Historik</IncidentTimelineHeader>
            <IncidentTimelineContainer>
                {events?.map((v, i) => (
                    <StatusUpdate event={v} key={i} />
                ))}
            </IncidentTimelineContainer>{' '}
        </>
    );
};
const StatusUpdate = ({ event }) => {
    return (
        <StatusUpdateContainer>
            <StatusUpdateHeader>
                <div>
                    <FaUserCircle size={20} />
                    <span>{event?.user}</span>
                </div>
                <div>{new Date(event?.info_search_time * 1000)?.toLocaleString()}</div>
            </StatusUpdateHeader>
            <StatusUpdateStatus>
                <strong>Ny status: </strong>
                {event?.updated_status}
            </StatusUpdateStatus>
            <StatusUpdateComment>
                <strong>Kommentar: </strong>
                {event?.comment_made}
            </StatusUpdateComment>
        </StatusUpdateContainer>
    );
};

export default IncidentTimeline;
