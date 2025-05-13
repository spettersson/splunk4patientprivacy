import styled, { createGlobalStyle } from 'styled-components';
import OriginalTable from '@splunk/react-ui/Table';
import OriginalMenu from '@splunk/react-ui/Menu';
import { variables } from '@splunk/themes';

const GlobalStyles = createGlobalStyle`

    .knapp-uppdatera {
        display: flex;
        padding: 4px 20px;
        border-radius: 50px 0 50px 50px;
        border: 2px solid #002D5A;
        color: #002D5A !important;
        background-color: white !important;
        font-weight: 700;
        justify-content: center;
        width:fit-content;
    }
    .knapp-uppdatera:hover {
        text-decoration: underline;
        background-color: #E9F3F8 !important;
    }

    

`;

const NextGenTableContainer = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: end;
    gap: 1rem;
    padding: 1rem;
    box-sizing: border-box;
`;

/* Rename StyledTable to Table */
const Table = styled(OriginalTable)`
    flex-grow: 1;
    overflow: auto;

    td {
        color: #002c5a;
        text-align: left;
        padding: 8px;
    }

    th {
        padding: 0 !important; /* Force removal of padding from <th> */
        position: relative; /* Ensure child <div> can stretch fully */
        cursor: default;
    }

    th div {
        background-color: rgb(82, 94, 107) !important; /* Override any default background */
        font-weight: bold;
        text-align: left !important;
        padding: 8px;
        border-right: 1px solid #e7f4f9;
        height: 100%; /* Ensure the <div> fills the <th> */
        display: flex; /* Ensure proper alignment */
        align-items: center; /* Center vertically */
        justify-content: flex-start; /* Align content to the left */
    }

    th div span {
        color: white !important; /* Force text color */
        text-align: left !important;
        display: inline-block; /* Ensure proper rendering of span */
    }
    /* Apply hover and pointer styles only for filterable columns */
    th.filterable {
        cursor: pointer; /* Change to pointer only for filterable columns */
    }

    /* Apply hover styles only for filterable columns */
    th.filterable:hover div {
        background-color: #9ad2f6 !important;
    }

    th.filterable:hover div span {
        color: #2f527c !important;
        text-decoration: underline;
    }

    th:last-child {
        border-right: none;
    }
`;

/* Rename StyledMenu to Menu */
const Menu = styled(OriginalMenu)`
    background-color: white;
    width: 300px;
`;

const StyledMenuHeading = styled(Menu.Heading)`
    font-weight: bold;
    font-size: 12px;
    color: #002c5a;
    padding: 12px 16px;
    background-color: white;
    margin: 0;
    height: 50px;
`;

const QuestionIconWrapper = styled.div`
    margin-left: 6px;
    display: flex;
    align-items: center;

    svg {
        cursor: pointer;
        fill: black; /* Default color */
    }
`;

export { Table, Menu, GlobalStyles, StyledMenuHeading, QuestionIconWrapper, NextGenTableContainer };
