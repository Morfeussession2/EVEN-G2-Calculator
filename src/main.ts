import { CalculatorEngine } from "./calculator/CalculatorEngine";
import { EvenConnection } from "./even/EvenConnection";
import { EvenDisplay } from "./even/EvenDisplay";
import { LauncherUI } from "./launcher/LauncherUI";
import "./styles.css";

const connection = new EvenConnection();
const display = new EvenDisplay(connection);
const calculator = new CalculatorEngine();

new LauncherUI(connection, display, calculator);
