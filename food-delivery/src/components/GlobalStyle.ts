// src/GlobalStyle.ts
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    margin: 0;
    font-family: Arial, sans-serif;
    transition: background-color 0.3s, color 0.3s;
  }

  button {
    background-color: ${({ theme }) => theme.buttonBackground};
    color: ${({ theme }) => theme.text};
    border: none;
    border-radius: 5px;
    padding: 10px;
    cursor: pointer;

    &:hover {
      background-color: ${({ theme }) => theme.buttonHover};
    }
  }
`;

export default GlobalStyle;
