import styled from 'styled-components';

const StatusUpdateContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    border-bottom: 1px solid black;
    gap: 0.5rem;
    width: 100%;
`;
const StatusUpdateHeader = styled.div`
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    color: #0f2c57;

    && div {
        display: flex;
        alignitems: center;
    }

    && svg {
        margin-right: 8px;
        color: #0f2c57;
    }
`;
const StatusUpdateComment = styled.div`
    max-width: 70%;
    overflow-wrap: break-word;
    // margin-left: 10px;
`;

const StatusUpdateStatus = styled.div`
    // margin-left: 10px;
`;
const IncidentTimelineContainer = styled.div`
    max-height: 50vh;
    overflow: scroll;
    gap: 1rem;
    color: black;
`;

const IncidentTimelineHeader = styled.h3`
    color: #0f2c57;
    font-size: 20px;
`;

export {
    StatusUpdateContainer,
    StatusUpdateHeader,
    StatusUpdateComment,
    StatusUpdateStatus,
    IncidentTimelineContainer,
    IncidentTimelineHeader,
};
