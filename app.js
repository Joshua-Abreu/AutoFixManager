import express from "express";
import {engine} from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import sequelize from "./utils/database.js";
import Marca from "./models/Marca.js";
import marcasRoutes from "./routes/marcas.routes.js";
import Servicio from "./models/Servicio.js";
import serviciosRoutes from "./routes/servicios.routes.js";
import Pieza from "./models/Pieza.js";
import piezasRoutes from "./routes/piezas.routes.js";
import Vehiculo from "./models/Vehiculo.js";
import vehiculosRoutes from "./routes/vehiculos.routes.js";
import OrdenTrabajo from './models/OrdenTrabajo.js';
import OrdenServicio from './models/OrdenServicio.js';
import OrdenPieza from './models/OrdenPieza.js';
import Evidencia from './models/Evidencia.js';
import ordenesRoutes from "./routes/ordenes.routes.js";
import homeRoutes from './routes/home.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

//render engine
app.engine("hbs", engine({
    extname: ".hbs",
    defaultLayout: "layout",
    layoutsDir: path.join(__dirname, "views", "layouts"),
    helpers: {
        eq: (a, b) => a === b,
        toString: (value) => String(value),
        formatMoney: (amount) => {
            if (amount === null || amount === undefined || isNaN(amount)) return "0.00";
            return parseFloat(amount).toFixed(2);
        }
    }
}));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

//rutas
app.use("/marcas", marcasRoutes);
app.use("/servicios", serviciosRoutes);
app.use("/piezas", piezasRoutes);
app.use("/vehiculos", vehiculosRoutes);
app.use("/ordenes", ordenesRoutes);
app.use('/', homeRoutes);
//sync sequelize  y correr server
sequelize.sync({ force: false })
    .then(() => {
        console.log(`Base de datos conectada en entorno: ${process.env.NODE_ENV}`);
        app.listen(PORT, () => {
            console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error("Error al conectar con la base de datos: ", err);
    });