import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Import the intl-tel-input CSS
import "intl-tel-input/build/css/intlTelInput.css";
// Import the dev tools and initialize them
/* import { TempoDevtools } from 'tempo-devtools'; [deprecated] */
/* TempoDevtools.init() [deprecated] */;

createRoot(document.getElementById("root")!).render(<App />);
