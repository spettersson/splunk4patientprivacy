import styled from 'styled-components';
import { variables, mixins } from '@splunk/themes';

const DashboardContainer = styled.div`
    overflow: hidden;
    width: 100vw;
    height: 100vh;
    background-color: #f5f5f5;
`;

const DashboardHeader = styled.div`
    font-family: Arial; sans-serif;
    background-color: #8c99a1;
    padding: ${variables.spacingXLarge};
    box-sizing: border-box;

    && h1 {
        margin-top: 0px;
        font-size: 30px;
        font-weight: bold;
        color: #fff;
    }

    && p {
        margin: 0;
        font-size: 14px;
        color: #fff;
    }
`;

export { DashboardContainer, DashboardHeader };
