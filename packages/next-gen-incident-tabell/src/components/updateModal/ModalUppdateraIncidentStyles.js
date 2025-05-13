import styled, { createGlobalStyle } from 'styled-components';
import Paragraph from '@splunk/react-ui/Paragraph';
import Button from '@splunk/react-ui/Button';

const GlobalStyles = createGlobalStyle`
    .modal-header {
        background-color: #002C5A;
    }
    .modal-header h2{
        color: white !important;
    }
    .modal-header p{
        color: white !important;
    }
    .modal-header svg{
        color: white !important;
    }
`;

const StyledButton = styled(Button)`
    display: inline-block;
    padding: 8px 20px;
    border-radius: 50px 0 50px 50px;
    border: 2px solid #002d5a;
    color: #002d5a !important;
    background-color: white !important;
    font-weight: 700;
    justify-content: center;
    text-align: center;

    :hover {
        text-decoration: underline;
        background-color: #e9f3f8 !important;
    }
`;

export const ResizableTextAreaWrapper = styled.div`
    position: relative;
    display: flex;

    textarea {
        resize: vertical;
        width: 100%;
        min-height: 100px;
        max-height: 100%;
        padding: 10px;
        box-sizing: border-box;
    }
`;

export const StyledParagraph = styled(Paragraph)`
    font-size: 14px;
    color: #333;
    line-height: 1.5;

    strong {
        font-weight: bold;
        font-size: 14px;
        color: black;
    }

    span {
        color: #555; /* Grayish color for the value */
        font-weight: normal;
        font-size: 12px;
    }
`;

export { GlobalStyles, StyledButton };
