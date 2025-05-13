import styled from 'styled-components';

const ExpandableRowContainer = styled.div`
    background-color: white;
    padding: 16px;
    border-radius: 8px;

    && h4 {
        color: #002d5a; /* Example color for heading */
        margin-bottom: 0px;
    }
    && p {
        color: black;
        margin: 4px 0;
    }
`;

export { ExpandableRowContainer };
